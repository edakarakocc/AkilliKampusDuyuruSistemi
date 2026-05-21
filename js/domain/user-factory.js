import { StudentObserver, TeacherObserver } from './user.js';

/**
 * Kullanıcı Üretim Fabrikası (Factory Pattern)
 * Farklı roldeki kullanıcı (Gözlemci) nesnelerinin merkezi olarak oluşturulmasından ve geri yüklenmesinden (reconstitution) sorumludur.
 */
export class UserFactory {
    /**
     * İlgili rolde kullanıcı (gözlemci) nesnesi üretir (Reconstitution desteğiyle)
     * @param {string} type - Kullanıcı Rolü ('student', 'teacher')
     * @param {object} data - Kullanıcı bilgileri (id, name, channels, avatar)
     * @returns {User} Üretilen somut kullanıcı nesnesi
     */
    static createUser(type, data) {
        const id = data.id || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const { name, channels, avatar } = data;
        
        switch (type) {
            case 'student':
                return new StudentObserver(id, name, channels, avatar);
            case 'teacher':
                return new TeacherObserver(id, name, channels, avatar);
            default:
                throw new Error(`Bilinmeyen kullanıcı tipi: ${type}`);
        }
    }
}
