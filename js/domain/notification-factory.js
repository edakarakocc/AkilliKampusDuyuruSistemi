import { 
    EmailNotification, 
    SMSNotification, 
    PushNotification 
} from './notification.js';

/**
 * Bildirim Üretim Fabrikası (Factory Pattern)
 * Farklı kanal bildirim nesnelerinin merkezi olarak oluşturulmasından sorumludur.
 */
export class NotificationFactory {
    /**
     * İlgili bildirim kanalı nesnesini üretir
     * @param {string} channel - Bildirim kanalı ('email', 'sms', 'push')
     * @param {User} recipient - Bildirimi alacak kullanıcı (Gözlemci)
     * @param {string} message - Bildirim mesaj içeriği
     * @returns {Notification} Üretilen somut bildirim nesnesi
     */
    static createNotification(channel, recipient, message, customId = null) {
        const id = customId || 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        let notification;

        switch (channel) {
            case 'email':
                notification = new EmailNotification(id, recipient, message);
                break;
            case 'sms':
                notification = new SMSNotification(id, recipient, message);
                break;
            case 'push':
                notification = new PushNotification(id, recipient, message);
                break;
            default:
                throw new Error(`Bilinmeyen bildirim kanalı: ${channel}`);
        }

        return notification;
    }
}
