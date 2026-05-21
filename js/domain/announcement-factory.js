import { 
    ExamAnnouncement, 
    FoodMenuAnnouncement, 
    SeminarAnnouncement, 
    LibraryAnnouncement 
} from './announcement.js';

/**
 * Duyuru Üretim Fabrikası (Factory Pattern)
 * Farklı tipte duyuru nesnelerinin merkezi olarak oluşturulmasından sorumludur.
 */
export class AnnouncementFactory {
    /**
     * İstenilen tipte duyuru nesnesi üretir
     * @param {string} type - Duyuru Tipi ('exam', 'food', 'seminar', 'library')
     * @param {object} data - Duyuru bilgileri (title, content, priority, targetAudience, sender)
     * @returns {Announcement} Üretilen somut duyuru nesnesi
     */
    static createAnnouncement(type, { id = null, title, content, priority, targetAudience, sender }) {
        const finalId = id || 'ann_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        let announcement;

        switch (type) {
            case 'exam':
                announcement = new ExamAnnouncement(finalId, title, content, priority, targetAudience, sender);
                break;
            case 'food':
                announcement = new FoodMenuAnnouncement(finalId, title, content, priority, targetAudience, sender);
                break;
            case 'seminar':
                announcement = new SeminarAnnouncement(finalId, title, content, priority, targetAudience, sender);
                break;
            case 'library':
                announcement = new LibraryAnnouncement(finalId, title, content, priority, targetAudience, sender);
                break;
            default:
                throw new Error(`Bilinmeyen duyuru tipi: ${type}`);
        }

        return announcement;
    }
}
