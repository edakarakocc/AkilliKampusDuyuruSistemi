/**
 * Temel Bildirim Sınıfı (Base Notification Class)
 */
export class Notification {
    constructor(id, channel, recipient, message) {
        if (this.constructor === Notification) {
            throw new Error("Notification sınıfı soyuttur ve doğrudan örneklenemez!");
        }
        this.id = id;
        this.channel = channel; // 'email', 'sms', 'push'
        this.recipient = recipient; // User (Gözlemci) nesnesi
        this.message = message; // Bildirim içeriği
        this.timestamp = new Date().toISOString();
        this.status = 'pending'; // 'pending', 'sent', 'failed'
    }

    /**
     * Bildirim gönderme metodu (Simülasyon)
     */
    send() {
        throw new Error("send() metodu alt sınıf tarafından uygulanmalıdır!");
    }
}

/**
 * E-posta Bildirim Sınıfı (Concrete Notification)
 */
export class EmailNotification extends Notification {
    constructor(id, recipient, message) {
        super(id, 'email', recipient, message);
    }

    send() {
        this.status = 'sent';
        const mockEmail = `${this.recipient.name.toLowerCase().replace(/\s+/g, '')}@universite.edu.tr`;
        const logMsg = `E-posta gönderildi ➔ Alıcı: ${this.recipient.name} (${mockEmail}), İçerik: "${this.message}"`;
        
        // Konsola yazdır
        console.log(`%c[EMAIL] ${logMsg}`, 'color: #3b82f6; font-weight: bold;');
        
        return logMsg;
    }
}

/**
 * SMS Bildirim Sınıfı (Concrete Notification)
 */
export class SMSNotification extends Notification {
    constructor(id, recipient, message) {
        super(id, 'sms', recipient, message);
    }

    send() {
        this.status = 'sent';
        const mockPhone = `+90 5XX XXX ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`;
        const logMsg = `SMS gönderildi ➔ Alıcı: ${this.recipient.name} (${mockPhone}), İçerik: "${this.message}"`;
        
        // Konsola yazdır
        console.log(`%c[SMS] ${logMsg}`, 'color: #10b981; font-weight: bold;');
        
        return logMsg;
    }
}

/**
 * Mobil Bildirim Sınıfı (Concrete Notification)
 */
export class PushNotification extends Notification {
    constructor(id, recipient, message) {
        super(id, 'push', recipient, message);
    }

    send() {
        this.status = 'sent';
        const logMsg = `Mobil bildirim (Push) gönderildi ➔ Alıcı: ${this.recipient.name} (Cihaz Token: push_${this.recipient.id}), İçerik: "${this.message}"`;
        
        // Konsola yazdır
        console.log(`%c[PUSH] ${logMsg}`, 'color: #8b5cf6; font-weight: bold;');
        
        return logMsg;
    }
}
