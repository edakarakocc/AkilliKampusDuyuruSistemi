import { UserFactory } from '../../domain/user-factory.js';
import { AnnouncementFactory } from '../../domain/announcement-factory.js';

/**
 * Demo Senaryosu Bileşeni (DemoComponent) - Presentation Layer
 * 8 adımlı gecikmeli entegre "Demo Senaryo" otomasyonunu yönetir.
 */
export class DemoComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.publisher = domManager.publisher;
        this.notifCenter = domManager.notifCenter;
        this.logger = domManager.logger;
    }

    /**
     * Demo olay dinleyicilerini bağlar
     */
    bindEvents() {
        if (this.domManager.btnDemo) {
            this.domManager.btnDemo.addEventListener('click', () => {
                this.runDemoScenario();
            });
        }
    }

    /**
     * "Demo Senaryo" otomasyon akışını gecikmelerle çalıştırır
     */
    async runDemoScenario() {
        this.logger.log("Presentation Layer: Otomatik Demo Senaryo tetiklendi!", "warning", "Presentation");
        this.domManager.showToast("Demo Senaryo Başlatıldı!", "info");

        // Gecikme metodu (sleep)
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        try {
            // Adım 1: Verileri Sıfırla (Temiz bir başlangıç)
            this.publisher.clearAll();
            this.notifCenter.clearHistory();
            this.logger.clear();
            
            // UI Güncellemelerini Alt Bileşenler Üzerinden Tetikle (Sıfırlandığı için)
            this.domManager.userComp.renderUsers();
            this.domManager.announcementComp.renderAnnouncements();
            this.domManager.notificationComp.renderNotifications();
            this.domManager.logComp.renderLogs();
            this.domManager.updateStats();

            await sleep(1200);

            // Adım 2: Gözlemcileri (Kullanıcıları) Ekle
            this.domManager.showToast("Adım 1/6: Kampüs kullanıcıları ve bildirim tercihleri sisteme ekleniyor...", "info");
            
            const usersToAdd = [
                { name: "Prof. Dr. Fatma Şahin", type: "teacher", channels: { email: true, sms: true, push: true } },
                { name: "Mehmet Demir", type: "student", channels: { email: false, sms: true, push: true } },
                { name: "Ayşe Kaya", type: "student", channels: { email: true, sms: false, push: true } }
            ];

            for (let i = 0; i < usersToAdd.length; i++) {
                const u = usersToAdd[i];
                const id = `demo_user_${i+1}`;
                
                // UserFactory ile kullanıcı nesnesinin oluşturulması
                const observer = UserFactory.createUser(u.type, { id, name: u.name, channels: u.channels });
                
                this.publisher.subscribe(observer);
                this.domManager.showToast(`Kullanıcı eklendi: ${u.name} (${u.type === 'student' ? 'Öğrenci' : 'Öğretmen'})`, "success");
                await sleep(1000);
            }

            // Kaydet (Reaktif abonelik ile otomatik olarak yapılıyor)

            // Adım 3: Duyuru Sayfasına Geç
            this.domManager.showToast("Adım 2/6: Duyuru Oluşturma arayüzü otomatik olarak hazırlanıyor...", "info");
            this.domManager.switchTab('tab-create-announcement');
            await sleep(1500);

            // Arayüzdeki form alanlarını simülatif olarak doldur
            this.domManager.announcementTitle.value = "BİL 3204 Yazılım Mimarisi Final Sınavı";
            this.domManager.titleCharCounter.textContent = `${this.domManager.announcementTitle.value.length}/100`;
            
            this.domManager.announcementContent.value = "Final sınavı 25 Mayıs 2026 tarihinde saat 14:00'da sınıflarda yüz yüze yapılacaktır. Sınavda Tasarım Desenleri (Observer, Factory, Singleton) ve Katmanlı Mimari konuları sorulacaktır. Tüm öğrencilerimize başarılar dileriz.";
            this.domManager.contentCharCounter.textContent = `${this.domManager.announcementContent.value.length}/2000`;
            
            this.domManager.announcementPriority.value = "high";
            this.domManager.announcementAudience.value = "student"; // Yalnızca öğrenciler hedefleniyor!
            
            // Sınav kartını seç
            this.domManager.typeCards.forEach(c => c.classList.remove('selected'));
            const examCard = Array.from(this.domManager.typeCards).find(c => c.querySelector('input').value === 'exam');
            if (examCard) {
                examCard.classList.add('selected');
                examCard.querySelector('input').checked = true;
            }

            this.domManager.showToast("Adım 3/6: Sınav Duyurusu verileri dolduruldu.", "success");
            await sleep(2000);

            // Adım 4: Duyuruyu Yayınla
            this.domManager.showToast("Adım 4/6: Duyuru yayınlanıyor (AnnouncementFactory devreye giriyor)...", "info");
            await sleep(1500);

            // Fabrikadan duyuru nesnesini oluştur
            const examAnnouncement = AnnouncementFactory.createAnnouncement('exam', {
                title: this.domManager.announcementTitle.value,
                content: this.domManager.announcementContent.value,
                priority: this.domManager.announcementPriority.value,
                targetAudience: this.domManager.announcementAudience.value,
                sender: 'Prof. Dr. Fatma Şahin'
            });

            // Duyuruyu yayınla (Publisher tetiklenir, hem reaktif kaydeder hem de arayüzü çizer)
            this.publisher.publish(examAnnouncement);
            
            // Veritabanını güncelle (Reaktif abonelik ile otomatik olarak yapılıyor)
            
            this.domManager.showToast("Duyuru yayınlandı! Gözlemciler aranıyor...", "success");
            await sleep(2000);

            // Adım 5: Bildirim ve Observer Analizi
            this.domManager.showToast("Adım 5/6: Observer yapısı ile ilgili kullanıcılar bilgilendiriliyor...", "info");
            await sleep(1800);

            this.domManager.showToast("Mehmet Demir (Öğrenci) ➔ SMS ve Mobil bildirimleri aldı.", "success");
            this.domManager.showToast("Ayşe Kaya (Öğrenci) ➔ E-posta ve Mobil bildirimleri aldı.", "success");
            this.domManager.showToast("Prof. Dr. Fatma Şahin (Öğretmen) ➔ Hedef kitle dışı olduğu için filtrelendi.", "info");

            await sleep(2000);

            // Adım 6: Bildirimlerin Raporlanması
            this.domManager.showToast("Adım 6/6: Gönderim kayıtları ve sistem logları inceleniyor...", "info");
            this.domManager.switchTab('tab-system-logger');
            
            await sleep(2000);
            
            this.domManager.showToast("Demo senaryosu başarıyla tamamlandı!", "success");
            
            // Formu temizle
            this.domManager.announcementTitle.value = '';
            this.domManager.announcementContent.value = '';
            this.domManager.titleCharCounter.textContent = '0/100';
            this.domManager.contentCharCounter.textContent = '0/2000';
            this.domManager.announcementPriority.value = 'medium';
            this.domManager.announcementAudience.value = 'all';

        } catch (error) {
            console.error("Demo Senaryo Hatası:", error);
            this.domManager.showToast("Demo senaryosu çalışırken hata oluştu!", "error");
        }
    }
}
