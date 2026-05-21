# 🎓 Akıllı Kampüs Duyuru ve Bildirim Yönetim Sistemi

Bu proje, **Yazılım Mimari ve Tasarımı (Software Architecture and Design)** prensipleri doğrultusunda geliştirilmiş, temiz kod (Clean Code) standartlarına ve katmanlı mimariye (Layered Architecture) sahip modern bir tek sayfa (SPA) web uygulamasıdır. 

Proje kapsamında zorunlu tutulan **Tasarım Desenleri (Design Patterns)**, akademik ve kurumsal standartlara uygun olarak sistem genelinde somut şekilde konumlandırılmış ve veri kalıcılığı (storage) mekanizmalarıyla reaktif şekilde entegre edilmiştir.

---

## 🏛️ 1. Mimari Yapı (Layered Architecture)

Sistem, sorumlulukların net bir şekilde ayrılması (Separation of Concerns) ve test edilebilirliğin artırılması amacıyla **4 katmanlı mimari** standardına göre tasarlanmıştır:

```
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

1. **Domain Layer (İş Kuralları & Varlıklar)**: Sistemin kalbidir. Dış katmanlardan ve kütüphanelerden tamamen izole edilmiştir. İş kurallarını, ana nesne tanımlarını (`User`, `Announcement` vb.) ve üretim fabrikalarını barındırır.
2. **Application Layer (Uygulama Servisleri & Koordinasyon)**: Domain nesnelerini ve iş mantığını koordine eder. Bildirim gönderim merkezi, yayıncı mekanizması ve sistem olay günlükleyicisi bu katmandadır.
3. **Infrastructure Layer (Altyapı & Veri Depolama)**: Tarayıcı hafızasını (`localStorage`) kullanarak sistem durumunun kalıcılığını (persistence) yönetir. Verileri geri yüklerken (deserialization) domain katmanındaki fabrikaları polimorfik olarak delege eder.
4. **Presentation Layer (Kullanıcı Arayüzü & Sunum)**: Premium glassmorphism tasarımı, açık/koyu tema motoru, interaktif simülasyon araçları ve onboarding kullanım rehberini barındırır. **Passive View** desenine uygun olarak depolama ve iş katmanlarından tamamen arındırılmıştır.

---

## 🎨 2. Uygulanan Tasarım Desenleri (Design Patterns)

### 👥 A. Observer Pattern (Gözlemci Deseni)
* **Konum:** `js/application/announcement-publisher.js` (Subject) & `js/domain/user.js` (Observer)
* **Amaç:** Yeni bir duyuru yayınlandığında, bu duyuruyla eşleşen hedef kitledeki (Öğretmen/Öğrenci) kullanıcıları otomatik olarak bilgilendirmek.
* **Açıklama:** Yayıncı (`AnnouncementPublisher`), kendisine abone olan gözlemcileri (`User` alt sınıflarını) listeler. Yeni duyuru yayınlandığında polimorfik `update(announcement)` çağrısı yapılır. Kullanıcı, kendi rolü ve bildirim tercihleri (SMS, E-posta, Mobil) doğrultusunda bildirimleri tetikler veya hedef kitlesi dışındaki duyuruları filtreler.

### 🏭 B. Factory Pattern (Fabrika Deseni)
* **Konum:** `js/domain/user-factory.js`, `js/domain/announcement-factory.js`, `js/domain/notification-factory.js`
* **Amaç:** Somut (concrete) sınıfların doğrudan `new` anahtar kelimesi ile oluşturulmasının önüne geçmek ve gevşek bağlılığı (loose coupling) korumak.
* **Açıklama:** Kullanıcıların, duyuruların (Sınav, Yemekhane, Seminer, Kütüphane) ve bildirim kanallarının (SMS, E-posta, Push) örneklenme aşaması fabrikalar üzerinden yürütülür. Bu sayede sisteme yeni bir tür eklendiğinde mevcut depolama ve arayüz kodlarına dokunulmaz (**Open-Closed Principle**).

### 👑 C. Singleton Pattern (Tekil Desen)
* **Konum:** `js/application/logger.js` (Logger), `js/application/notification-center.js` (NotificationCenter), `js/infrastructure/storage.js` (SystemStateManager)
* **Amaç:** Sistem ömrü boyunca bu sınıflardan bellekte yalnızca tek bir örneğin (instance) bulunmasını garanti etmek.
* **Açıklama:** Sistem günlüğü çakışmalarını önlemek, tekil veri durumunu (state) korumak ve bildirim akışını tek bir merkezden koordine etmek amacıyla `getInstance()` statik metodu kullanılmıştır.

### 🔌 D. Mediator Pattern (Arabulucu Deseni)
* **Konum:** `js/presentation/dom-manager.js` (Mediator)
* **Amaç:** Sunum katmanındaki "Tanrı Nesne" (God Object) anti-desenini kırarak UI modüllerini birbirinden ayırmak.
* **Açıklama:** `DOMManager` arayüz arabulucusu görevi görür. Alt modüller (`user-component.js`, `announcement-component.js` vb.) birbirleriyle doğrudan konuşmak yerine mediator üzerinden haberleşir. Bu sayede sunum katmanı yüksek düzeyde modüler ve sürdürülebilir bir yapıya kavuşmuştur.

---

## 💎 3. Öne Çıkan Gelişmiş Özellikler

* 🌓 **Açık / Koyu Tema Desteği:** Kullanıcı tercihlerini hafızada (`localStorage`) saklayan, modern HSL renk paletine sahip, gradyan zeminlerde yüksek kontrast standartlarıyla (WCAG) uyumlu premium tema motoru.
* 🧭 **Etkileşimli Sistem Rehberi (Onboarding):** Teknik jargondan uzak, ilk kez giren kullanıcılara sistemi adım adım pürüzsüz koordinat hesaplamaları ve dinamik spotlight maskesi ile tanıtan interaktif Türkçe rehber.
* 🤖 **8 Adımlı Otomatik Demo Senaryo:** Ödev ve proje isterlerinde yer alan tüm senaryonun (kullanıcı ekleme, tercih belirleme, sınav duyurusu girme, polimorfik bildirim üretimi ve filtreleme) gecikmeli animasyonlarla tek tıkla izlenebilmesini sağlayan simülatör.
* 🧹 **Bellek Kapasite Yönetimi (Capped Buffer):** Sistem günlüğü (logger) ve bildirim merkezinde oluşabilecek bellek sızıntılarını (memory leaks) önleyen maksimum 200 kayıttan oluşan dairesel sınırlandırılmış bellek havuzu.

---

## 🚀 4. Projeyi Çalıştırma

Projenin ES6 Modülleri (import/export) üzerinden çalışabilmesi için tarayıcıda yerel bir HTTP sunucusu üzerinden açılması gerekmektedir:

### 🐍 Python Sunucusu ile (Önerilen)
Proje ana dizininde terminali açarak aşağıdaki komutu çalıştırın:
```bash
python3 -m http.server 8000
```
Ardından tarayıcınızda şu adresi açın: `http://localhost:8000`

