import { Logger } from './logger.js';
import { NotificationCenter } from './notification-center.js';

/**
 * Duyuru Yayınlayıcısı (AnnouncementPublisher / Subject) - Observer Pattern
 * Sisteme kayıtlı tüm Gözlemcileri (Kullanıcıları) saklar ve yeni duyuru eklendiğinde
 * onları otomatik olarak haberdar eder.
 */
export class AnnouncementPublisher {
    constructor() {
        this.observers = []; // Kayıtlı Gözlemciler (Kullanıcılar)
        this.announcements = []; // Sistemde yayınlanan duyurular
        this.listeners = []; // Yeni duyuru yayınlandığında tetiklenecek UI callbackleri
        this.userListeners = []; // Gözlemci (Kullanıcı) listesi güncellendiğinde tetiklenecek callback dinleyicileri
    }

    /**
     * Yeni Gözlemci Ekleme (Subscribe)
     * @param {User} observer - Kaydedilecek gözlemci nesnesi
     */
    subscribe(observer) {
        if (!observer) return;
        
        // Mükerrer kaydı önle
        const exists = this.observers.some(obs => obs.id === observer.id);
        if (exists) return;

        this.observers.push(observer);
        
        Logger.getInstance().log(
            `Kullanıcı gözlemci listesine eklendi: ${observer.name} (${observer.type === 'student' ? 'Öğrenci' : 'Öğretmen'})`,
            'info',
            'Application'
        );

        this.notifyUserListeners();
    }

    /**
     * Gözlemci Çıkarma (Unsubscribe)
     * @param {User} observer - Gözlemci listesinden çıkarılacak nesne
     */
    unsubscribe(observer) {
        if (!observer) return;
        
        const index = this.observers.findIndex(obs => obs.id === observer.id);
        if (index !== -1) {
            const removedUser = this.observers.splice(index, 1)[0];
            Logger.getInstance().log(
                `Kullanıcı gözlemci listesinden çıkarıldı: ${removedUser.name}`,
                'info',
                'Application'
            );
            this.notifyUserListeners();
        }
    }

    /**
     * Yeni Duyuru Yayınlama (Publish)
     * Bu metot duyuruyu kaydeder, log bırakır ve tüm gözlemcileri haberdar eder.
     * @param {Announcement} announcement - Yayınlanacak duyuru nesnesi
     */
    publish(announcement) {
        if (!announcement) return;

        Logger.getInstance().log(
            `Yeni duyuru yayınlandı: "${announcement.title}" (Hedef: ${announcement.targetAudience})`,
            'success',
            'Application'
        );

        // Duyurular listesine ekle
        this.announcements.unshift(announcement);

        // Gözlemcileri otomatik olarak haberdar et (Observer Pattern)
        this.notifyObservers(announcement);

        // Arayüzü güncellemek için dinleyicileri tetikle
        this.notifyListeners(announcement);
    }

    /**
     * Tüm Gözlemcileri Haberdar Etme (Notify Observers)
     * @param {Announcement} announcement - Gözlemcilere iletilecek duyuru nesnesi
     */
    notifyObservers(announcement) {
        Logger.getInstance().log(
            `Observer Pattern: ${this.observers.length} kayıtlı gözlemci kontrol ediliyor...`,
            'info',
            'Application'
        );

        // Her bir gözlemciyi sırayla uyar
        this.observers.forEach(observer => {
            try {
                // Her gözlemci kendi iş mantığını uygular ve aktif kanalları döner
                const activeChannels = observer.update(announcement);
                
                if (activeChannels === null) {
                    // Hedef kitle uyumsuzluğu nedeniyle filtrelendi
                    const roleLabel = observer.type === 'student' ? 'Öğrenci' : 'Öğretmen';
                    Logger.getInstance().log(
                        `${roleLabel} ${observer.name} duyuruyu filtreledi (Hedef kitle uyumsuz: ${announcement.targetAudience})`, 
                        'info', 
                        'Domain'
                    );
                    return;
                }

                // Gözlemci tetiklendi logu
                const roleObserverLabel = observer.type === 'student' ? 'Öğrenci Gözlemci' : 'Öğretmen Gözlemci';
                Logger.getInstance().log(
                    `${roleObserverLabel} tetiklendi: ${observer.name} duyurudan haberdar oldu -> "${announcement.title}"`,
                    'success',
                    'Domain'
                );

                // Bildirimleri tetikle
                if (activeChannels.length > 0) {
                    const notificationCenter = NotificationCenter.getInstance();
                    activeChannels.forEach(channel => {
                        notificationCenter.send(observer, channel, announcement);
                    });
                } else {
                    Logger.getInstance().log(
                        `${observer.name} bildirim kanalı seçmediği için bildirim gönderilemedi.`,
                        'warning',
                        'Application'
                    );
                }
            } catch (error) {
                Logger.getInstance().log(
                    `Gözlemci uyarılırken hata oluştu (${observer.name}): ${error.message}`,
                    'error',
                    'Application'
                );
            }
        });
    }

    /**
     * Arayüz güncellemelerini tetiklemek için abonelik
     * @param {function} callback 
     */
    subscribeUI(callback) {
        this.listeners.push(callback);
    }

    /**
     * UI Dinleyicilerini Tetikle
     */
    notifyListeners(announcement) {
        this.listeners.forEach(callback => {
            try {
                callback(announcement, this.announcements);
            } catch (err) {
                console.error("Publisher UI dinleyici tetikleme hatası:", err);
            }
        });
    }

    /**
     * Yayınlanan tüm duyuruları alma
     */
    getAnnouncements() {
        return this.announcements;
    }

    /**
     * Gözlemcileri alma
     */
    getObservers() {
        return this.observers;
    }

    /**
     * Kullanıcı değişikliği arayüz güncellemelerini tetiklemek için abonelik
     * @param {function} callback 
     */
    subscribeUsersUI(callback) {
        this.userListeners.push(callback);
    }

    /**
     * Kullanıcı değişikliği dinleyicilerini tetikler
     */
    notifyUserListeners() {
        this.userListeners.forEach(callback => {
            try {
                callback(this.observers);
            } catch (err) {
                console.error("Publisher User dinleyici hatası:", err);
            }
        });
    }

    /**
     * Duyuruyu kimliğine göre güvenli bir şekilde siler ve olay tetikler
     * @param {string} annId - Silinecek duyurunun ID'si
     * @returns {object|null} Silinen duyuru nesnesi veya bulunamadıysa null
     */
    deleteAnnouncement(annId) {
        const index = this.announcements.findIndex(a => a.id === annId);
        if (index !== -1) {
            const deleted = this.announcements.splice(index, 1)[0];
            Logger.getInstance().log(
                `Duyuru sistemden silindi: "${deleted.title}"`,
                'warning',
                'Application'
            );
            
            // UI ve kalıcılık abonelerini bilgilendir
            this.notifyListeners(null);
            return deleted;
        }
        return null;
    }

    /**
     * Duyuruları ve gözlemcileri sıfırlama (Demo senaryoları için)
     */
    clearAll() {
        this.announcements = [];
        this.observers = [];
        Logger.getInstance().log("Yayıncı verileri sıfırlandı.", "info", "Application");
        
        // Reaktif abonelikleri tetikle
        this.notifyListeners(null);
        this.notifyUserListeners();
    }
}
