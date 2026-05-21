import { NotificationFactory } from '../domain/notification-factory.js';
import { Logger } from './logger.js';

/**
 * Bildirim Koordinasyon Merkezi (NotificationCenter) - Singleton Pattern
 * Sistemdeki tüm bildirimlerin (Email, SMS, Mobil) dağıtılmasından ve geçmişinden sorumludur.
 */
export class NotificationCenter {
    static instance = null;

    /**
     * Singleton Sınıf Örneğini Dönen Metod
     * @returns {NotificationCenter}
     */
    static getInstance() {
        if (!NotificationCenter.instance) {
            NotificationCenter.instance = new NotificationCenter();
        }
        return NotificationCenter.instance;
    }

    constructor() {
        if (NotificationCenter.instance) {
            return NotificationCenter.instance;
        }
        this.notifications = [];
        this.listeners = []; // Bildirim eklendiğinde tetiklenecek callback dinleyicileri
        NotificationCenter.instance = this;
    }

    /**
     * Gözlemci (User) için bildirim oluşturur ve gönderir
     * @param {User} recipient - Bildirimi alan gözlemci kullanıcı
     * @param {string} channel - Gönderim kanalı ('email', 'sms', 'push')
     * @param {Announcement} announcement - Bildirimin konusu olan duyuru
     */
    send(recipient, channel, announcement) {
        // İlgili duyuru tipine göre bildirim mesajı hazırlama
        const message = this.formatMessage(announcement);

        try {
            // Factory Pattern: Uygun bildirim kanal nesnesinin üretilmesi
            const notification = NotificationFactory.createNotification(channel, recipient, message);
            
            // Bildirimi "gönder" (Konsola yazar) ve dönen log metnini yakala
            const logMsg = notification.send();

            // Logger'a kaydet (Uygulama katmanında loglama)
            Logger.getInstance().log(logMsg, 'success', 'Infrastructure');

            // Gönderim geçmişine ekle
            this.notifications.unshift(notification);

            // Bellek sızıntılarını önlemek için kapasite sınırı (en fazla 200 bildirim sakla)
            if (this.notifications.length > 200) {
                this.notifications = this.notifications.slice(0, 200);
            }

            // Dinleyicileri uyar (Arayüz güncellemesi için)
            this.notifyListeners(notification);
            
        } catch (error) {
            Logger.getInstance().log(
                `Bildirim gönderim hatası (Alıcı: ${recipient.name}, Kanal: ${channel}): ${error.message}`,
                'error',
                'Application'
            );
        }
    }

    /**
     * Duyuru türüne göre mesaj metnini formatlar
     * @param {Announcement} announcement 
     * @returns {string} Formatlanmış bildirim mesajı
     */
    formatMessage(announcement) {
        let typeLabel = "Kampüs Duyurusu";
        switch (announcement.type) {
            case 'exam': typeLabel = "Sınav Tarihi Güncellemesi"; break;
            case 'food': typeLabel = "Yemekhane Günlük Menüsü"; break;
            case 'seminar': typeLabel = "Seminer / Etkinlik"; break;
            case 'library': typeLabel = "Kütüphane Bildirisi"; break;
        }
        return `[Yeni ${typeLabel}] ${announcement.title}: ${announcement.content.substr(0, 80)}${announcement.content.length > 80 ? '...' : ''}`;
    }

    /**
     * Tüm bildirim geçmişini alma
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * Arayüz güncellemelerini yakalamak için abonelik
     * @param {function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Dinleyicileri tetikleme
     */
    notifyListeners(notification) {
        this.listeners.forEach(callback => {
            try {
                callback(notification, this.notifications);
            } catch (err) {
                console.error("NotificationCenter dinleyici tetikleme hatası:", err);
            }
        });
    }

    /**
     * Bildirim geçmişini sıfırlama (Demo senaryoları için)
     */
    clearHistory() {
        this.notifications = [];
        Logger.getInstance().log("Bildirim geçmişi temizlendi.", "info", "Application");
    }
}
