export const TANIM_ButceKod = {
  name: 'TANIM_ButceKod',
  description: 'Analitik Bütçe Sınıflandırması Ekonomik Kodları ve Harcama Tertipleri (1, 2, 3, 4. Düzey)',
  columns: [
    { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
    { name: 'kod', type: 'TEXT', unique: true, notNull: true, description: 'Bütçe Tertip / Ekonomik Kod' }, // örn: 03.2.1.01
    { name: 'duzey_1', type: 'TEXT', description: '1. Düzey Kod' }, // örn: 03
    { name: 'duzey_2', type: 'TEXT', description: '2. Düzey Kod' }, // örn: 03.2
    { name: 'duzey_3', type: 'TEXT', description: '3. Düzey Kod' }, // örn: 03.2.1
    { name: 'duzey_4', type: 'TEXT', description: '4. Düzey Kod' }, // örn: 03.2.1.01
    { name: 'duzey', type: 'INTEGER', default: 4, description: 'Kod Düzeyi (1, 2, 3, 4)' },
    { name: 'hesap_kodu', type: 'TEXT', description: 'Muhasebe / Analitik Hesap Kodu' },
    { name: 'hesap_adi', type: 'TEXT', notNull: true, description: 'Hesap / Kalem Adı' },
    { name: 'butce_turu', type: 'TEXT', default: "'Mal Alımı'", description: 'Alım / Bütçe Türü (Mal Alımı, Hizmet Alımı, Yapım İşi, Danışmanlık)' },
    { name: 'aciklama', type: 'TEXT', description: 'Açıklama ve Kullanım Alanı' },
    { name: 'aktif_mi', type: 'INTEGER', default: 1, description: 'Aktif Durum' },
    {
      name: 'created_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Created At'
    },
    {
      name: 'updated_at',
      type: 'DATETIME',
      default: 'CURRENT_TIMESTAMP',
      description: 'Updated At'
    }
  ],
  initialData: [
    // 1. Düzey
    { kod: '03', duzey_1: '03', duzey: 1, hesap_kodu: '03', hesap_adi: 'Mal ve Hizmet Alım Giderleri', butce_turu: 'Genel', aciklama: 'Üretim ve tüketim faaliyetleri için yapılan mal ve hizmet alımları.' },
    { kod: '06', duzey_1: '06', duzey: 1, hesap_kodu: '06', hesap_adi: 'Sermaye Giderleri', butce_turu: 'Yapım İşi', aciklama: 'Gayrimenkul, makine-teçhizat ve altyapı yatırımları.' },
    
    // 2. Düzey
    { kod: '03.2', duzey_1: '03', duzey_2: '03.2', duzey: 2, hesap_kodu: '03.2', hesap_adi: 'Tüketime Yönelik Mal ve Malzeme Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kırtasiye, akaryakıt, elektrik, su ve temizlik alımları.' },
    { kod: '03.5', duzey_1: '03', duzey_2: '03.5', duzey: 2, hesap_kodu: '03.5', hesap_adi: 'Hizmet Alımları', butce_turu: 'Hizmet Alımı', aciklama: 'Bakım-onarım, haberleşme, kiralama ve müşavirlik hizmetleri.' },
    { kod: '03.7', duzey_1: '03', duzey_2: '03.7', duzey: 2, hesap_kodu: '03.7', hesap_adi: 'Menkul Mal, Gayrimaddi Hak Alım, Bakım ve Onarım', butce_turu: 'Mal Alımı', aciklama: 'Büro ve işyeri donanımı, bilgisayar ve yazılım alımları.' },
    { kod: '06.1', duzey_1: '06', duzey_2: '06.1', duzey: 2, hesap_kodu: '06.1', hesap_adi: 'Mamul Mal Alımları', butce_turu: 'Mal Alımı', aciklama: 'Taşıt, iş makinesi ve büyük teçhizat alımları.' },
    { kod: '06.5', duzey_1: '06', duzey_2: '06.5', duzey: 2, hesap_kodu: '06.5', hesap_adi: 'Gayrimenkul Sermaye Üretim Giderleri', butce_turu: 'Yapım İşi', aciklama: 'Bina, yol, köprü ve altyapı inşaat yapım işleri.' },

    // 3. Düzey
    { kod: '03.2.1', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey: 3, hesap_kodu: '03.2.1', hesap_adi: 'Kırtasiye, Yayın ve Büro Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kırtasiye ve ofis sarf malzemesi giderleri.' },
    { kod: '03.2.2', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.2', duzey: 3, hesap_kodu: '03.2.2', hesap_adi: 'Su ve Temizlik Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Şebeke suyu, ambalajlı su ve temizlik maddeleri.' },
    { kod: '03.2.3', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey: 3, hesap_kodu: '03.2.3', hesap_adi: 'Enerji Alımları', butce_turu: 'Mal Alımı', aciklama: 'Elektrik, akaryakıt, kömür ve doğalgaz tüketimi.' },
    { kod: '03.2.5', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.5', duzey: 3, hesap_kodu: '03.2.5', hesap_adi: 'Giyecek ve Yiyecek Alımları', butce_turu: 'Mal Alımı', aciklama: 'Personel koruyucu giyim ve gıda alımları.' },
    { kod: '03.5.1', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.1', duzey: 3, hesap_kodu: '03.5.1', hesap_adi: 'Haberleşme Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Posta, kargo, telefon ve internet giderleri.' },
    { kod: '03.5.2', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey: 3, hesap_kodu: '03.5.2', hesap_adi: 'Taşıt, Makine ve Hizmet Binası Bakım-Onarımı', butce_turu: 'Hizmet Alımı', aciklama: 'Rutin ve periyodik bakım onarım işleri.' },
    { kod: '03.5.4', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.4', duzey: 3, hesap_kodu: '03.5.4', hesap_adi: 'İlan, Sigorta ve Tanıtım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Resmi ilan, sigorta poliçeleri ve tanıtım hizmetleri.' },
    { kod: '03.5.5', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.5', duzey: 3, hesap_kodu: '03.5.5', hesap_adi: 'Kiralama Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Hizmet aracı, iş makinesi ve bina kiralamaları.' },
    { kod: '03.7.1', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.1', duzey: 3, hesap_kodu: '03.7.1', hesap_adi: 'Büro ve İşyeri Mal ve Malzeme Alımları', butce_turu: 'Mal Alımı', aciklama: 'Masa, sandalye, dolap ve büro makineleri alımı.' },
    { kod: '03.7.2', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.2', duzey: 3, hesap_kodu: '03.7.2', hesap_adi: 'Bilgisayar, Donanım ve Yazılım Alımları', butce_turu: 'Mal Alımı', aciklama: 'Bilgisayar, sunucu, yazıcı ve yazılım lisansları.' },

    // 4. Düzey (Nihai Harcama Tertipleri)
    { kod: '03.2.1.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.01', duzey: 4, hesap_kodu: '630.03.02.01.01', hesap_adi: 'Kırtasiye Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kağıt, kalem, toner, dosya ve benzeri kırtasiye malzemeleri.' },
    { kod: '03.2.1.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.02', duzey: 4, hesap_kodu: '630.03.02.01.02', hesap_adi: 'Büro Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Hesap makinesi, zımba, delgeç ve küçük ofis gereçleri.' },
    { kod: '03.2.1.05', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.1', duzey_4: '03.2.1.05', duzey: 4, hesap_kodu: '630.03.02.01.05', hesap_adi: 'Baskı ve Cilt Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Kitap, broşür, dergi basımı ve ciltleme hizmetleri.' },
    { kod: '03.2.2.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.2', duzey_4: '03.2.2.01', duzey: 4, hesap_kodu: '630.03.02.02.01', hesap_adi: 'Su Alımları', butce_turu: 'Mal Alımı', aciklama: 'İçme suyu, damacana su ve şebeke suyu bedelleri.' },
    { kod: '03.2.2.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.2', duzey_4: '03.2.2.02', duzey: 4, hesap_kodu: '630.03.02.02.02', hesap_adi: 'Temizlik Malzemesi Alımları', butce_turu: 'Mal Alımı', aciklama: 'Deterjan, dezenfektan, sabun ve sarf temizlik ürünleri.' },
    { kod: '03.2.3.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.01', duzey: 4, hesap_kodu: '630.03.02.03.01', hesap_adi: 'Akaryakıt ve Yağ Alımları', butce_turu: 'Mal Alımı', aciklama: 'Hizmet araçları ve jeneratörler için akaryakıt ve madeni yağ alımları.' },
    { kod: '03.2.3.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.02', duzey: 4, hesap_kodu: '630.03.02.03.02', hesap_adi: 'Elektrik Alımları', butce_turu: 'Mal Alımı', aciklama: 'Kurum tesisleri ve hizmet binaları elektrik tüketim bedelleri.' },
    { kod: '03.2.3.03', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.3', duzey_4: '03.2.3.03', duzey: 4, hesap_kodu: '630.03.02.03.03', hesap_adi: 'Doğalgaz Alımları', butce_turu: 'Mal Alımı', aciklama: 'Isınma ve üretim amaçlı doğalgaz ve LPG giderleri.' },
    { kod: '03.2.5.01', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.5', duzey_4: '03.2.5.01', duzey: 4, hesap_kodu: '630.03.02.05.01', hesap_adi: 'Giyecek Alımları', butce_turu: 'Mal Alımı', aciklama: 'İş kıyafeti, önlük, çizme ve koruyucu donanım alımları.' },
    { kod: '03.2.5.02', duzey_1: '03', duzey_2: '03.2', duzey_3: '03.2.5', duzey_4: '03.2.5.02', duzey: 4, hesap_kodu: '630.03.02.05.02', hesap_adi: 'Yiyecek Alımları', butce_turu: 'Mal Alımı', aciklama: 'Yemekhane ve sosyal tesis gıda hammaddesi alımları.' },
    { kod: '03.5.1.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.1', duzey_4: '03.5.1.01', duzey: 4, hesap_kodu: '630.03.05.01.01', hesap_adi: 'Posta ve Telgraf Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Resmi posta gönderileri, tebligat ve kargo giderleri.' },
    { kod: '03.5.1.04', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.1', duzey_4: '03.5.1.04', duzey: 4, hesap_kodu: '630.03.05.01.04', hesap_adi: 'İnternet Erişim Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Metro ethernet, veri hattı ve internet abonelikleri.' },
    { kod: '03.5.2.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.01', duzey: 4, hesap_kodu: '630.03.05.02.01', hesap_adi: 'Hizmet Binası Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Boya, tadilat, tesisat ve çatı onarım hizmetleri.' },
    { kod: '03.5.2.02', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.02', duzey: 4, hesap_kodu: '630.03.05.02.02', hesap_adi: 'Taşıt Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Hizmet araçlarının periyodik bakım, parça ve işçilik giderleri.' },
    { kod: '03.5.2.03', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.03', duzey: 4, hesap_kodu: '630.03.05.02.03', hesap_adi: 'İş Makinesi Bakım ve Onarımı', butce_turu: 'Hizmet Alımı', aciklama: 'Kepçe, greyder, kamyon vb. iş makineleri revizyon giderleri.' },
    { kod: '03.5.2.90', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.2', duzey_4: '03.5.2.90', duzey: 4, hesap_kodu: '630.03.05.02.90', hesap_adi: 'Diğer Bakım ve Onarım Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Sınıflandırılmayan diğer tesis ve makine onarım işleri.' },
    { kod: '03.5.4.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.4', duzey_4: '03.5.4.01', duzey: 4, hesap_kodu: '630.03.05.04.01', hesap_adi: 'İlan ve Reklam Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Resmi Gazete ve yerel/ulusal basın ilan bedelleri.' },
    { kod: '03.5.4.02', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.4', duzey_4: '03.5.4.02', duzey: 4, hesap_kodu: '630.03.05.04.02', hesap_adi: 'Sigorta Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Kasko, trafik ve bina yangın sigorta poliçeleri.' },
    { kod: '03.5.5.01', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.5', duzey_4: '03.5.5.01', duzey: 4, hesap_kodu: '630.03.05.05.01', hesap_adi: 'Taşıt Kiralama Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Sürücülü/sürücüsüz binek ve ticari araç kiralamaları.' },
    { kod: '03.5.5.02', duzey_1: '03', duzey_2: '03.5', duzey_3: '03.5.5', duzey_4: '03.5.5.02', duzey: 4, hesap_kodu: '630.03.05.05.02', hesap_adi: 'Hizmet Binası Kiralama Giderleri', butce_turu: 'Hizmet Alımı', aciklama: 'Birimler için kiralanan gayrimenkullerin kira bedelleri.' },
    { kod: '03.7.1.01', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.1', duzey_4: '03.7.1.01', duzey: 4, hesap_kodu: '630.03.07.01.01', hesap_adi: 'Büro ve İşyeri Mal ve Malzeme Alımları', butce_turu: 'Mal Alımı', aciklama: 'Büro mobilyası, klima, perde ve ofis donanımları.' },
    { kod: '03.7.2.01', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.2', duzey_4: '03.7.2.01', duzey: 4, hesap_kodu: '630.03.07.02.01', hesap_adi: 'Bilgisayar ve Donanım Alımları', butce_turu: 'Mal Alımı', aciklama: 'Masaüstü/dizüstü bilgisayar, monitör, yazıcı ve tarayıcı alımları.' },
    { kod: '03.7.2.02', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.2', duzey_4: '03.7.2.02', duzey: 4, hesap_kodu: '630.03.07.02.02', hesap_adi: 'Yazılım ve Lisans Alımları', butce_turu: 'Hizmet Alımı', aciklama: 'İşletim sistemi, ofis paketleri ve özel yazılım lisansları.' },
    { kod: '03.7.3.01', duzey_1: '03', duzey_2: '03.7', duzey_3: '03.7.3', duzey_4: '03.7.3.01', duzey: 4, hesap_kodu: '630.03.07.03.01', hesap_adi: 'Tıbbi Cihaz ve Donanım Alımları', butce_turu: 'Mal Alımı', aciklama: 'Sağlık ve laboratuvar cihaz ve kitleri alımı.' },
    { kod: '06.1.1.01', duzey_1: '06', duzey_2: '06.1', duzey_3: '06.1.1', duzey_4: '06.1.1.01', duzey: 4, hesap_kodu: '630.06.01.01.01', hesap_adi: 'Hizmet Binası Yapım Giderleri', butce_turu: 'Yapım İşi', aciklama: 'Yeni hizmet binası ve tesis inşaat yapım işleri.' },
    { kod: '06.5.1.01', duzey_1: '06', duzey_2: '06.5', duzey_3: '06.5.1', duzey_4: '06.5.1.01', duzey: 4, hesap_kodu: '630.06.05.01.01', hesap_adi: 'Müşavirlik ve Danışmanlık Giderleri', butce_turu: 'Danışmanlık', aciklama: 'Proje, etüt, fizibilite ve kontrollük danışmanlık hizmetleri.' }
  ]
}
