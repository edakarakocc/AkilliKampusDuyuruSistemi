/**
 * Temel Duyuru Sınıfı (Base Announcement Class)
 */
export class Announcement {
    constructor(id, type, title, content, priority = 'medium', targetAudience = 'all', sender = 'Sistem Yöneticisi') {
        if (this.constructor === Announcement) {
            throw new Error("Announcement sınıfı soyuttur ve doğrudan örneklenemez!");
        }
        this.id = id;
        this.type = type; // 'exam', 'food', 'seminar', 'library'
        this.title = title;
        this.content = content;
        this.priority = priority; // 'low', 'medium', 'high'
        this.targetAudience = targetAudience; // 'all', 'student', 'teacher'
        this.sender = sender;
        this.timestamp = new Date().toISOString();
        this.status = priority === 'high' ? 'important' : 'active'; // 'active', 'scheduled', 'important'
    }

    /**
     * Duyurunun detaylı özetini döndüren metod
     */
    getSummary() {
        return `[${this.type.toUpperCase()}] ${this.title} - Öncelik: ${this.priority}`;
    }
}

/**
 * Sınav Duyurusu Sınıfı (Concrete Announcement)
 */
export class ExamAnnouncement extends Announcement {
    constructor(id, title, content, priority, targetAudience, sender) {
        // Sınav duyuruları genellikle yüksek önceliklidir ve öğrencilerle ilgilidir
        super(id, 'exam', title, content, priority || 'high', targetAudience || 'student', sender);
        this.examCode = this.extractExamCode(title);
    }

    extractExamCode(title) {
        // Başlıktan ders kodunu çıkaran basit iş kuralı (Örn: BİL 3204)
        const match = title.match(/[A-Z]{3}\s?\d{4}/i);
        return match ? match[0].toUpperCase() : 'GENEL';
    }
}

/**
 * Yemekhane Menüsü Duyurusu Sınıfı (Concrete Announcement)
 */
export class FoodMenuAnnouncement extends Announcement {
    constructor(id, title, content, priority, targetAudience, sender) {
        // Yemekhane menüleri genellikle düşük veya orta önceliklidir ve herkese hitap eder
        super(id, 'food', title, content, priority || 'low', targetAudience || 'all', sender);
    }
}

/**
 * Seminer Duyurusu Sınıfı (Concrete Announcement)
 */
export class SeminarAnnouncement extends Announcement {
    constructor(id, title, content, priority, targetAudience, sender) {
        super(id, 'seminar', title, content, priority || 'medium', targetAudience || 'all', sender);
        this.seminarDate = new Date();
    }
}

/**
 * Kütüphane Duyurusu Sınıfı (Concrete Announcement)
 */
export class LibraryAnnouncement extends Announcement {
    constructor(id, title, content, priority, targetAudience, sender) {
        super(id, 'library', title, content, priority || 'medium', targetAudience || 'all', sender);
    }
}
