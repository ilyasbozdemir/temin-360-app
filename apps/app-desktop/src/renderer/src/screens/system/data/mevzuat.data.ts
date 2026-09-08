export interface MevzuatMadde {
  no: string
  baslik: string
  metin: string
  ozet?: string
}

export interface MevzuatItem {
  id: string
  baslik: string
  kisaBaslik?: string
  kategori: 'Kanun' | 'Yönetmelik' | 'Muayene ve Kabul' | 'Tebliğ' | 'Esaslar ve Fiyat Farkı' | 'Şartname'
  resmiGazete?: string
  kanunNo?: string
  mevzuatGovTrUrl?: string
  aciklama: string
  maddeler: MevzuatMadde[]
}

export const MEVZUAT_KUTUPHANESI: MevzuatItem[] = [
  // 1. KANUNLAR
  {
    id: 'kamu-ihale-kanunu',
    baslik: '4734 Sayılı Kamu İhale Kanunu',
    kisaBaslik: '4734 KİK',
    kanunNo: '4734',
    kategori: 'Kanun',
    resmiGazete: '22.01.2002 / 24648',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4734&MevzuatTur=1&MevzuatTertip=5',
    aciklama: 'Kamu hukukuna tabi olan veya kamunun denetimi altında bulunan idarelerin yapacakları ihalelerde uygulanacak esas ve usuller.',
    maddeler: [
      {
        no: 'Madde 1',
        baslik: 'Amaç',
        metin: 'Bu Kanunun amacı, kamu hukukuna tâbi olan veya kamunun denetimi altında bulunan veyahut kamu kaynağı kullanan kamu kurum ve kuruluşlarının yapacakları ihalelerde uygulanacak esas ve usulleri belirlemektir.'
      },
      {
        no: 'Madde 2',
        baslik: 'Kapsam',
        metin: 'Genel bütçe kapsamındaki kamu idareleri ile özel bütçeli idareler, il özel idareleri ve belediyeler ile bunlara bağlı döner sermayeli kuruluşlar, birlikler, KİT\'ler, fonlar ve kamu kaynağı kullanan diğer kuruluşların mal veya hizmet alımları ile yapım işleri ihaleleri bu Kanun hükümlerine göre yürütülür.'
      },
      {
        no: 'Madde 5',
        baslik: 'Temel İlkeler',
        metin: 'İdareler, bu Kanuna göre yapılacak ihalelerde; saydamlığı, rekabeti, eşit muameleyi, güvenirliği, gizliliği, kamuoyu denetimini, ihtiyaçların uygun şartlarla ve zamanında karşılanmasını ve kaynakların verimli kullanılmasını sağlamakla sorumludur. Aralarında kabul edilebilir doğal bir bağlantı olmadığı sürece mal alımı, hizmet alımı ve yapım işleri bir arada ihale edilemez. Ödeneği bulunmayan hiçbir iş için ihaleye çıkılamaz.'
      },
      {
        no: 'Madde 6',
        baslik: 'İhale Komisyonu',
        metin: 'İhale yetkilisi, ilgili idarenin personelinden en az beş ve tek sayıda kişiden oluşan ihale komisyonunu, yedek üyeler de dâhil olmak üzere görevlendirir. Komisyonda biri başkan, ikisi ihale konusu işin uzmanı ve biri muhasebe veya malî işlerden sorumlu idare personeli olmak üzere görevlendirilir.'
      },
      {
        no: 'Madde 9',
        baslik: 'Yaklaşık Maliyet',
        metin: 'Mal veya hizmet alımları ile yapım işlerinin ihalesi yapılmadan önce idarece, her türlü fiyat araştırması yapılarak katma değer vergisi hariç olmak üzere yaklaşık maliyet belirlenir ve dayanaklarıyla birlikte bir hesap cetvelinde gösterilir. Yaklaşık maliyete ihale ilanlarında yer verilmez, isteklilere veya ihale süreci ile resmi ilişkisi olmayan diğer kişilere açıklanmaz.'
      },
      {
        no: 'Madde 18',
        baslik: 'Uygulanacak İhale Usulleri',
        metin: 'İdarelerce mal veya hizmet alımları ile yapım işlerinin ihalelerinde aşağıdaki usullerden biri uygulanır:\na) Açık ihale usulü.\nb) Belli istekliler arasında ihale usulü.\nc) Pazarlık usulü.\n(d bendi yürürlükten kaldırılmıştır; doğrudan temin madde 22 olarak düzenlenmiştir).'
      },
      {
        no: 'Madde 21',
        baslik: 'Pazarlık Usulü',
        metin: 'Aşağıda belirtilen hallerde pazarlık usulü ile ihale yapılabilir:\na) Açık ihale usulü veya belli istekliler arasında ihale usulü ile yapılan ihale sonucunda teklif çıkmaması,\nb) Doğal afetler, salgın hastalıklar, can veya mal kaybı tehlikesi gibi ani ve beklenmeyen veya idare tarafından önceden öngörülemeyen olayların ortaya çıkması üzerine ihalenin ivedi olarak yapılmasının zorunlu olması,\nc) Savunma ve güvenlikle ilgili özel durumların ortaya çıkması,\nd) İhalenin, araştırma ve geliştirme sürecine ihtiyaç gösteren ve seri üretime konu olmayan nitelikte olması,\ne) İhale konusu mal veya hizmet alımları ile yapım işlerinin özgün nitelikte ve karmaşık olması,\nf) İdarelerin yaklaşık maliyeti kanunda belirtilen parasal limite kadar olan mamul mal, malzeme veya hizmet alımları.'
      },
      {
        no: 'Madde 22',
        baslik: 'Doğrudan Temin',
        metin: 'Aşağıda belirtilen hallerde ihtiyaçların, Kanunun 18 inci maddesinde belirtilen ihale usulleriyle temini yoluna gidilmeksizin doğrudan temin usulüyle temin edilebilir:\na) İhtiyacın sadece gerçek veya tüzel tek kişi tarafından karşılanabileceğinin tespit edilmesi,\nb) Sadece gerçek veya tüzel tek kişinin ihtiyaç ile ilgili özel bir hakka sahip olması,\nc) Mevcut mal, ekipman, teknoloji veya hizmetlerle uyumun ve standardizasyonun sağlanması için zorunlu olan mal ve hizmetlerin asıl sözleşmeye dayalı olarak temini,\nd) Büyükşehir belediyesi sınırları dahilinde bulunan idarelerin ve diğer idarelerin parasal limitleri aşmayan ihtiyaçları ile temsil ağırlama faaliyetleri kapsamında yapılacak konaklama, seyahat ve iaşe giderleri,\ne) İdarelerin ihtiyacına uygun taşınmaz mal alımı veya kiralanması,\nf) Özelliğinden dolayı mutat taşıtlarla taşınması mümkün olmayan ilaç ve tıbbi sarf malzemeleri,\ng) 4734 sayılı Kanunun 22/g maddesi uyarınca KİT ve benzeri kuruluşların ticari faaliyetleri kapsamındaki alımları.'
      },
      {
        no: 'Madde 38',
        baslik: 'Aşırı Düşük Teklifler',
        metin: 'İhale komisyonu verilen teklifleri değerlendirdikten sonra, diğer tekliflere veya idarenin tespit ettiği yaklaşık maliyete göre teklif fiyatı aşırı düşük olanları tespit eder. Bu teklifleri reddetmeden önce, belirlediği süre içinde teklif sahiplerinden teklifte önemli olduğunu tespit ettiği bileşenler ile ilgili ayrıntıları yazılı olarak ister. İhale komisyonu açıklamaları yeterli görmediği teklifleri reddeder.'
      },
      {
        no: 'Madde 58',
        baslik: 'İhalelere Katılmaktan Yasaklama',
        metin: '17 nci maddede belirtilen fiil veya davranışlarda bulundukları tespit edilenler hakkında, fiil veya davranışlarının özelliğine göre, bir yıldan az olmamak üzere iki yıla kadar idarece veya bakanlıkça kamu ihalelerine katılmaktan yasaklama kararı verilir.'
      },
      {
        no: 'Madde 62',
        baslik: 'İdarelerce Uyulması Gereken Diğer Kurallar',
        metin: 'Bu Kanuna göre yapılacak alımlarda aşağıdaki kurallara uyulması zorunludur:\na) Ödeneği bulunmayan hiçbir iş için ihaleye çıkılamaz.\nb) İhale dokümanı hazırlanmadan ilân yapılamaz.\nc) Yapım işlerinde arsa temin edilmeden, mülkiyet ve kamulaştırma işlemleri tamamlanmadan ve uygulama projeleri yapılmadan ihaleye çıkılamaz.\nd) Bu Kanunun 21 inci maddesinin (f) bendi ve 22 nci maddesinin (d) bendine göre yapılacak harcamaların yıllık toplamı, idarelerin bütçelerine bu amaçla konulan ödeneklerin %10\'unu Kamu İhale Kurulunun uygun görüşü olmadıkça aşamaz.'
      }
    ]
  },
  {
    id: 'kamu-ihale-sozlesmeleri-kanunu',
    baslik: '4735 Sayılı Kamu İhale Sözleşmeleri Kanunu',
    kisaBaslik: '4735 Sözleşmeler Kanunu',
    kanunNo: '4735',
    kategori: 'Kanun',
    resmiGazete: '22.01.2002 / 24648',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4735&MevzuatTur=1&MevzuatTertip=5',
    aciklama: 'Kamu İhale Kanununa göre yapılan ihaleler sonucunda düzenlenecek sözleşmelerin yapılması, uygulanması ve tasfiyesine ilişkin esaslar.',
    maddeler: [
      {
        no: 'Madde 4',
        baslik: 'İlkeler',
        metin: 'Bu Kanuna göre düzenlenen sözleşmelerde taraflar, sözleşme hükümlerinin uygulanmasında eşit hak ve yükümlülüklere sahiptir. İhale dokümanında yer alan şartlara aykırı sözleşme düzenlenemez.'
      },
      {
        no: 'Madde 8',
        baslik: 'Fiyat Farkı',
        metin: 'Sözleşme türlerine göre fiyat farkı verilebilmesine ilişkin esas ve usulleri tespite Cumhurbaşkanı yetkilidir. Sözleşmelerde yer alan fiyat farkına ilişkin esas ve usullerde sözleşme imzalandıktan sonra değişiklik yapılamaz.'
      },
      {
        no: 'Madde 10',
        baslik: 'Mücbir Sebepler',
        metin: 'Mücbir sebep olarak kabul edilebilecek haller: a) Doğal afetler, b) Kanuni grev, c) Genel salgın hastalık, d) Kısmi veya genel seferberlik ilanı, e) Gerektiğinde Kurum tarafından belirlenecek benzeri diğer haller. Süre uzatımı verilmesi, fesih ve tasfiye şartları bu madde kapsamında değerlendirilir.'
      },
      {
        no: 'Madde 11',
        baslik: 'Denetim, Muayene ve Kabul İşlemleri',
        metin: 'Teslim edilen mal, hizmet, yapım veya yapılan işin muayene ve kabul işlemleri, idarelerce kurulacak en az üç kişilik muayene ve kabul komisyonları tarafından yapılır. İşin niteliğine göre kabul komisyonunda işin uzmanı bulunur.'
      },
      {
        no: 'Madde 15',
        baslik: 'Sözleşmede Değişiklik Yapılması',
        metin: 'Sözleşme imzalandıktan sonra, sözleşme bedelinin aşılmaması ve idare ile yüklenicinin karşılıklı olarak anlaşması kaydıyla; işin yapılma veya teslim yeri, işin süresinden önce yapılması/teslimi kaydıyla işin süresi ve ödeme şartlarında değişiklik yapılabilir.'
      },
      {
        no: 'Madde 24',
        baslik: 'İş Artışı ve İş Eksilişi',
        metin: 'Mal ve hizmet alımlarıyla yapım sözleşmelerinde, öngörülemeyen durumlar nedeniyle bir iş artışının zorunlu olması halinde, artışa konu olan işin ana sözleşmeye dayalı olması şartıyla birim fiyat sözleşmelerde %20\'sine, anahtar teslimi götürü bedel sözleşmelerde %10\'una kadar iş artışı yapılabilir.'
      }
    ]
  },

  // 2. UYGULAMA YÖNETMELİKLERİ
  {
    id: 'mal-alimi-uygulama-yonetmeligi',
    baslik: 'Mal Alımı İhaleleri Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12952&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Mal alımı ihalelerinde yaklaşık maliyetin hesaplanması, ihale dokümanının hazırlanması, tekliflerin değerlendirilmesi kuralları.',
    maddeler: [
      {
        no: 'Madde 7',
        baslik: 'Yaklaşık Maliyetin Hesaplanmasına Esas Fiyat ve Rayiçlerin Tespiti',
        metin: 'İdareler, yaklaşık maliyetin hesaplanmasında; kamu kuruluşlarınca belirlenmiş fiyatlar, piyasa araştırması, geçmiş alım fiyatları, ticaret ve sanayi odaları bültenleri ve internet üzerinden elde edilen fiyatlardan faydalanır.'
      },
      {
        no: 'Madde 9',
        baslik: 'Teknik Şartname',
        metin: 'İhale konusu malın teknik kriterleri ve özellikleri teknik şartnamede belirtilir. Teknik şartnamede belirli bir marka, model, patent, menşei veya ürün belirtilemez; ancak "veya dengi" ifadesine yer verilmek şartıyla marka belirtilebilir.'
      },
      {
        no: 'Madde 27',
        baslik: 'Numune ve Demonstrasyon Değerlendirmesi',
        metin: 'Teklif edilen malın teknik şartnameye uygunluğunu teyit etmek amacıyla ihale dokümanında numune teslimi veya demonstrasyon şartı getirilebilir.'
      }
    ]
  },
  {
    id: 'hizmet-alimi-uygulama-yonetmeligi',
    baslik: 'Hizmet Alımı İhaleleri Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12953&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Hizmet alımı ihalelerinde yaklaşık maliyet, personel maliyeti, asgari işçilik hesabı ve ihale süreçleri.',
    maddeler: [
      {
        no: 'Madde 8',
        baslik: 'Hizmet Alımlarında Yaklaşık Maliyet',
        metin: 'Hizmet alımlarında personel çalıştırılmasına dayalı hizmetler için yürürlükteki brüt asgari ücret ve işveren maliyetleri dikkate alınarak yaklaşık maliyet hesaplanır.'
      },
      {
        no: 'Madde 59',
        baslik: 'Aşırı Düşük Teklif Sorgulaması',
        metin: 'Personel çalıştırılmasına dayalı hizmet alımı ihalelerinde asgari işçilik maliyetini karşılamayan teklifler aşırı düşük teklif sorgulaması yapılmaksızın reddedilir.'
      }
    ]
  },
  {
    id: 'yapim-isleri-uygulama-yonetmeligi',
    baslik: 'Yapım İşleri İhaleleri Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12954&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Yapım işleri ihalelerinde projeler, mahal listeleri, birim fiyat analizleri ve yaklaşık maliyet tespiti.',
    maddeler: [
      {
        no: 'Madde 8',
        baslik: 'Yapım İşlerinde Yaklaşık Maliyet',
        metin: 'Yapım işlerinde yaklaşık maliyet; metraj cetvelleri, birim fiyat tarifleri, analizler ve Çevre Şehircilik ve İklim Değişikliği Bakanlığı veya ilgili kamu kurumlarının birim fiyat kitapları esas alınarak hesaplanır.'
      },
      {
        no: 'Madde 9',
        baslik: 'Özel Poz ve Yeni Birim Fiyat Tespiti',
        metin: 'Resmi birim fiyat kitaplarında bulunmayan imalatlar için idarece özel poz tarifi hazırlanır ve piyasa araştırması veya analizlerle birim fiyatı belirlenir.'
      }
    ]
  },
  {
    id: 'ekap-elektronik-ihale-yonetmeligi',
    baslik: 'Kamu Alımlarının Elektronik Ortamda Yapılmasına İlişkin Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '25.02.2011 / 27857',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=14777&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'EKAP platformu üzerinden e-İhale, e-Eksiltme, doğrudan temin kayıt ve bildirim işlemleri.',
    maddeler: [
      {
        no: 'Madde 4',
        baslik: 'EKAP Kullanım Esasları',
        metin: 'İdareler, ihale ve doğrudan temin süreçlerine ilişkin kayıt ve bildirimlerini Elektronik Kamu Alımları Platformu (EKAP) üzerinden yürütürler.'
      },
      {
        no: 'Madde 16',
        baslik: 'e-Teklif ve e-İmza Zorunluluğu',
        metin: 'EKAP üzerinden yapılan e-ihalelerde teklif mektupları ve ekleri yetkili kişilerce nitelikli elektronik sertifika (e-İmza) ile imzalanarak sisteme yüklenir.'
      }
    ]
  },
  {
    id: 'danismanlik-uygulama-yonetmeligi',
    baslik: 'Danışmanlık Hizmet Alımı İhaleleri Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12955&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Mimarlık, mühendislik, etüt, proje ve müşavirlik hizmetlerinin ihale usul ve esasları.',
    maddeler: [
      {
        no: 'Madde 5',
        baslik: 'Danışmanlık Hizmetlerinin Kapsamı',
        metin: 'Mimarlık, mühendislik, etüt, proje, harita, imar planı, müşavirlik, kontrolörlük, araştırma ve geliştirme hizmetleri danışmanlık hizmet alımı olarak değerlendirilir.'
      }
    ]
  },
  {
    id: 'cerceve-anlasma-yonetmeligi',
    baslik: 'Çerçeve Anlaşma İhaleleri Uygulama Yönetmeliği',
    kategori: 'Yönetmelik',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12956&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Birden fazla idarenin veya dönemsel ihtiyaçların karşılanması için düzenlenen çerçeve anlaşmalar.',
    maddeler: [
      {
        no: 'Madde 4',
        baslik: 'Çerçeve Anlaşma Süresi',
        metin: 'Çerçeve anlaşmaların süresi kırk sekiz ayı (4 yıl) geçemez. Münferit sözleşmeler çerçeve anlaşma süresi içinde imzalanır.'
      }
    ]
  },
  {
    id: 'ihalelere-yonelik-basvurular-yonetmeligi',
    baslik: 'İhalelere Yönelik Başvurular Hakkında Yönetmelik',
    kategori: 'Yönetmelik',
    resmiGazete: '11.01.2019 / 30652',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=29532&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'İdareye şikayet ve Kamu İhale Kurumuna itirazen şikayet başvuru usul ve süreleri.',
    maddeler: [
      {
        no: 'Madde 4',
        baslik: 'Başvuru Yolları ve Süreler',
        metin: 'İhale sürecindeki işlem veya eylemler nedeniyle hak kaybına uğradığını iddia eden aday ve istekliler, önce idareye şikayet, sonucuna göre KİK\'e itirazen şikayet başvurusunda bulunabilirler.'
      },
      {
        no: 'Madde 5',
        baslik: 'Şikayet Başvuru Süresi',
        metin: 'İdareye şikayet başvuru süresi, ihale ilanına ve dokümanına karşı yapılan başvurularda ilan/satın alma tarihinden, diğer işlemlerde ise tebligat tarihinden itibaren kanunda belirtilen süredir (genellikle 5 veya 10 gün).'
      }
    ]
  },

  // 3. MUAYENE VE KABUL YÖNETMELİKLERİ
  {
    id: 'mal-alimi-muayene-kabul-yonetmeligi',
    baslik: 'Mal Alımları Denetim, Muayene ve Kabul İşlemlerine Dair Yönetmelik',
    kategori: 'Muayene ve Kabul',
    resmiGazete: '19.12.2002 / 24968',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4988&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Satın alınan malların teknik şartnameye uygunluğunun fiziki ve laboratuvar muayenesi ve kabul tutanakları.',
    maddeler: [
      {
        no: 'Madde 5',
        baslik: 'Muayene ve Kabul Komisyonunun Teşekkülü',
        metin: 'Muayene ve kabul komisyonları, yetkili makam tarafından biri başkan olmak üzere en az üç veya daha fazla tek sayıda kişiden oluşturulur. Komisyonda işin uzmanı en az bir üyenin bulunması zorunludur.'
      },
      {
        no: 'Madde 8',
        baslik: 'Muayene Raporu ve Kabul Tutanağı',
        metin: 'Muayene komisyonu malı fiziki olarak inceler, gerekiyorsa test ve tahlil yaptırır. Muayene sonucunda şartnameye uygun bulunan mallar için Muayene ve Kabul Tutanağı düzenlenir ve komisyon üyelerince imzalanır.'
      },
      {
        no: 'Madde 12',
        baslik: 'Kusurlu Mallar ve İtiraz',
        metin: 'Şartnameye uygun çıkmayan mallar reddedilir ve durum yükleniciye yazılı olarak bildirilir. Yüklenicinin itirazı halinde idarece ikinci bir muayene heyeti kurulabilir.'
      }
    ]
  },
  {
    id: 'hizmet-alimi-muayene-kabul-yonetmeligi',
    baslik: 'Hizmet Alımları Muayene ve Kabul Yönetmeliği',
    kategori: 'Muayene ve Kabul',
    resmiGazete: '19.12.2002 / 24968',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4989&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Gerçekleştirilen hizmet alımlarının şartnameye uygunluğunun kontrolü, periyodik hak ediş kabulleri ve kesin kabul.',
    maddeler: [
      {
        no: 'Madde 6',
        baslik: 'Hizmet Kabul Komisyonu',
        metin: 'Hizmet işlerinde kabul komisyonu, idare personelinden en az üç kişi ile kurulur. Komisyon ifa edilen hizmetin sözleşme ve teknik şartname şartlarına uygunluğunu denetler.'
      },
      {
        no: 'Madde 9',
        baslik: 'Hizmet İşlerinde Hak Ediş ve Kabul',
        metin: 'Dönemsel hizmet alımlarında (temizlik, güvenlik, yemek vb.) her ay düzenlenen hak ediş öncesi Hizmet İşleri Kabul Tutanağı tanzim edilerek ödemeye esas alınır.'
      }
    ]
  },
  {
    id: 'yapim-isleri-muayene-kabul-yonetmeligi',
    baslik: 'Yapım İşleri Muayene ve Kabul Yönetmeliği',
    kategori: 'Muayene ve Kabul',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12957&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'İnşaat ve onarım işlerinde geçici kabul, eksik ve kusurların tespiti, teminat süresi ve kesin kabul komisyonları.',
    maddeler: [
      {
        no: 'Madde 4',
        baslik: 'Geçici Kabul',
        metin: 'Yüklenicinin işi bitirdiğini bildirmesi üzerine idarece geçici kabul komisyonu oluşturulur. Komisyon yerinde inceleme yaparak geçici kabul tutanağını düzenler. Tespit edilen kusur ve eksiklikler tutanağa geçirilir ve giderilmesi için süre verilir.'
      },
      {
        no: 'Madde 9',
        baslik: 'Kesin Kabul',
        metin: 'Teminat süresi (genellikle 12 ay) bitiminde idarece kesin kabul komisyonu oluşturulur. Yapılan işin teminat süresince gösterdiği performans incelenerek kesin kabul tutanağı onaylanır.'
      }
    ]
  },
  {
    id: 'danismanlik-muayene-kabul-yonetmeligi',
    baslik: 'Danışmanlık Hizmet Alımı Muayene ve Kabul Yönetmeliği',
    kategori: 'Muayene ve Kabul',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12958&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Proje, etüt, rapor ve müşavirlik teslimlerinin incelenmesi ve kabul süreçleri.',
    maddeler: [
      {
        no: 'Madde 5',
        baslik: 'Rapor ve Proje Kabulleri',
        metin: 'Danışmanın hazırladığı etüt, proje, araştırma raporu veya şartnameler komisyonca incelenir, revizyon gerekiyorsa süre verilir ve onaylanan çalışmalar için kabul belgesi tanzim edilir.'
      }
    ]
  },

  // 4. TEBLİĞLER
  {
    id: 'dogrudan-temin-tebligi',
    baslik: 'Doğrudan Temin Yöntemiyle Yapılacak Alımlara İlişkin Tebliğ',
    kategori: 'Tebliğ',
    resmiGazete: 'Kamu İhale Genel Tebliği Md. 22 Düzenlemeleri',
    mevzuatGovTrUrl: 'https://www.ihale.gov.tr/Mevzuat/Tebligler.aspx',
    aciklama: '4734 sayılı Kanunun 22 nci maddesi uyarınca doğrudan teminle yapılan alımlarda onay belgesi, piyasa fiyat araştırması ve limitlerin uygulanması.',
    maddeler: [
      {
        no: 'Madde 1',
        baslik: 'Doğrudan Teminin Niteliği',
        metin: '4734 sayılı Kanunun 22 nci maddesinde belirtilen doğrudan temin bir ihale usulü olmayıp, idarelerin ivedi ve küçük ölçekli ihtiyaçlarını formalitelerden uzak, hızlı ve esnek bir şekilde karşılamalarını sağlayan bir alım yöntemidir.'
      },
      {
        no: 'Madde 2',
        baslik: 'Onay Belgesi Düzenlenmesi',
        metin: 'Doğrudan temin usulüyle yapılacak alımlarda ihale yetkilisinden Harcama/Onay Belgesi alınması zorunludur. Onay belgesinde alımın konusu, miktarı, yaklaşık bedeli ve ödenek tertibi açıkça belirtilir.'
      },
      {
        no: 'Madde 3',
        baslik: 'Piyasa Fiyat Araştırması Görevlendirmesi',
        metin: 'Harcama yetkilisi tarafından doğrudan temin konusu alımı gerçekleştirmek ve piyasa fiyat araştırması yapmak üzere idare personelinden bir veya birden fazla kişi görevlendirilir.'
      },
      {
        no: 'Madde 4',
        baslik: 'İhale Komisyonu ve Teminat Zorunluluğu Bulunmaması',
        metin: 'Doğrudan temin yöntemiyle yapılan alımlarda ihale komisyonu kurulması, geçici veya kesin teminat alınması ve ilan yapılması zorunlu değildir.'
      },
      {
        no: 'Madde 5',
        baslik: 'Yasaklılık Teyidi ve Sözleşme Düzenlenmesi',
        metin: 'Doğrudan temin alımlarında sözleşme düzenlenmesi idarenin takdirindedir. Ancak işin özelliğine göre veya belirli bir süreci kapsayan alımlarda sözleşme yapılması tavsiye edilir. Yasaklılık teyidi alım öncesinde EKAP üzerinden sorgulanır.'
      },
      {
        no: 'Madde 6',
        baslik: '%10 Bütçe Limiti Takibi (Md. 62/ı)',
        metin: '4734 sayılı Kanunun 22 nci maddesinin (d) bendine göre yapılan harcamaların yıllık toplamı, idare bütçesine konulan ödeneklerin %10\'unu Kamu İhale Kurulunun uygun görüşü olmaksızın aşamaz. Limit aşımı riskine karşı harcamalar düzenli olarak izlenmelidir.'
      }
    ]
  },
  {
    id: 'kamu-ihale-genel-tebligi',
    baslik: 'Kamu İhale Genel Tebliği',
    kategori: 'Tebliğ',
    resmiGazete: '25.07.2010 / 27652',
    mevzuatGovTrUrl: 'https://www.ihale.gov.tr/Mevzuat/Tebligler.aspx',
    aciklama: 'Kamu ihale mevzuatının uygulanmasına yönelik en kapsamlı açıklayıcı tebliğ metni.',
    maddeler: [
      {
        no: 'KIGT Md. 16',
        baslik: 'Yaklaşık Maliyetin Hesaplanması ve Gizliliği',
        metin: 'Yaklaşık maliyetin idarelerce hesaplanmasında dayanak belgeler (proforma faturalar, resmi birim fiyatlar, analizler) gizli tutulur ve yaklaşık maliyet hesap cetveline bağlanır.'
      },
      {
        no: 'KIGT Md. 22',
        baslik: 'Doğrudan Temine İlişkin Uygulama İlkeleri',
        metin: '22/d bendine göre yapılacak alımlarda ihtiyaçların bölünmemesi, aynı mali yıl içinde planlı olarak yapılması gereken alımların kısımlara bölünerek doğrudan temin limitleri altında bırakılmaması esastır.'
      },
      {
        no: 'KIGT Md. 45',
        baslik: 'Aşırı Düşük Tekliflerin Tespiti ve Sorgulanması',
        metin: 'Aşırı düşük teklif sınır değerinin hesaplanması (R katsayıları) ve isteklilerden istenecek analiz ve belgelerin kriterleri tebliğde detaylandırılmıştır.'
      }
    ]
  },
  {
    id: 'esik-degerler-ve-limitler-tebligi',
    baslik: 'Eşik Değerler ve Parasal Limitler Tebliği',
    kategori: 'Tebliğ',
    resmiGazete: 'Her Yıl 1 Şubat Tarihli Resmi Gazete',
    mevzuatGovTrUrl: 'https://www.ihale.gov.tr/Mevzuat/Tebligler.aspx',
    aciklama: 'KİK tarafından her yıl TÜFE oranlarına göre güncellenen doğrudan temin, ilan ve eşik değer parasal limitleri.',
    maddeler: [
      {
        no: 'Limit 1',
        baslik: '4734 Sayılı Kanun Madde 22/d Doğrudan Temin Limitleri',
        metin: 'Büyükşehir Belediye Sınırları Dahilindeki İdareler ile Diğer İdareler için her yıl 1 Şubat tarihinden itibaren geçerli olmak üzere belirlenen güncel limitler tablosudur.'
      },
      {
        no: 'Limit 2',
        baslik: '4734 Sayılı Kanun Madde 21/f Pazarlık Usulü Parasal Limiti',
        metin: 'Yaklaşık maliyeti belirlenen parasal limite kadar olan mamul mal, malzeme ve hizmet alımlarında ilan yapılmaksızın pazarlık usulü uygulanabilmektedir.'
      }
    ]
  },
  {
    id: 'benzer-is-gruplari-tebligi',
    baslik: 'Yapım İşlerinde Benzer İş Grupları Tebliği',
    kategori: 'Tebliğ',
    resmiGazete: '11.06.2011 / 27961',
    mevzuatGovTrUrl: 'https://www.ihale.gov.tr/Mevzuat/Tebligler.aspx',
    aciklama: 'Yapım işleri ihalelerinde iş deneyim belgelerinin değerlendirilmesine esas A, B, C, D grubu inşaat ve tesisat iş grupları.',
    maddeler: [
      {
        no: 'Grup A',
        baslik: 'Bina İşleri',
        metin: 'I. Grup, II. Grup ve III. Grup hizmet binaları, konutlar, eğitim tesisleri, hastaneler ve idari binalar.'
      },
      {
        no: 'Grup B',
        baslik: 'Altyapı ve Karayolu İşleri',
        metin: 'Karayolları, otoyollar, tüneller, köprüler, demiryolları, havaalanı pistleri ve drenaj yapıları.'
      },
      {
        no: 'Grup C',
        baslik: 'Su Yapıları ve Kanalizasyon İşleri',
        metin: 'Barajlar, göletler, sulama kanalları, içme suyu isale hatları, arıtma tesisleri ve kanalizasyon şebekeleri.'
      }
    ]
  },
  {
    id: 'ihalelere-yonelik-basvurular-tebligi',
    baslik: 'İhalelere Yönelik Başvurular Hakkında Tebliğ',
    kategori: 'Tebliğ',
    resmiGazete: '11.01.2019 / 30652',
    mevzuatGovTrUrl: 'https://www.ihale.gov.tr/Mevzuat/Tebligler.aspx',
    aciklama: 'İdareye şikayet ve KİK\'e itirazen şikayet dilekçelerinin usulü ve başvuru bedelleri.',
    maddeler: [
      {
        no: 'Madde 1',
        baslik: 'Şikayet Dilekçesi Zorunlu Unsurları',
        metin: 'Başvuru dilekçesinde; başvuru sahibinin adı, TC/Vergi kimlik numarası, adresi, ihaleyi yapan idare, ihale kayıt numarası (İKN), şikayete konu işlem ve hukuka aykırılık iddiaları yer almalıdır.'
      }
    ]
  },

  // 5. FİYAT FARKI VE ESASLAR
  {
    id: 'mal-alimi-fiyat-farki-esaslari',
    baslik: 'Mal Alımlarında Uygulanacak Fiyat Farkına İlişkin Esaslar',
    kategori: 'Esaslar ve Fiyat Farkı',
    resmiGazete: '31.12.2013 / 28868',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=20135649&MevzuatTur=21&MevzuatTertip=5',
    aciklama: 'Mal alımı sözleşmelerinde TÜİK üretici fiyat endeksleri üzerinden hesaplanacak fiyat farkı formülleri.',
    maddeler: [
      {
        no: 'Madde 5',
        baslik: 'Mal Alımlarında Fiyat Farkı Hesabı',
        metin: 'F = An x B x (Pn - 1) formülü uygulanır. Formüldeki katsayılar ve TÜİK Yurtiçi ÜFE alt endeksleri ihale dokümanında belirtilen oranlar üzerinden hesaplanır.'
      }
    ]
  },
  {
    id: 'hizmet-alimi-fiyat-farki-esaslari',
    baslik: 'Hizmet Alımlarında Uygulanacak Fiyat Farkına İlişkin Esaslar',
    kategori: 'Esaslar ve Fiyat Farkı',
    resmiGazete: '31.12.2013 / 28868',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=20135649&MevzuatTur=21&MevzuatTertip=5',
    aciklama: 'Hizmet alımlarında asgari ücret artışı, akaryakıt ve malzeme endeksleri fiyat farkı uygulamaları.',
    maddeler: [
      {
        no: 'Madde 6',
        baslik: 'İşçilik Fiyat Farkı Hesabı',
        metin: 'Asgari ücrette meydana gelen artışlar nedeniyle oluşan brüt fark ve işveren maliyeti artışı, F = An x [ (M - Mo) ] formülüyle kesintisiz olarak yükleniciye ödenir.'
      }
    ]
  },
  {
    id: 'yapim-isleri-fiyat-farki-esaslari',
    baslik: 'Yapım İşlerinde Uygulanacak Fiyat Farkına İlişkin Esaslar',
    kategori: 'Esaslar ve Fiyat Farkı',
    resmiGazete: '31.12.2013 / 28868',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=20135649&MevzuatTur=21&MevzuatTertip=5',
    aciklama: 'İnşaat, tesisat ve onarım sözleşmelerinde hakedişlere uygulanan Pn ağırlık katsayıları fiyat farkı formülü.',
    maddeler: [
      {
        no: 'Madde 5',
        baslik: 'Pn Katsayısı ve Ağırlık Oranları Formülü',
        metin: 'Pn = [ a1(İn/İo) + a2(Çn/Ço) + a3(Dn/Do) + a4(Kn/Ko) + a5(Yn/Yo) + b(Gn/Go) ] formülü ile hakediş dönemine ait genel fiyat endeksi katsayısı hesaplanır.'
      }
    ]
  },
  {
    id: 'gecici-5-6-7-ek-fiyat-farki',
    baslik: '4735 Sayılı Kanun Geçici 5, 6 ve 7 nci Maddeleri Ek Fiyat Farkı ve Sözleşme Feshi Esasları',
    kategori: 'Esaslar ve Fiyat Farkı',
    resmiGazete: '24.02.2022 / 31760',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5203&MevzuatTur=21&MevzuatTertip=5',
    aciklama: 'Beklenmeyen maliyet artışları sebebiyle kamu sözleşmelerine verilen ek fiyat farkı, artırımlı fiyat farkı ve sözleşme devir/fesih esasları.',
    maddeler: [
      {
        no: 'Geçici Md. 5',
        baslik: 'Ek Fiyat Farkı ve Sözleşmelerin Devri',
        metin: '01.07.2021 - 31.12.2021 tarihleri arasında gerçekleştirilen iş kısımları için TÜİK endeks artışları oranında ek fiyat farkı hesaplanması ve cezasısz devir imkanı getirilmiştir.'
      },
      {
        no: 'Geçici Md. 6',
        baslik: 'Artırımlı Fiyat Farkı ve Fesih Hakkı',
        metin: '01.01.2022 - 31.12.2023 tarihleri arasındaki sözleşmeler için B katsayısı artırılarak ek fiyat farkı ödenmesi ve yüklenicilere sözleşmeyi cezasız feshetme veya devretme hakkı tanınmıştır.'
      }
    ]
  },

  // 6. GENEL ŞARTNAMELER
  {
    id: 'yapim-isleri-genel-sartnamesi',
    baslik: 'Yapım İşleri Genel Şartnamesi (YİGŞ)',
    kategori: 'Şartname',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12959&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'İnşaat ve yapım işleri sözleşmelerinin yürütülmesi, şantiye yönetimi, ataşmanlar, hakediş tanzimi, revize birim fiyat ve kabuller.',
    maddeler: [
      {
        no: 'YİGŞ Md. 6',
        baslik: 'Yer Teslimi ve İşe Başlama',
        metin: 'Sözleşmenin imzalanmasından sonra idare tarafından işyeri yükleniciye tutanakla teslim edilir ve işe başlama tarihi tutanağa bağlanır.'
      },
      {
        no: 'YİGŞ Md. 12',
        baslik: 'İş Programı ve Gecikmeler',
        metin: 'Yüklenici yer tesliminden itibaren sözleşmede belirtilen süre içinde ayrıntılı iş programını hazırlayarak idarenin onayına sunmak zorundadır.'
      },
      {
        no: 'YİGŞ Md. 22',
        baslik: 'Sözleşmede Bulunmayan İşlerin Birim Fiyatının Tespiti (Yeni Fiyat)',
        metin: 'Sözleşme kapsamında yapılması zorunlu hale gelen yeni imalatlar için idare ve yüklenici karşılıklı analizler, rayiçler ve faturalar üzerinden Yeni Birim Fiyat Tutanağı düzenler.'
      },
      {
        no: 'YİGŞ Md. 39',
        baslik: 'Hakediş Raporlarının Düzenlenmesi ve Ödeme',
        metin: 'Yapım işlerinde aylık hakediş raporları; metraj cetvelleri, yeşil defter, ataşmanlar, fiyat farkı hesap tabloları ve kesintiler eklenerek yapı denetim görevlilerince incelenip onaylanır.'
      },
      {
        no: 'YİGŞ Md. 41',
        baslik: 'Geçici Kabul ve Kusurların Giderilmesi',
        metin: 'İşin tamamlanması üzerine geçici kabul heyeti oluşturulur. Tespit edilen nefaset farkları veya eksiklikler tutanağa bağlanarak düzeltilmesi için makul süre verilir.'
      }
    ]
  },
  {
    id: 'hizmet-isleri-genel-sartnamesi',
    baslik: 'Hizmet İşleri Genel Şartnamesi (HİGŞ)',
    kategori: 'Şartname',
    resmiGazete: '04.03.2009 / 27159',
    mevzuatGovTrUrl: 'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12960&MevzuatTur=7&MevzuatTertip=5',
    aciklama: 'Hizmet alımı sözleşmelerinin ifası, personel çalıştırma, kontrol teşkilatı yetkileri, aylık hakedişler ve cezai işlemler.',
    maddeler: [
      {
        no: 'HİGŞ Md. 8',
        baslik: 'Kontrol Teşkilatı ve Yetkileri',
        metin: 'İdare tarafından görevlendirilen kontrol teşkilatı, hizmetin sözleşme ve teknik şartnameye uygun olarak yürütülmesini denetler, yükleniciye gerekli talimatları verir.'
      },
      {
        no: 'HİGŞ Md. 42',
        baslik: 'Hakediş Ödemeleri ve Kesintiler',
        metin: 'Her ay sonunda yüklenicinin hak ettiği tutar, personel puantajları, SGK prim bildirgeleri ve vergi borcu sorgulamaları yapılarak hakediş raporuna bağlanır.'
      },
      {
        no: 'HİGŞ Md. 48',
        baslik: 'Cezalar ve Sözleşmenin Feshi',
        metin: 'Hizmetin aksatılması veya şartnameye aykırı hareket edilmesi durumunda sözleşmede belirlenen oranda ceza kesilir; aksaklığın giderilmemesi halinde fesih prosedürü uygulanır.'
      }
    ]
  }
]
