/**
 * TEMİN 360 - GÜVENLİ FORMÜL VE İFADE ÇÖZÜMLEME MOTORU (SAFE FORMULA PARSER)
 *
 * Kesinlikle `eval()` veya `new Function()` KULLANMAZ!
 * Tokenizer -> Recursive Descent Parser -> AST Evaluator mimarisiyle
 * matematiksel ifadeleri, mantıksal koşulları ve ihale fonksiyonlarını
 * %100 güvenli bir şekilde çalıştırır.
 *
 * Desteklenen Fonksiyonlar:
 * - Matematiksel: min(), max(), yuvarla(), tavan(), taban(), mutlak()
 * - Mantıksal: eger(kosul, dogruDeger, yanlisDeger)
 * - İstatistik: topla(), ortalama(), medyan()
 * - Parametre / Eşik: parametre("oran_adi"), esik("esik_adi")
 * - Süre / Takvim: is_gunu_ekle(tarih, gun_sayisi)
 * - Metin / Mevzuat: yaziyla(tutar)
 */

import { getVergiOranlari, getEsikDegerler } from '../ihale/parametreDeposu'
import { roundKurus, roundToPrecision } from '../ihale/paraVeYuvarlamaUtils'
import { amountToWordsTL } from '../sayiyiYaziyaCevir'
import { ekleIsGunu } from '../ihale/sureHesaplayici'

export type ValueType = number | string | boolean | Date | null

export interface FormulaContext {
  degiskenler?: Record<string, ValueType>
  yil?: number
  formulDeposu?: Record<string, string> // Diğer formülleri çağırmak için
}

export type ASTNode =
  | { type: 'NUMBER'; value: number }
  | { type: 'STRING'; value: string }
  | { type: 'BOOLEAN'; value: boolean }
  | { type: 'IDENTIFIER'; name: string }
  | {
      type: 'BINARY_OP'
      op:
        | '+'
        | '-'
        | '*'
        | '/'
        | '%'
        | '>'
        | '<'
        | '>='
        | '<='
        | '=='
        | '!='
        | 'VE'
        | 'VEYA'
        | '&&'
        | '||'
      left: ASTNode
      right: ASTNode
    }
  | { type: 'UNARY_OP'; op: '-' | '!'; expr: ASTNode }
  | { type: 'FUNCTION_CALL'; name: string; args: ASTNode[] }

/**
 * 1. TOKENIZER (Lexer)
 */
type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF'

interface Token {
  type: TokenType
  value: string | number
  pos: number
}

export function tokenizeFormula(expr: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  const input = expr.trim()

  while (pos < input.length) {
    const ch = input[pos]

    // Boşlukları atla
    if (/\s/.test(ch)) {
      pos++
      continue
    }

    // Sayılar (123, 123.45)
    if (/\d/.test(ch)) {
      let numStr = ''
      const start = pos
      while (pos < input.length && /[\d.]/.test(input[pos])) {
        numStr += input[pos]
        pos++
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr), pos: start })
      continue
    }

    // Tırnak içindeki metinler ("damga_orani", 'TL')
    if (ch === '"' || ch === "'") {
      const quote = ch
      let str = ''
      const start = pos
      pos++ // açılış tırnağını geç
      while (pos < input.length && input[pos] !== quote) {
        str += input[pos]
        pos++
      }
      pos++ // kapanış tırnağını geç
      tokens.push({ type: 'STRING', value: str, pos: start })
      continue
    }

    // Parantez ve Virgül
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', pos })
      pos++
      continue
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', pos })
      pos++
      continue
    }
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ',', pos })
      pos++
      continue
    }

    // İki karakterli operatörler (>=, <=, ==, !=, &&, ||)
    const twoChars = input.substring(pos, pos + 2)
    if (['>=', '<=', '==', '!=', '&&', '||'].includes(twoChars)) {
      tokens.push({ type: 'OPERATOR', value: twoChars, pos })
      pos += 2
      continue
    }

    // Tek karakterli operatörler (+, -, *, /, %, >, <, !)
    if (['+', '-', '*', '/', '%', '>', '<', '!'].includes(ch)) {
      tokens.push({ type: 'OPERATOR', value: ch, pos })
      pos++
      continue
    }

    // Kelimeler (Değişkenler, Fonksiyon adları, VE, VEYA)
    if (/[a-zA-Z_ğüşıöçĞÜŞİÖÇ]/.test(ch)) {
      let ident = ''
      const start = pos
      while (pos < input.length && /[a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]/.test(input[pos])) {
        ident += input[pos]
        pos++
      }

      const upperIdent = ident.toUpperCase()
      if (upperIdent === 'VE') {
        tokens.push({ type: 'OPERATOR', value: '&&', pos: start })
      } else if (upperIdent === 'VEYA') {
        tokens.push({ type: 'OPERATOR', value: '||', pos: start })
      } else if (upperIdent === 'DOĞRU' || upperIdent === 'DOGRU' || upperIdent === 'TRUE') {
        tokens.push({ type: 'NUMBER', value: 1, pos: start })
      } else if (upperIdent === 'YANLIŞ' || upperIdent === 'YANLIS' || upperIdent === 'FALSE') {
        tokens.push({ type: 'NUMBER', value: 0, pos: start })
      } else {
        tokens.push({ type: 'IDENTIFIER', value: ident, pos: start })
      }
      continue
    }

    // Tanınmayan karakter
    pos++
  }

  tokens.push({ type: 'EOF', value: '', pos })
  return tokens
}

