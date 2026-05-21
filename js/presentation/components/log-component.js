/**
 * Log Terminali Bileşeni (LogComponent) - Presentation Layer
 * Olay günlükleme konsolunu, log filtreleme butonlarını ve temizleme işlemlerini yönetir.
 */
export class LogComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.logger = domManager.logger;
    }

    /**
     * Log olay dinleyicilerini bağlar
     */
    bindEvents() {
        // Log Temizleme
        if (this.domManager.btnClearLogs) {
            this.domManager.btnClearLogs.addEventListener('click', () => {
                this.logger.clear();
            });
        }

        // Logger Filtre Butonları
        this.domManager.logFilterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.domManager.logFilterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.domManager.activeFilterLog = btn.getAttribute('data-level');
                this.renderLogs();
            });
        });

        // Logger Arama
        if (this.domManager.searchLogs) {
            this.domManager.searchLogs.addEventListener('input', () => this.renderLogs());
        }
    }

    /**
     * Logger terminal ekranını render eder
     */
    renderLogs() {
        const logs = this.logger.getLogs();
        const filter = this.domManager.activeFilterLog;
        const query = this.domManager.searchLogs ? this.domManager.searchLogs.value.toLowerCase() : '';

        const filtered = logs.filter(log => {
            const matchesFilter = filter === 'all' || log.level === filter;
            const matchesQuery = log.message.toLowerCase().includes(query) || log.layer.toLowerCase().includes(query);
            return matchesFilter && matchesQuery;
        });

        this.domManager.loggerConsole.innerHTML = '';
        if (filtered.length === 0) {
            this.domManager.loggerConsole.innerHTML = `<div style="color:var(--color-text-muted); font-style:italic;">Olay günlüğü bulunmamaktadır.</div>`;
        } else {
            filtered.forEach(log => {
                const line = document.createElement('div');
                line.className = 'log-line';
                line.innerHTML = `
                    <span class="log-time">[${log.timestamp}]</span>
                    <span class="log-level level-${log.level}">${log.level.toUpperCase()}</span>
                    <span class="log-layer">[${log.layer}]</span>
                    <span class="log-msg">${log.message}</span>
                `;
                this.domManager.loggerConsole.appendChild(line);
            });
        }
    }
}
