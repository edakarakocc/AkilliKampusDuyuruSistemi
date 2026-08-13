# Akıllı Kampüs Duyuru Sistemi

Katmanlı mimari ve tasarım desenleri kullanılarak geliştirilmiş web tabanlı kampüs duyuru ve bildirim yönetim sistemi.

## Genel Bakış

Bu proje, üniversite kampüsündeki duyuruların oluşturulması, görüntülenmesi ve kullanıcılara bildirim olarak iletilmesini simüle eden web tabanlı bir uygulamadır.

Projenin temel amacı, Yazılım Mimarisi ve Tasarımı dersi kapsamında öğrenilen katmanlı mimari yaklaşımını ve tasarım desenlerini gerçek bir uygulama senaryosu üzerinde uygulamaktır.

Proje kapsamında farklı sorumlulukların ayrı katmanlarda ele alınması, bileşenler arasındaki bağımlılıkların azaltılması ve yaygın tasarım desenlerinin uygun kullanım alanlarının gösterilmesi hedeflenmiştir.

## Temel Özellikler

- Kampüs duyurularının görüntülenmesi
- Yeni duyuru oluşturma
- Duyuruların kategorilere göre yönetilmesi
- Duyuru bildirimlerinin oluşturulması
- Kullanıcı ve bildirim etkileşimlerinin yönetilmesi
- Tema değiştirme desteği
- Katmanlı mimari ile sorumlulukların ayrıştırılması
- Observer, Factory, Singleton ve Mediator tasarım desenlerinin kullanılması
- Tarayıcı `localStorage` kullanılarak uygulama verilerinin saklanması
- Etkileşimli web arayüzü

## Kullanılan Yazılım Mimarisi

Proje, sorumlulukların birbirinden ayrıştırılması amacıyla katmanlı mimari yaklaşımı kullanılarak tasarlanmıştır.

Uygulamada dört temel katman bulunmaktadır:

```text
[ Presentation Layer ]  <--- (DOMManager / UI Components)
        │
        ▼
[ Application Layer ]   <--- (Publisher / NotificationCenter / Logger)
        │
        ▼
[ Domain Layer ]        <--- (User / Announcement / Factories)
        ▲
        │
[ Infrastructure Layer ] <--- (SystemStateManager / LocalStorage)
```

### Presentation Layer

Kullanıcı arayüzü ve DOM ile ilgili işlemlerden sorumludur.

Bu katmanda:

- `DOMManager`
- UI bileşenleri

gibi yapılar bulunmaktadır.

### Application Layer

Uygulamanın iş akışlarını ve bileşenler arasındaki iletişimi yönetir.

Bu katmanda:

- `Publisher`
- `NotificationCenter`
- `Logger`

gibi yapılar bulunmaktadır.

### Domain Layer

Uygulamanın temel iş nesnelerini ve domain mantığını içerir.

Bu katmanda:

- `User`
- `Announcement`
- Factory yapıları

bulunmaktadır.

### Infrastructure Layer

Uygulamanın veri saklama ve sistem durumuyla ilgili altyapı işlemlerini yönetir.

Bu katmanda:

- `SystemStateManager`
- `LocalStorage`

kullanılmaktadır.

Bu katmanların ayrıştırılması, uygulamadaki bileşenlerin sorumluluklarının belirginleştirilmesini ve bileşenler arasındaki bağımlılıkların daha kontrollü şekilde yönetilmesini amaçlamaktadır.

## Kullanılan Tasarım Desenleri

Projede farklı yazılım tasarım problemlerini çözmek ve bileşenler arasındaki iletişimi yönetmek amacıyla çeşitli tasarım desenleri kullanılmıştır.

### Observer Pattern

Bir olay gerçekleştiğinde, bu olayı takip eden bileşenlerin otomatik olarak bilgilendirilmesini sağlamak amacıyla kullanılmıştır.

Projedeki duyuru ve bildirim akışlarında nesneler arasındaki olay tabanlı iletişimin yönetilmesine yardımcı olur.

### Factory Pattern

Farklı türlerdeki nesnelerin oluşturulmasını merkezi bir yapı üzerinden yönetmek amacıyla kullanılmıştır.

Nesne oluşturma sorumluluğunun ilgili sınıflardan ayrılmasını sağlayarak daha düzenli bir yapı oluşturmayı amaçlar.

### Singleton Pattern

Uygulama içerisinde tek bir örneğinin bulunması gereken bileşenlerin merkezi olarak yönetilmesi amacıyla kullanılmıştır.

Bu yapı, belirli uygulama bileşenlerine uygulama genelinde ortak erişim sağlanmasına yardımcı olur.

### Mediator Pattern

Bileşenler arasındaki doğrudan iletişimi azaltmak ve iletişim süreçlerini merkezi bir yapı üzerinden yönetmek amacıyla kullanılmıştır.