/**
 * 2. PARSER (Recursive Descent Parser -> AST)
 */
class FormulaParser {
  private tokens: Token[]
  private cursor = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private current(): Token {
    return this.tokens[this.cursor] || { type: 'EOF', value: '', pos: 0 }
  }

  private eat(type?: TokenType, value?: string): Token {
    const tok = this.current()
    if (type && tok.type !== type) {
      throw new Error(`Beklenen token türü ${type}, bulunan ${tok.type} (pozisyon: ${tok.pos})`)
    }
    if (value && tok.value !== value) {
      throw new Error(`Beklenen '${value}', bulunan '${tok.value}' (pozisyon: ${tok.pos})`)
    }
    this.cursor++
    return tok
  }

  public parse(): ASTNode {
    const node = this.parseLogicalOr()
    if (this.current().type !== 'EOF') {
      throw new Error(
        `Formül sonu beklenirken fazlalık karakterler bulundu (pozisyon: ${this.current().pos})`
      )
    }
    return node
  }

  private parseLogicalOr(): ASTNode {
    let left = this.parseLogicalAnd()
    while (this.current().value === '||' || this.current().value === 'VEYA') {
      const op = this.eat().value as any
      const right = this.parseLogicalAnd()
      left = { type: 'BINARY_OP', op: '||', left, right }
    }
    return left
  }

  private parseLogicalAnd(): ASTNode {
    let left = this.parseComparison()
    while (this.current().value === '&&' || this.current().value === 'VE') {
      const op = this.eat().value as any
      const right = this.parseComparison()
      left = { type: 'BINARY_OP', op: '&&', left, right }
    }
    return left
  }

  private parseComparison(): ASTNode {
    let left = this.parseAdditive()
    while (['>', '<', '>=', '<=', '==', '!='].includes(String(this.current().value))) {
      const op = this.eat().value as any
      const right = this.parseAdditive()
      left = { type: 'BINARY_OP', op, left, right }
    }
    return left
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative()
    while (this.current().value === '+' || this.current().value === '-') {
      const op = this.eat().value as any
      const right = this.parseMultiplicative()
      left = { type: 'BINARY_OP', op, left, right }
    }
    return left
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parseUnary()
    while (['*', '/', '%'].includes(String(this.current().value))) {
      const op = this.eat().value as any
      const right = this.parseUnary()
      left = { type: 'BINARY_OP', op, left, right }
    }
    return left
  }

