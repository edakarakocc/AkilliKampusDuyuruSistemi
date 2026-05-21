/**
 * Sistem Olay Günlükleyicisi (Logger) - Singleton Pattern
 * Uygulamanın tüm katmanlarından gelen günlük kayıtlarını toplar ve saklar.
 */
export class Logger {
    static instance = null;

    /**
     * Singleton Sınıf Örneğini Dönen Metod
     * @returns {Logger}
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        this.logs = [];
        this.listeners = []; // Log güncellendiğinde tetiklenecek callback dinleyicileri
        Logger.instance = this;
    }

    /**
     * Yeni olay kaydı (log) ekleme metodu
     * @param {string} message - Log mesajı
     * @param {string} level - Log seviyesi ('info', 'success', 'warning', 'error')
     * @param {string} layer - Logun tetiklendiği katman ('Domain', 'Application', 'Infrastructure', 'Presentation')
     */
    log(message, level = 'info', layer = 'Application') {
        const logEntry = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            }),
            message,
            level,
            layer
        };

        this.logs.unshift(logEntry); // En yeni logu en başa koy

        // Bellek sızıntılarını önlemek için kapasite sınırı (en fazla 200 log sakla)
        if (this.logs.length > 200) {
            this.logs = this.logs.slice(0, 200);
        }

        // Dinleyicileri haberdar et (UI güncellemesi için)
        this.notifyListeners(logEntry);
    }

    /**
     * Log temizleme metodu
     */
    clear() {
        this.logs = [];
        this.log("Sistem olay günlükleri temizlendi.", "info", "Application");
    }

    /**
     * Tüm logları alma metodu
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Log dinleyici callback fonksiyonu kaydetme
     * @param {function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Dinleyicileri tetikleme
     */
    notifyListeners(logEntry) {
        this.listeners.forEach(callback => {
            try {
                callback(logEntry, this.logs);
            } catch (err) {
                console.error("Logger dinleyici tetikleme hatası:", err);
            }
        });
    }
}