Bu sayede bileşenlerin birbirleriyle doğrudan olan bağımlılıklarının azaltılması hedeflenmiştir.

## AI-Assisted Development

Bu proje, ders kapsamında verilen AI-assisted development yaklaşımı doğrultusunda geliştirilmiştir.

Geliştirme sürecinde yapay zeka destekli programlama araçlarından yararlanılmıştır. Yapay zeka; kod oluşturma, mevcut kod üzerinde geliştirme, hata ayıklama, tasarım desenlerinin uygulanması ve geliştirme sürecinde teknik alternatiflerin değerlendirilmesi gibi aşamalarda yardımcı bir araç olarak kullanılmıştır.

AI desteği, geliştirme sürecini hızlandırmak ve farklı yazılım mimarisi yaklaşımlarını uygulamalı olarak değerlendirmek amacıyla kullanılmıştır.

Projenin kapsamı, gereksinimleri, mimari yaklaşımı ve kullanılacak tasarım desenleri ise ders kapsamında belirlenen proje hedefleri doğrultusunda şekillendirilmiştir.

## Teknolojiler

- HTML
- CSS
- JavaScript
- LocalStorage
- Katmanlı Mimari
- Observer Pattern
- Factory Pattern
- Singleton Pattern
- Mediator Pattern

## Veri Yönetimi

Uygulamanın mevcut prototipinde verilerin tarayıcı üzerinde saklanması için `localStorage` kullanılmaktadır.

Bu yaklaşım, harici bir veritabanı veya sunucu gerektirmeden uygulamanın temel veri yönetimi ve kullanıcı etkileşimlerinin simüle edilmesini sağlar.

Proje akademik bir prototip olarak tasarlandığından, `localStorage` kullanımı gerçek üretim ortamlarında kullanılacak kalıcı bir veri yönetimi çözümü olarak değerlendirilmemelidir.

## Kullanıcı Arayüzü

Uygulama, kullanıcıların kampüs duyurularını görüntüleyebileceği ve duyuru yönetimi ile ilgili işlemleri gerçekleştirebileceği web tabanlı bir arayüz sunmaktadır.

Arayüz içerisinde:

- Duyuru listeleri
- Duyuru detayları
- Bildirimler
- Kategori bilgileri
- Tema seçenekleri
- Etkileşimli bileşenler

gibi bölümler bulunmaktadır.

## Proje Yapısı

```text
AkilliKampusDuyuruSistemi/
│
├── index.html
├── css/
│   └── ...
├── js/
│   └── ...
├── assets/
│   └── ...
└── README.md
```

Proje yapısındaki dosya ve klasörler uygulamanın mevcut sürümüne göre düzenlenmiştir.

## Projenin Amacı

Bu projenin temel amacı, yazılım mimarisi ve tasarım desenleri konularında öğrenilen kavramları gerçek bir uygulama senaryosu üzerinde uygulamaktır.

Proje kapsamında özellikle:

- Sorumlulukların katmanlara ayrıştırılması
- Modüler yazılım geliştirme
- Bileşenler arasındaki bağımlılıkların azaltılması
- Tasarım desenlerinin uygun kullanım alanlarının incelenmesi
- Katmanlı mimarinin uygulanması
- Olay tabanlı iletişim yapılarının kullanılması
- AI-assisted software development yaklaşımının deneyimlenmesi

üzerinde çalışılmıştır.

## Proje Durumu

Bu proje akademik amaçlı geliştirilmiş bir web uygulaması prototipidir.

Uygulama, yazılım mimarisi ve tasarım desenlerinin kullanımını göstermek amacıyla hazırlanmıştır. Gerçek bir üniversite bilgi sistemi veya üretim ortamında kullanılmak üzere tasarlanmış kapsamlı bir platform değildir.

## Gelecek Çalışmalar

Proje ileride aşağıdaki özelliklerle geliştirilebilir:

- Gerçek bir backend ve veritabanı entegrasyonu
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Gerçek zamanlı bildirim sistemi
- Yönetici paneli
- Duyuru arama ve filtreleme
- Kullanıcı bazlı bildirim tercihleri
- Daha kapsamlı test altyapısı
- REST API entegrasyonu

## Çalıştırma

Proje herhangi bir modern web tarayıcısında çalıştırılabilir.

Repository indirildikten sonra `index.html` dosyası tarayıcıda açılarak uygulama çalıştırılabilir.

## Akademik Bağlam

Bu proje, Yazılım Mimarisi ve Tasarımı dersi kapsamında geliştirilmiştir.

Projenin geliştirilmesinde ders kapsamında ele alınan katmanlı mimari ve tasarım desenlerinin uygulamalı olarak kullanılması ve AI-assisted development yaklaşımının yazılım geliştirme sürecinde deneyimlenmesi amaçlanmıştır.
