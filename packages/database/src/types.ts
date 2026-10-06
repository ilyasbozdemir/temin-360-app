/** Veritabanı tablo kolon tanımı arabirimi. */
export interface TableColumn {
  /** Kolon adı. */
  name: string
  /** SQLite veri tipi (INTEGER, TEXT, REAL, DATETIME vb.). */
  type: string
  /** Kolon kısıtlamaları (PRIMARY KEY, NOT NULL vb.). */
  constraints?: string[]
  /** Kolon varsayılan değeri. */
  defaultValue?: string
}

/** Veritabanı tablo indeks tanımı arabirimi. */
export interface TableIndex {
  /** İndeks oluşturulacak kolon adları. */
  columns: string[]
  /** İndeksin benzersiz (UNIQUE) olup olmadığını belirtir. */
  unique?: boolean
}

/** Veritabanı tablo şeması tanımı arabirimi. */
export interface TableSchema {
  /** Tablo adı. */
  name: string
  /** Tablo işlev açıklaması. */
  description?: string
  /** Tabloda yer alan kolonların listesi. */
  columns: TableColumn[]
  /** Denetim/audit kolonlarının (created_at, updated_at vb.) otomatik eklenip eklenmeyeceği. */
  hasAudit?: boolean
  /** Tabloya tanımlı indeks listesi. */
  indexes?: TableIndex[]
}

