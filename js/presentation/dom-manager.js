import { Logger } from '../application/logger.js';
import { NotificationCenter } from '../application/notification-center.js';
import { UserComponent } from './components/user-component.js';
import { AnnouncementComponent } from './components/announcement-component.js';
import { NotificationComponent } from './components/notification-component.js';
import { LogComponent } from './components/log-component.js';
import { DemoComponent } from './components/demo-component.js';
import { TutorialComponent } from './components/tutorial-component.js';

/**
 * Arayüz ve DOM Yöneticisi (DOMManager) - Presentation Layer
 * Tab geçişlerini, genel sayaçları ve toast bildirimlerini yönetir.
 * SRP uyumluluğu için alt bileşenlerin (User, Announcement, Notification, Log, Demo)
 * koordinasyonunu sağlayan hafif bir Arabulucudur (Mediator).
 */
export class DOMManager {
    constructor(publisher) {
        this.publisher = publisher;
        this.logger = Logger.getInstance();
        this.notifCenter = NotificationCenter.getInstance();

        // UI Durumları
        this.activeFilterUsers = 'all'; // 'all', 'student', 'teacher'
        this.activeFilterLog = 'all'; // 'all', 'info', 'success', 'warning', 'error'
        
        // Element Seçimleri
        this.initDOMElements();

        // Alt Bileşenlerin/Görünümlerin Örneklenmesi (Modular Components)
        this.userComp = new UserComponent(this);
        this.announcementComp = new AnnouncementComponent(this);
        this.notificationComp = new NotificationComponent(this);
        this.logComp = new LogComponent(this);
        this.demoComp = new DemoComponent(this);
        this.tutorialComp = new TutorialComponent(this);
        this.initTheme();
    }

    /**
     * Tüm DOM elementlerinin referanslarını alır
     */
    initDOMElements() {
        // Sekmeler ve Navigasyon
        this.navItems = document.querySelectorAll('.nav-item');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.mainViewport = document.getElementById('main-viewport');
        this.btnDemo = document.getElementById('btn-demo-scenario');
        this.linkButtons = document.querySelectorAll('[data-tab-switch]');

        // Sayaçlar
        this.countUsers = document.getElementById('count-users');
        this.countAnnouncements = document.getElementById('count-announcements');
        this.countNotifications = document.getElementById('count-notifications');
        this.countLogs = document.getElementById('count-logs');
        this.badgeNotifCount = document.getElementById('badge-notifications-count');

        // Kullanıcı Yönetimi
        this.formAddUser = document.getElementById('form-add-user');
        this.userFullname = document.getElementById('user-fullname');
        this.userType = document.getElementById('user-type');
        this.prefEmail = document.getElementById('pref-email');
        this.prefSMS = document.getElementById('pref-sms');
        this.prefMobile = document.getElementById('pref-mobile');
        this.widgetUsersList = document.getElementById('widget-users-list');
        this.widgetUsersCount = document.getElementById('widget-users-count');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.panelUsersGrid = document.getElementById('panel-users-grid');

        // Duyuru Oluşturma
        this.formCreateAnnouncement = document.getElementById('form-create-announcement');
        this.announcementTitle = document.getElementById('announcement-title');
        this.announcementContent = document.getElementById('announcement-content');
        this.announcementPriority = document.getElementById('announcement-priority');
        this.announcementAudience = document.getElementById('announcement-audience');
        this.announcementSchedule = document.getElementById('announcement-schedule');
        this.typeCards = document.querySelectorAll('.type-card');
        this.titleCharCounter = document.getElementById('title-char-counter');
        this.contentCharCounter = document.getElementById('content-char-counter');

        // Yayınlanan Duyurular & Bildirimler Widgetları
        this.widgetAnnouncementsList = document.getElementById('widget-announcements-list');
        this.widgetNotificationsList = document.getElementById('widget-notifications-list');

        // Yayınlanan Duyurular & Bildirimler Panelleri
        this.panelAnnouncementsList = document.getElementById('panel-announcements-list');
        this.panelNotificationsList = document.getElementById('panel-notifications-list');
        
        // Arama ve Filtreler
        this.searchAnnouncements = document.getElementById('search-announcements');
        this.filterAnnType = document.getElementById('filter-announcement-type');
        this.filterAnnPriority = document.getElementById('filter-announcement-priority');
        this.searchNotifications = document.getElementById('search-notifications');
        this.filterNotifChannel = document.getElementById('filter-notification-channel');

        // Logger Ekranı
        this.loggerConsole = document.getElementById('logger-console-output');
        this.btnClearLogs = document.getElementById('btn-clear-logs');
        this.logFilterButtons = document.querySelectorAll('.log-filter-btn');
        this.searchLogs = document.getElementById('search-logs');
        this.toastContainer = document.getElementById('toast-container');
        this.btnShowLogger = document.getElementById('btn-show-logger');
        this.btnBackToForms = document.querySelectorAll('.btn-back-to-form');
        this.btnToggleTheme = document.getElementById('btn-toggle-theme');
    }

