import { UserFactory } from '../domain/user-factory.js';
import { AnnouncementFactory } from '../domain/announcement-factory.js';
import { NotificationFactory } from '../domain/notification-factory.js';
import { Logger } from '../application/logger.js';

/**
 * Altyapı Durum ve Depolama Yöneticisi (SystemStateManager) - Singleton Pattern
 * LocalStorage entegrasyonu ile tüm verilerin kalıcı olmasını sağlar.
 * Nesne serileştirme ve geri yükleme (deserialization) işlemlerini yönetir.
 */
export class SystemStateManager {
    static instance = null;

    static getInstance() {
        if (!SystemStateManager.instance) {
            SystemStateManager.instance = new SystemStateManager();
        }
        return SystemStateManager.instance;
    }

    constructor() {
        if (SystemStateManager.instance) {
            return SystemStateManager.instance;
        }
        this.STORAGE_KEYS = {
            USERS: 'kampus_duyuru_users',
            ANNOUNCEMENTS: 'kampus_duyuru_announcements',
            NOTIFICATIONS: 'kampus_duyuru_notifications',
            LOGS: 'kampus_duyuru_logs'
        };
        SystemStateManager.instance = this;
    }

    /**
     * Kullanıcıları LocalStorage'a kaydeder
     * @param {Array<User>} users 
     */
    saveUsers(users) {
        try {
            const rawData = users.map(user => ({
                id: user.id,
                name: user.name,
                type: user.type,
                channels: user.channels,
                avatar: user.avatar
            }));
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(rawData));
        } catch (error) {
            console.error("Kullanıcılar kaydedilemedi:", error);
        }
    }

    /**
     * Kullanıcıları LocalStorage'dan yükler ve doğru gözlemci sınıflarına dönüştürür (Deserialization)
     * @returns {Array<User>}
     */
    loadUsers() {
        try {
            const dataStr = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (!dataStr) return [];

            const rawData = JSON.parse(dataStr);
            return rawData.map(raw => {
                return UserFactory.createUser(raw.type, raw);
            }).filter(Boolean);
        } catch (error) {
            Logger.getInstance().log("Kullanıcı verileri yüklenirken hata oluştu.", "error", "Infrastructure");
            return [];
        }
    }

    /**
     * Duyuruları LocalStorage'a kaydeder
     * @param {Array<Announcement>} announcements 
     */
    saveAnnouncements(announcements) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
        } catch (error) {
            console.error("Duyurular kaydedilemedi:", error);
        }
    }

    /**
     * Duyuruları LocalStorage'dan yükler ve doğru sınıflarına geri yükler
     * @returns {Array<Announcement>}
     */
    loadAnnouncements() {
        try {
            const dataStr = localStorage.getItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
            if (!dataStr) return [];

            const rawData = JSON.parse(dataStr);
            return rawData.map(raw => {
                const ann = AnnouncementFactory.createAnnouncement(raw.type, raw);
                if (ann) {
                    ann.timestamp = raw.timestamp;
                    ann.status = raw.status;
                }
                return ann;
            }).filter(Boolean);
        } catch (error) {
            Logger.getInstance().log("Duyuru verileri yüklenirken hata oluştu.", "error", "Infrastructure");
            return [];
        }
    }

    /**
     * Bildirimleri LocalStorage'a kaydeder
     * @param {Array<Notification>} notifications 
     */
    saveNotifications(notifications) {
        try {
            const rawData = notifications.map(notif => ({
                id: notif.id,
                channel: notif.channel,
                recipient: {
                    id: notif.recipient.id,
                    name: notif.recipient.name,
                    type: notif.recipient.type,
                    channels: notif.recipient.channels,
                    avatar: notif.recipient.avatar
                },
                message: notif.message,
                timestamp: notif.timestamp,
                status: notif.status
            }));
            localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(rawData));
        } catch (error) {
            console.error("Bildirimler kaydedilemedi:", error);
        }
    }

    /**
     * Bildirimleri LocalStorage'dan yükler ve sınıflarına geri dönüştürür
     * @returns {Array<Notification>}
     */
    loadNotifications() {
        try {
            const dataStr = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
            if (!dataStr) return [];

            const rawData = JSON.parse(dataStr);
            return rawData.map(raw => {
                const recipientUser = UserFactory.createUser(raw.recipient.type, raw.recipient);
                const notif = NotificationFactory.createNotification(raw.channel, recipientUser, raw.message, raw.id);
                if (notif) {
                    notif.timestamp = raw.timestamp;
                    notif.status = raw.status;
                }
                return notif;
            }).filter(Boolean);
        } catch (error) {
            Logger.getInstance().log("Bildirim verileri yüklenirken hata oluştu.", "error", "Infrastructure");
            return [];
        }
    }

    /**
     * Sistem loglarını kaydeder
     * @param {Array<object>} logs 
     */
    saveLogs(logs) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(logs));
        } catch (error) {
            console.error("Loglar kaydedilemedi:", error);
        }
    }

    /**
     * Sistem loglarını yükler
     * @returns {Array<object>}
     */
    loadLogs() {
        try {
            const dataStr = localStorage.getItem(this.STORAGE_KEYS.LOGS);
            return dataStr ? JSON.parse(dataStr) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Tüm veritabanını temizler
     */
    clearDatabase() {
        localStorage.removeItem(this.STORAGE_KEYS.USERS);
        localStorage.removeItem(this.STORAGE_KEYS.ANNOUNCEMENTS);
        localStorage.removeItem(this.STORAGE_KEYS.NOTIFICATIONS);
        localStorage.removeItem(this.STORAGE_KEYS.LOGS);
        Logger.getInstance().log("Tüm tarayıcı yerel veri deposu temizlendi.", "warning", "Infrastructure");
    }
}