  private parseUnary(): ASTNode {
    if (this.current().value === '-' || this.current().value === '!') {
      const op = this.eat().value as any
      const expr = this.parsePrimary()
      return { type: 'UNARY_OP', op, expr }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): ASTNode {
    const tok = this.current()

    if (tok.type === 'NUMBER') {
      this.eat()
      return { type: 'NUMBER', value: Number(tok.value) }
    }

    if (tok.type === 'STRING') {
      this.eat()
      return { type: 'STRING', value: String(tok.value) }
    }

    if (tok.type === 'LPAREN') {
      this.eat('LPAREN')
      const expr = this.parseLogicalOr()
      this.eat('RPAREN')
      return expr
    }

    if (tok.type === 'IDENTIFIER') {
      const name = String(this.eat().value)

      // Fonksiyon çağrısı mı? (Fonksiyon adından sonra '(' geliyor mu?)
      if (this.current().type === 'LPAREN') {
        this.eat('LPAREN')
        const args: ASTNode[] = []
        if (this.current().type !== 'RPAREN') {
          args.push(this.parseLogicalOr())
          while (this.current().type === 'COMMA') {
            this.eat('COMMA')
            args.push(this.parseLogicalOr())
          }
        }
        this.eat('RPAREN')
        return { type: 'FUNCTION_CALL', name, args }
      }

      return { type: 'IDENTIFIER', name }
    }

    throw new Error(`Beklenmeyen token: ${tok.value} (pozisyon: ${tok.pos})`)
  }
}

/**
 * 3. EVALUATOR (AST Değerlendirici)
 */
export function evaluateAST(
  node: ASTNode,
  context: FormulaContext = {},
  callStack: Set<string> = new Set()
): ValueType {
  const yil = context.yil || new Date().getFullYear()

  switch (node.type) {
    case 'NUMBER':
      return node.value
    case 'STRING':
      return node.value
    case 'BOOLEAN':
      return node.value

    case 'IDENTIFIER': {
      const varName = node.name
      // 1. Önce değişkenler içinde ara
      if (context.degiskenler && varName in context.degiskenler) {
        return context.degiskenler[varName]
      }
      // 2. Diğer bir formül mü?
      if (context.formulDeposu && varName in context.formulDeposu) {
        if (callStack.has(varName)) {
          throw new Error(
            `Döngüsel Formül Bağımlılığı Tespit Edildi: ${Array.from(callStack).join(' -> ')} -> ${varName}`
          )
        }
        const subStack = new Set(callStack)
        subStack.add(varName)
        const subFormula = context.formulDeposu[varName]
        const tokens = tokenizeFormula(subFormula)
        const parser = new FormulaParser(tokens)
        return evaluateAST(parser.parse(), context, subStack)
      }
      return 0 // Bulunamayan değişken için varsayılan 0
    }

    case 'UNARY_OP': {
      const val = evaluateAST(node.expr, context, callStack)
      if (node.op === '-') return -(Number(val) || 0)
      if (node.op === '!') return !val
      return val
    }

    case 'BINARY_OP': {
      const left = evaluateAST(node.left, context, callStack)
      const right = evaluateAST(node.right, context, callStack)

      const numL = Number(left) || 0
      const numR = Number(right) || 0

      switch (node.op) {
        case '+':
          if (typeof left === 'string' || typeof right === 'string') {
            return String(left) + String(right)
          }
          return numL + numR
        case '-':
          return numL - numR
        case '*':
          return numL * numR
        case '/':
          return numR !== 0 ? numL / numR : 0
        case '%':
          return numR !== 0 ? numL % numR : 0
        case '>':
          return numL > numR
        case '<':
          return numL < numR
        case '>=':
          return numL >= numR
        case '<=':
          return numL <= numR
        case '==':
          return left == right
        case '!=':
          return left != right
        case '&&':
        case 'VE':
          return Boolean(left) && Boolean(right)
        case '||':
        case 'VEYA':
          return Boolean(left) || Boolean(right)
        default:
          return 0
      }
    }

    case 'FUNCTION_CALL': {
      const fnName = node.name.toLocaleLowerCase('tr-TR')
      const evaluatedArgs = node.args.map((arg) => evaluateAST(arg, context, callStack))

      switch (fnName) {
        case 'min':
          return Math.min(...evaluatedArgs.map(Number))
        case 'max':
          return Math.max(...evaluatedArgs.map(Number))
        case 'yuvarla':
          return roundToPrecision(Number(evaluatedArgs[0]) || 0, Number(evaluatedArgs[1]) || 2)
        case 'tavan':
          return Math.ceil(Number(evaluatedArgs[0]) || 0)
        case 'taban':
          return Math.floor(Number(evaluatedArgs[0]) || 0)
        case 'mutlak':
        case 'abs':
          return Math.abs(Number(evaluatedArgs[0]) || 0)

        // Koşul: eger(kosul, dogruysa, yanlissa)
        case 'eger':
        case 'if':
          return evaluatedArgs[0] ? evaluatedArgs[1] : evaluatedArgs[2]

        // Topla: topla(a, b, c...)
        case 'topla':
        case 'sum':
          return evaluatedArgs.reduce((acc: number, curr) => acc + (Number(curr) || 0), 0)

        // Ortalama: ortalama(a, b, c...)
        case 'ortalama':
        case 'avg': {
          if (evaluatedArgs.length === 0) return 0
          const sum = evaluatedArgs.reduce((acc: number, curr) => acc + (Number(curr) || 0), 0)
          return roundKurus(sum / evaluatedArgs.length)
        }

        // Parametre Deposundan Okuma: parametre("damga_orani")
        case 'parametre': {
          const paramKey = String(evaluatedArgs[0])
          const vergi = getVergiOranlari(yil) as any
          return vergi[paramKey] ?? 0
        }

        // Eşik Değer Deposundan Okuma: esik("dogrudanTemin22d")
        case 'esik': {
          const esikKey = String(evaluatedArgs[0])
          const esik = getEsikDegerler(yil) as any
          if (esikKey === 'dogrudanTemin22d') return esik.dogrudanTeminBuyuksehir
          if (esikKey === 'pazarlik21f') return esik.pazarlik21f
          return esik[esikKey] ?? 0
        }

        // Yazıya Çevirici: yaziyla(tutar)
        case 'yaziyla':
          return amountToWordsTL(Number(evaluatedArgs[0]) || 0)

        // İş Günü Ekle: is_gunu_ekle(tarih, gunSayisi)
        case 'is_gunu_ekle': {
          const tarih = evaluatedArgs[0] ? new Date(String(evaluatedArgs[0])) : new Date()
          const gun = Number(evaluatedArgs[1]) || 0
          return ekleIsGunu(tarih, gun).toISOString().split('T')[0]
        }

        default:
          throw new Error(`Bilinmeyen fonksiyon: ${node.name}`)
      }
    }
  }
}

/**
 * Tek satırda güvenli formül çalıştırıcı
 */
export function calistirFormul(
  formulaStr: string,
  context: FormulaContext = {}
): { success: boolean; result: ValueType; error?: string } {
  try {
    const tokens = tokenizeFormula(formulaStr)
    const parser = new FormulaParser(tokens)
    const ast = parser.parse()
    const result = evaluateAST(ast, context)
    return { success: true, result }
  } catch (err: any) {
    return {
      success: false,
      result: null,
      error: err.message || 'Formül hesaplanırken hata oluştu.'
    }
  }
}