### 📦 Node.js (npx serve) ile
```bash
npx serve
```
Ardından konsolda belirtilen yerel adresi tarayıcınızda açın.

---

## 📝 5. Katkı Verenler, Yapay Zeka Katkıları & Lisans

Bu proje, **BİL 3204 - Yazılım Mimari ve Tasarımı** dersi projesi kapsamında tasarlanmış ve geliştirilmiştir. 

### 🤖 Yapay Zeka Destekli Geliştirme Süreci (AI-Assisted Development)
Projenin analiz, mimari tasarım, desen uygulamaları, kod yazımı ve UI/UX iyileştirme süreçlerinde modern yapay zeka araçlarından aktif olarak yararlanılmış ve eş programlama (pair programming) yapılmıştır:
* **Google DeepMind - Antigravity AI:** Projenin katmanlı mimari yapısının kurulması, Observer, Factory, Singleton ve Mediator tasarım desenlerinin SOLID prensiplerine uygun olarak kodlanması ve arayüz modüllerinin reaktif şekilde bağlanması süreçlerini koordine etmiştir.
* **OpenAI - ChatGPT:** Fikir geliştirme, tutorial (onboarding) rehberinin kullanıcı dostu metin tasarımları, mimari tasarım kararlarının sorgulanması ve senaryo planlama aşamalarında danışmanlık yapmıştır.
* **GitHub Copilot:** Kod yazımı sırasında akıllı kod tamamlama, hızlı fonksiyon şablonları oluşturma ve mükerrer JavaScript kodlarının refaktör edilmesi süreçlerinde verimlilik sağlamıştır.
