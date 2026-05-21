/**
 * Gözlemci (Observer) arayüzünü taklit eden Temel Kullanıcı Sınıfı (Abstract-like Base Class)
 */
export class User {
    constructor(id, name, type, channels = { email: false, sms: false, push: false }, avatar = null) {
        if (this.constructor === User) {
            throw new Error("User sınıfı soyuttur ve doğrudan örneklenemez!");
        }
        this.id = id;
        this.name = name;
        this.type = type; // 'student' veya 'teacher'
        this.channels = channels; // { email: boolean, sms: boolean, push: boolean }
        this.avatar = avatar || this.getDefaultAvatar();
    }

    /**
     * Varsayılan profil resmi ataması
     */
    getDefaultAvatar() {
        return this.type === 'teacher' 
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
    }

    /**
     * Gözlemci Güncelleme Metodu (Observer Update Method)
     * Hedef kitle eşleşmesini kontrol eder ve tercih edilen aktif kanalları döndürür.
     * @param {Announcement} announcement - Yayınlanan yeni duyuru nesnesi
     * @returns {Array<string>|null} Aktif bildirim kanalları dizisi veya filtrelendi ise null
     */
    update(announcement) {
        // Hedef kitle filtreleme mantığı (Tamamen saf domain kuralı)
        if (announcement.targetAudience !== 'all' && announcement.targetAudience !== this.type) {
            return null; // Filtrelendi
        }
        
        // Kullanıcının tercih ettiği aktif bildirim kanallarını döndür
        return Object.keys(this.channels).filter(ch => this.channels[ch]);
    }
}

/**
 * Öğrenci Gözlemcisi (Concrete Observer)
 */
export class StudentObserver extends User {
    constructor(id, name, channels, avatar = null) {
        super(id, name, 'student', channels, avatar);
    }
}

/**
 * Öğretmen Gözlemcisi (Concrete Observer)
 */
export class TeacherObserver extends User {
    constructor(id, name, channels, avatar = null) {
        super(id, name, 'teacher', channels, avatar);
    }
}
