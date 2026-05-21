/**
 * Bildirim Bileşeni (NotificationComponent) - Presentation Layer
 * Bildirim arama/filtreleme çubuğu ve hem hızlı hem detaylı bildirim listelerini yönetir.
 */
export class NotificationComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.notifCenter = domManager.notifCenter;
    }

    /**
     * Bildirim olay dinleyicilerini bağlar
     */
    bindEvents() {
        const triggerNotificationFilter = () => this.renderNotifications();
        if (this.domManager.searchNotifications) {
            this.domManager.searchNotifications.addEventListener('input', triggerNotificationFilter);
        }
        if (this.domManager.filterNotifChannel) {
            this.domManager.filterNotifChannel.addEventListener('change', triggerNotificationFilter);
        }
    }

    /**
     * Bildirimleri (sidebar ve detay) render eder
     */
    renderNotifications() {
        const notifications = this.notifCenter.getNotifications();
        
        // Arama ve Filtre
        const query = this.domManager.searchNotifications ? this.domManager.searchNotifications.value.toLowerCase() : '';
        const channelFilter = this.domManager.filterNotifChannel ? this.domManager.filterNotifChannel.value : 'all';

        const filtered = notifications.filter(n => {
            const matchesQuery = n.recipient.name.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
            const matchesChannel = channelFilter === 'all' || n.channel === channelFilter;
            return matchesQuery && matchesChannel;
        });

        // 1. Sidebar Listesi
        this.domManager.widgetNotificationsList.innerHTML = '';
        if (notifications.length === 0) {
            this.domManager.widgetNotificationsList.innerHTML = `<div class="empty-state">Gönderilen bildirim yok</div>`;
        } else {
            // Son 6 bildirimi sidebar'da göster
            notifications.slice(0, 6).forEach(n => {
                const card = document.createElement('div');
                card.className = 'widget-notification-card';
                
                let channelLabel = 'E-posta';
                if (n.channel === 'sms') channelLabel = 'SMS';
                else if (n.channel === 'push') channelLabel = 'Mobil';

                const timeFormatted = new Date(n.timestamp).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});

                card.innerHTML = `
                    <div class="notif-header-line">
                        <span class="channel-pill channel-${n.channel}">${channelLabel}</span>
                        <span class="notif-time">${timeFormatted}</span>
                    </div>
                    <div class="notif-body">
                        <span class="notif-recipient">
                            👤 ${n.recipient.name}
                            <span class="notif-recipient-detail">${n.recipient.type === 'student' ? 'Öğrenci' : 'Öğretmen'}</span>
                        </span>
                        <span class="notif-message">${n.message}</span>
                    </div>
                `;

                this.domManager.widgetNotificationsList.appendChild(card);
            });
        }

        // 2. Detaylı Bildirim Sayfası
        this.domManager.panelNotificationsList.innerHTML = '';
        if (filtered.length === 0) {
            this.domManager.panelNotificationsList.innerHTML = `<div class="empty-state card" style="padding: 40px;">Kayıtlı bildirim gönderimi bulunamadı.</div>`;
        } else {
            filtered.forEach(n => {
                const card = document.createElement('div');
                card.className = 'detail-notification-card card';
                
                let iconWrapperClass = `detail-channel-icon-wrapper channel-${n.channel}`;
                let iconSvg = '';
                let channelText = '';

                switch (n.channel) {
                    case 'email':
                        channelText = 'E-posta';
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
                        break;
                    case 'sms':
                        channelText = 'SMS';
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
                        break;
                    case 'push':
                        channelText = 'Mobil Bildirim';
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
                        break;
                }

                const dateFormatted = new Date(n.timestamp).toLocaleDateString('tr-TR') + ' ' + new Date(n.timestamp).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
                const targetDetail = n.channel === 'sms' ? 'SMS gönderildi' : n.channel === 'email' ? 'E-posta gönderildi' : 'Push bildirimi gönderildi';

                card.innerHTML = `
                    <div class="detail-notif-left">
                        <div class="${iconWrapperClass}">
                            ${iconSvg}
                        </div>
                    </div>
                    <div class="detail-notif-middle">
                        <div class="detail-notif-meta">
                            <span class="detail-notif-recipient">👤 ${n.recipient.name} (${n.recipient.type === 'student' ? 'Öğrenci' : 'Öğretmen'})</span>
                            <span>•</span>
                            <span>Kanal: <strong>${channelText}</strong></span>
                        </div>
                        <span class="notif-message">${n.message}</span>
                    </div>
                    <div class="detail-notif-right">
                        <div>${targetDetail} ➔ <span style="color:var(--success);">Başarılı</span></div>
                        <div style="font-size:10px; color:var(--color-text-muted); margin-top:4px;">${dateFormatted}</div>
                    </div>
                `;

                this.domManager.panelNotificationsList.appendChild(card);
            });
        }
    }
}
