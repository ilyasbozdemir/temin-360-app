/**
 * GLOBAL_THEME: Tüm şablonlarda tutarlılık sağlayan merkezi tema
 */

export interface DocumentTypographyConfig {
  fontFamily: string
  baseFontSize: string
  lineHeight: number
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
  }
  fontWeight: {
    normal: number
    semibold: number
    bold: number
  }
}

export interface DocumentColorsConfig {
  text: string
  textLight: string
  textMuted: string
  border: string
  borderLight: string
  headerBg: string
  accentLine: string
  white: string
  black: string
}

export interface DocumentPageMarginsConfig {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DocumentPageConfig {
  format: string
  width: string
  height: string
  margins: DocumentPageMarginsConfig
  printableHeight: number
}

export interface DocumentTableConfig {
  borderCollapse: string
  fontSize: string
  cellPadding: string
  headerBgColor: string
  headerFontWeight: string
  headerTextAlign: string
  borderColor: string
  borderWidth: string
}

export interface DocumentSpacingConfig {
  headerHeight: string
  footerHeight: string
  approvalSpacing: string
  marginBottom: string
  marginTop: string
  titleMargin: string
}

export interface DocumentThemeConfig {
  typography: DocumentTypographyConfig
  colors: DocumentColorsConfig
  page: DocumentPageConfig
  table: DocumentTableConfig
  spacing: DocumentSpacingConfig
  summary?: {
    description?: string
    lastUpdated?: string
  }
}

export const GLOBAL_THEME: DocumentThemeConfig = {
  typography: {
    fontFamily: "'Times New Roman', Times, serif",
    baseFontSize: '12pt',
    lineHeight: 1.5,
    fontSize: {
      xs: '8pt',
      sm: '10pt',
      base: '12pt',
      lg: '14pt',
      xl: '16pt',
      '2xl': '18pt'
    },
    fontWeight: {
      normal: 400,
      semibold: 600,
      bold: 700
    }
  },
  colors: {
    text: '#000000',
    textLight: '#333333',
    textMuted: '#666666',
    border: '#333333',
    borderLight: '#999999',
    headerBg: '#ffffff',
    accentLine: '#cc0000',
    white: '#ffffff',
    black: '#000000'
  },
  page: {
    format: 'A4',
    width: '21cm',
    height: '29.7cm',
    margins: {
      top: 1.5,
      right: 1.5,
      bottom: 1.5,
      left: 1.5
    },
    printableHeight: 890
  },
  table: {
    borderCollapse: 'collapse',
    fontSize: '10pt',
    cellPadding: '6px',
    headerBgColor: '#f2f2f2',
    headerFontWeight: 'bold',
    headerTextAlign: 'center',
    borderColor: '#333333',
    borderWidth: '1px'
  },
  spacing: {
    headerHeight: '80px',
    footerHeight: '60px',
    approvalSpacing: '40px',
    marginBottom: '20px',
    marginTop: '20px',
    titleMargin: '20px 0'
  },
  summary: {
    description: 'Tüm şablonlarda tutarlı görünüm.',
    lastUpdated: new Date().toISOString()
  }
}

export const DEFAULT_DOCUMENT_THEME = GLOBAL_THEME

/**
 * createDocumentTheme: Verilen özel tema veya DB JSON'unu varsayılan GLOBAL_THEME ile birleştirir.
 */
export function createDocumentTheme(
  customTheme?: Partial<DocumentThemeConfig> | string | null
): DocumentThemeConfig {
  if (!customTheme) return { ...GLOBAL_THEME }

  let parsed: Partial<DocumentThemeConfig> = {}
  if (typeof customTheme === 'string') {
    try {
      parsed = JSON.parse(customTheme)
    } catch {
      return { ...GLOBAL_THEME }
    }
  } else {
    parsed = customTheme
  }

  return {
    ...GLOBAL_THEME,
    ...parsed,
    typography: {
      ...GLOBAL_THEME.typography,
      ...(parsed.typography || {}),
      fontSize: {
        ...GLOBAL_THEME.typography.fontSize,
        ...(parsed.typography?.fontSize || {})
      },
      fontWeight: {
        ...GLOBAL_THEME.typography.fontWeight,
        ...(parsed.typography?.fontWeight || {})
      }
    },
    colors: {
      ...GLOBAL_THEME.colors,
      ...(parsed.colors || {})
    },
    page: {
      ...GLOBAL_THEME.page,
      ...(parsed.page || {}),
      margins: {
        ...GLOBAL_THEME.page.margins,
        ...(parsed.page?.margins || {})
      }
    },
    table: {
      ...GLOBAL_THEME.table,
      ...(parsed.table || {})
    },
    spacing: {
      ...GLOBAL_THEME.spacing,
      ...(parsed.spacing || {})
    },
    summary: {
      ...GLOBAL_THEME.summary,
      ...(parsed.summary || {})
    }
  }
}