    /**
     * Olay Dinleyicilerini (Event Listeners) bağlar ve dinleme başlatır
     */
    bindEvents() {
        this.logger.log("Presentation Layer: Arabulucu olay dinleyicileri bağlanıyor...", "info", "Presentation");

        // Tema Değiştirme Butonu Olay Dinleyicisi
        if (this.btnToggleTheme) {
            this.btnToggleTheme.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 1. Tab Değiştirme Dinleyicileri
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Widget "Tümünü Gör" Bağlantıları
        this.linkButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab-switch');
                this.switchTab(targetTab);
            });
        });

        // 2. Geri Dön Butonları Olay Dinleyicisi
        if (this.btnBackToForms) {
            this.btnBackToForms.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.switchTab('tab-create-announcement');
                });
            });
        }

        // 3. Logger Butonu Olay Dinleyicisi (Form panel başlığındaki ikon)
        if (this.btnShowLogger) {
            this.btnShowLogger.addEventListener('click', () => {
                this.switchTab('tab-system-logger');
            });
        }

        // 4. Alt Bileşenlerin Kendi Dinleyicilerini Bağla (Deconstruction of Events)
        this.userComp.bindEvents();
        this.announcementComp.bindEvents();
        this.notificationComp.bindEvents();
        this.logComp.bindEvents();
        this.demoComp.bindEvents();
        this.tutorialComp.bindEvents();

        // 5. Uygulama Veri Akışı Abonelikleri (Reaktif Arayüz Yenilemeleri)
        this.publisher.subscribeUI(() => {
            this.announcementComp.renderAnnouncements();
            this.updateStats();
        });

        this.publisher.subscribeUsersUI(() => {
            this.userComp.renderUsers();
            this.updateStats();
        });

        this.notifCenter.subscribe(() => {
            this.notificationComp.renderNotifications();
            this.updateStats();
        });

        this.logger.subscribe(() => {
            this.logComp.renderLogs();
            this.updateStats();
        });
    }

    /**
     * Sekmeler (Tabs) arasında geçiş yapar ve ilgili sınıfları günceller
     * @param {string} tabId 
     */
    switchTab(tabId) {
        this.navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.tabPanels.forEach(panel => {
            if (panel.id === tabId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Sekme değiştiğinde sayfayı yukarı pürüzsüz kaydır
        window.scrollTo(0, 0);

        // Arayüz geçiş logu
        this.logger.log(`Arayüz sekmesi değiştirildi ➔ #${tabId}`, 'info', 'Presentation');
    }

    /**
     * Toast Alert (Bildirim Kutusu) gösterir
     * @param {string} message - Bildirim mesajı
     * @param {string} type - Tür ('success', 'info', 'error')
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'info') {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        } else {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        }

        toast.innerHTML = `${iconSvg} <span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        // 3.5 saniye sonra yok et
        setTimeout(() => {
            toast.style.animation = 'toast-slide-in var(--transition-normal) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    /**
     * İstatistik sayaçlarını günceller
     */
    updateStats() {
        this.countUsers.textContent = this.publisher.getObservers().length;
        this.countAnnouncements.textContent = this.publisher.getAnnouncements().length;
        this.countNotifications.textContent = this.notifCenter.getNotifications().length;
        this.countLogs.textContent = this.logger.getLogs().length;
        this.badgeNotifCount.textContent = this.notifCenter.getNotifications().length;
    }

    /**
     * Kaydedilen tema bilgisini localStorage'dan okuyarak arayüzü başlatır.
     */
    initTheme() {
        const savedTheme = localStorage.getItem('kampus_theme') || 'dark';
        const isLight = savedTheme === 'light';
        
        if (isLight) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        // Bir sonraki tick'te ikonun güncellendiğinden emin olalım (DOM hazır olduğunda)
        setTimeout(() => this.updateThemeIcon(isLight), 0);
    }

    /**
     * Arayüzün aktif temasını açık ve koyu tema arasında değiştirir.
     */
    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('kampus_theme', isLight ? 'light' : 'dark');
        this.updateThemeIcon(isLight);
        
        const message = isLight ? 'Açık renk temaya geçildi!' : 'Koyu renk temaya geçildi!';
        this.showToast(message, 'info');
        this.logger.log(`Tema değiştirildi ➔ ${isLight ? 'Açık Tema' : 'Koyu Tema'}`, 'success', 'Presentation');
    }

    /**
     * Tema butonundaki SVG ikonunu ve tooltip bilgisini aktif temaya göre günceller.
     * @param {boolean} isLight 
     */
    updateThemeIcon(isLight) {
        if (!this.btnToggleTheme) return;
        
        if (isLight) {
            // Sun icon (Açık tema aktifken sun ikonu gösterilir, koyu temaya geçişi simgeler)
            this.btnToggleTheme.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
            this.btnToggleTheme.setAttribute('title', 'Koyu Temaya Geç');
        } else {
            // Moon icon (Koyu tema aktifken moon ikonu gösterilir, açık temaya geçişi simgeler)
            this.btnToggleTheme.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
            this.btnToggleTheme.setAttribute('title', 'Açık Temaya Geç');
        }
    }

    // Geriye dönük uyumluluk (backwards compatibility) delegasyon metotları
    renderUsers() {
        this.userComp.renderUsers();
    }

    renderAnnouncements() {
        this.announcementComp.renderAnnouncements();
    }

    renderNotifications() {
        this.notificationComp.renderNotifications();
    }

    renderLogs() {
        this.logComp.renderLogs();
    }
}
