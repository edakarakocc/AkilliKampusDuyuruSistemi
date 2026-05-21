import { AnnouncementPublisher } from './application/announcement-publisher.js';
import { NotificationCenter } from './application/notification-center.js';
import { Logger } from './application/logger.js';
import { SystemStateManager } from './infrastructure/storage.js';
import { DOMManager } from './presentation/dom-manager.js';
import { StudentObserver, TeacherObserver } from './domain/user.js';
import { AnnouncementFactory } from './domain/announcement-factory.js';

/**
 * Akıllı Kampüs Duyuru Sistemi - Uygulama Giriş Noktası (Bootstrap)
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Singleton Örnekleri ve Servislerin Çekilmesi
    const logger = Logger.getInstance();
    const notificationCenter = NotificationCenter.getInstance();
    const stateManager = SystemStateManager.getInstance();
    
    logger.log("Uygulama Başlatma: Servisler ve altyapı yükleniyor...", "info", "Infrastructure");

    // 2. Duyuru Yayıncısının (Subject) Örneklenmesi
    const publisher = new AnnouncementPublisher();

    // 3. Kayıtlı Verilerin Yüklenmesi (Kalıcılık Katmanı)
    let loadedUsers = stateManager.loadUsers();
    let loadedAnnouncements = stateManager.loadAnnouncements();
    let loadedNotifications = stateManager.loadNotifications();
    let loadedLogs = stateManager.loadLogs();

    // 4. Veri Yoksa Varsayılan (Mock) Verilerin Oluşturulması (Açılışta "WOW" Etkisi İçin)
    if (loadedUsers.length === 0) {
        logger.log("Veri Deposu Boş: Örnek başlangıç verileri hazırlanıyor...", "warning", "Infrastructure");
        
        // Örnek Gözlemciler (Kullanıcılar)
        const defaultUsers = [
            new TeacherObserver('init_user_1', 'Prof. Dr. Fatma Şahin', { email: true, sms: true, push: true }),
            new StudentObserver('init_user_2', 'Mehmet Demir', { email: false, sms: true, push: true }),
            new StudentObserver('init_user_3', 'Ayşe Kaya', { email: true, sms: false, push: true })
        ];
        
        loadedUsers = defaultUsers;
        stateManager.saveUsers(defaultUsers);

        // Örnek Duyurular (Factory Pattern ile üretiliyor)
        const defaultAnnouncements = [
            AnnouncementFactory.createAnnouncement('food', {
                title: "Bu Haftanın Yemekhane Menüsü",
                content: "Pazartesi: Yayla Çorbası, Tavuk Sote, Pilav, Ayran. Salı: Mercimek Çorbası, İzmir Köfte, Makarna, Salata. Çarşamba: Domates Çorbası, Kıymalı Taze Fasulye, Bulgur Pilavı, Cacık.",
                priority: "low",
                targetAudience: "all",
                sender: "Yemekhane Müdürlüğü"
            }),
            AnnouncementFactory.createAnnouncement('seminar', {
                title: "Yapay Zeka ve Yazılım Mühendisliği Semineri",
                content: "Yapay zeka araçlarının (Gemini, Antigravity vb.) yazılım mühendisliği süreçlerine entegrasyonu ve kod yazım verimliliğine etkileri üzerine konuşulacaktır. Tüm akademik personel ve öğrencilerimiz davetlidir. Yer: D Blok Konferans Salonu, Saat: 14:00.",
                priority: "medium",
                targetAudience: "all",
                sender: "Yazılım Kulübü"
            }),
            AnnouncementFactory.createAnnouncement('exam', {
                title: "BİL 3204 Yazılım Mimarisi Final Sınavı",
                content: "BİL 3204 Yazılım Mimari ve Tasarımı dersi final sınavı 25 Mayıs 2026 Pazartesi günü saat 14:00'da sınıflarda yüz yüze yapılacaktır. Sınavda projenizde uyguladığınız tasarım desenlerinden (Observer, Factory, Singleton) ve katmanlı mimariden sorular sorulacaktır.",
                priority: "high",
                targetAudience: "student",
                sender: "Prof. Dr. Fatma Şahin"
            })
        ];

        loadedAnnouncements = defaultAnnouncements;
        stateManager.saveAnnouncements(defaultAnnouncements);

        // Örnek Gönderilmiş Bildirimler
        // Mehmet Demir (SMS ve Mobil) & Ayşe Kaya (E-posta ve Mobil) sınav duyurusunu almış gibi simüle edelim
        const examAnn = defaultAnnouncements[2];
        
        notificationCenter.send(defaultUsers[1], 'sms', examAnn);
        notificationCenter.send(defaultUsers[1], 'push', examAnn);
        notificationCenter.send(defaultUsers[2], 'email', examAnn);
        notificationCenter.send(defaultUsers[2], 'push', examAnn);

        loadedNotifications = notificationCenter.getNotifications();
        stateManager.saveNotifications(loadedNotifications);
    }

    // 5. Yüklenen Logları Logger'a Aktarma
    if (loadedLogs.length > 0) {
        logger.logs = loadedLogs;
    }

    // 6. Yüklenen Gözlemcileri (Kullanıcıları) Yayıncıya Abone Etme (Observer Kaydı)
    loadedUsers.forEach(user => {
        publisher.subscribe(user);
    });

    // 7. Yüklenen Duyuruları ve Bildirim Geçmişini Hafızaya Al
    publisher.announcements = loadedAnnouncements;
    notificationCenter.notifications = loadedNotifications;

    // Veri Depolama (Persistence) Kalıcılık Abonelikleri
    publisher.subscribeUI((announcement, announcements) => {
        stateManager.saveAnnouncements(announcements);
    });

    publisher.subscribeUsersUI((observers) => {
        stateManager.saveUsers(observers);
    });

    notificationCenter.subscribe((notification, notifications) => {
        stateManager.saveNotifications(notifications);
    });

    logger.subscribe((log, logs) => {
        stateManager.saveLogs(logs);
    });

    // 8. DOM Yöneticisinin (Presentation Layer) Başlatılması
    const domManager = new DOMManager(publisher);
    
    // Olayları Bağla
    domManager.bindEvents();

    // 9. İlk Render ve İstatistik Güncellemesi
    domManager.renderUsers();
    domManager.renderAnnouncements();
    domManager.renderNotifications();
    domManager.renderLogs();
    domManager.updateStats();

    logger.log("Uygulama başarıyla başlatıldı. Tüm katmanlar (Domain, Application, Infrastructure, Presentation) aktif.", "success", "Presentation");
});
