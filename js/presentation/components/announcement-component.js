import { AnnouncementFactory } from '../../domain/announcement-factory.js';

/**
 * Duyuru Bileşeni (AnnouncementComponent) - Presentation Layer
 * Duyuru yayınlama formu, arama/filtreleme çubuğu ve duyuru listelerini yönetir.
 */
export class AnnouncementComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.publisher = domManager.publisher;
    }

    /**
     * Duyuru olay dinleyicilerini bağlar
     */
    bindEvents() {
        // Duyuru Türü Seçim Kartları Animasyon ve Seçim Durumu
        this.domManager.typeCards.forEach(card => {
            const radio = card.querySelector('input[type="radio"]');
            card.addEventListener('click', () => {
                this.domManager.typeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                radio.checked = true;
            });
        });

        // Duyuru Karakter Sayaçları
        if (this.domManager.announcementTitle) {
            this.domManager.announcementTitle.addEventListener('input', (e) => {
                this.domManager.titleCharCounter.textContent = `${e.target.value.length}/100`;
            });
        }
        if (this.domManager.announcementContent) {
            this.domManager.announcementContent.addEventListener('input', (e) => {
                this.domManager.contentCharCounter.textContent = `${e.target.value.length}/2000`;
            });
        }

        // Duyuru Yayınlama Formu Gönderimi
        if (this.domManager.formCreateAnnouncement) {
            this.domManager.formCreateAnnouncement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateAnnouncementSubmit();
            });
        }

        // Duyuru Arama ve Filtreleme
        const triggerAnnouncementFilter = () => this.renderAnnouncements();
        if (this.domManager.searchAnnouncements) this.domManager.searchAnnouncements.addEventListener('input', triggerAnnouncementFilter);
        if (this.domManager.filterAnnType) this.domManager.filterAnnType.addEventListener('change', triggerAnnouncementFilter);
        if (this.domManager.filterAnnPriority) this.domManager.filterAnnPriority.addEventListener('change', triggerAnnouncementFilter);
    }

    /**
     * Duyuru oluşturma ve yayınlama işlemini ele alır
     */
    handleCreateAnnouncementSubmit() {
        const typeEl = document.querySelector('input[name="announcement-type"]:checked');
        const type = typeEl ? typeEl.value : 'exam';
        const title = this.domManager.announcementTitle.value.trim();
        const content = this.domManager.announcementContent.value.trim();
        const priority = this.domManager.announcementPriority.value;
        const targetAudience = this.domManager.announcementAudience.value;
        const schedule = this.domManager.announcementSchedule.value;

        if (!title || !content) {
            this.domManager.showToast("Lütfen başlık ve içerik alanlarını doldurun!", "error");
            return;
        }

        // Factory Pattern: Duyuru Tipine Göre Nesne Üretimi
        try {
            const announcement = AnnouncementFactory.createAnnouncement(type, {
                title,
                content,
                priority,
                targetAudience,
                sender: 'Prof. Dr. Fatma Şahin'
            });

            if (schedule === 'scheduled') {
                announcement.status = 'scheduled';
                this.publisher.publish(announcement);
                this.domManager.showToast("Duyuru ileri bir tarihe planlandı!", "info");
            } else {
                this.publisher.publish(announcement);
                this.domManager.showToast("Duyuru başarıyla yayınlandı!", "success");
            }

            // Form Sıfırlama
            this.domManager.announcementTitle.value = '';
            this.domManager.announcementContent.value = '';
            this.domManager.titleCharCounter.textContent = '0/100';
            this.domManager.contentCharCounter.textContent = '0/2000';
            this.domManager.announcementPriority.value = 'medium';
            this.domManager.announcementAudience.value = 'all';
            this.domManager.announcementSchedule.value = 'now';
            
            // İlk türü (Sınav) varsayılan seçili yap
            this.domManager.typeCards.forEach(c => c.classList.remove('selected'));
            this.domManager.typeCards[0].classList.add('selected');
            document.querySelector('input[name="announcement-type"][value="exam"]').checked = true;

            // Formu yukarı kaydır (Yayınlandığında en tepeye pürüzsüz geçiş)
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        } catch (error) {
            this.domManager.showToast("Duyuru oluşturulurken hata oluştu: " + error.message, "error");
        }
    }

    /**
     * Duyuru silme işlemini ele alır
     * @param {string} annId 
     */
    handleDeleteAnnouncement(annId) {
        this.publisher.deleteAnnouncement(annId);
        this.domManager.showToast("Duyuru sistemden kaldırıldı.", "info");
    }

    /**
     * Duyuruları (sidebar ve detay) render eder
     */
    renderAnnouncements() {
        const announcements = this.publisher.getAnnouncements();
        
        // Arama ve Filtreleri Çek
        const query = this.domManager.searchAnnouncements ? this.domManager.searchAnnouncements.value.toLowerCase() : '';
        const filterType = this.domManager.filterAnnType ? this.domManager.filterAnnType.value : 'all';
        const filterPriority = this.domManager.filterAnnPriority ? this.domManager.filterAnnPriority.value : 'all';

        const filtered = announcements.filter(a => {
            const matchesQuery = a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query);
            const matchesType = filterType === 'all' || a.type === filterType;
            const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
            return matchesQuery && matchesType && matchesPriority;
        });

        // 1. Sidebar Hızlı Liste
        this.domManager.widgetAnnouncementsList.innerHTML = '';
        if (announcements.length === 0) {
            this.domManager.widgetAnnouncementsList.innerHTML = `<div class="empty-state">Yayınlanan duyuru yok</div>`;
        } else {
            // Sidebar'da en fazla son 5 duyuruyu göster
            announcements.slice(0, 5).forEach(a => {
                const card = document.createElement('div');
                card.className = `widget-announcement-card ${a.type}`;
                
                let iconWrapperClass = `${a.type}-bg`;
                let iconSvg = '';
                
                switch (a.type) {
                    case 'exam':
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
                        break;
                    case 'food':
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
                        break;
                    case 'seminar':
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;
                        break;
                    case 'library':
                        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
                        break;
                }

                let targetLabel = "Herkes";
                if (a.targetAudience === 'student') targetLabel = "Öğrenciler";
                else if (a.targetAudience === 'teacher') targetLabel = "Öğretmenler";

                let statusBadge = `<span class="card-status-badge status-active">Yayında</span>`;
                if (a.status === 'scheduled') {
                    statusBadge = `<span class="card-status-badge status-scheduled">Planlandı</span>`;
                } else if (a.status === 'important') {
                    statusBadge = `<span class="card-status-badge status-important">Önemli</span>`;
                }

                const dateFormatted = new Date(a.timestamp).toLocaleDateString('tr-TR') + ' ' + new Date(a.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

                card.innerHTML = `
                    <div class="card-icon-area ${iconWrapperClass}">
                        ${iconSvg}
                    </div>
                    <div class="card-content-area">
                        <div class="card-title-line">
                            <h3>${a.title}</h3>
                            ${statusBadge}
                        </div>
                        <div class="card-meta-line">
                            <span class="type-text-${a.type}" style="font-weight:600; text-transform: capitalize;">${a.type === 'exam' ? 'Sınav Duyurusu' : a.type === 'food' ? 'Yemekhane' : a.type === 'seminar' ? 'Seminer' : 'Kütüphane'}</span>
                            <div class="meta-group">
                                <span>${targetLabel}</span>
                                <span class="bullet-dot"></span>
                                <span>${dateFormatted}</span>
                            </div>
                        </div>
                    </div>
                `;

                // Tıklandığında detay tabına geç
                card.addEventListener('click', () => {
                    this.domManager.switchTab('tab-all-announcements');
                });

                this.domManager.widgetAnnouncementsList.appendChild(card);
            });
        }

        // 2. Detaylı Duyurular Sayfası
        this.domManager.panelAnnouncementsList.innerHTML = '';
        if (filtered.length === 0) {
            this.domManager.panelAnnouncementsList.innerHTML = `<div class="empty-state card" style="grid-column: 1/-1; padding: 40px;">Kriterlere uygun yayınlanmış duyuru bulunamadı.</div>`;
        } else {
            filtered.forEach(a => {
                const card = document.createElement('div');
                card.className = `detail-announcement-card card ${a.type}`;
                
                let typeLabel = "Duyuru";
                let typeIcon = '';
                switch (a.type) {
                    case 'exam': typeLabel = "Sınav Duyurusu"; typeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`; break;
                    case 'food': typeLabel = "Yemekhane Menüsü"; typeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`; break;
                    case 'seminar': typeLabel = "Seminer Duyurusu"; typeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`; break;
                    case 'library': typeLabel = "Kütüphane Bildirisi"; typeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`; break;
                }

                let audienceText = "Tüm Kampüs";
                if (a.targetAudience === 'student') audienceText = "Öğrenciler";
                else if (a.targetAudience === 'teacher') audienceText = "Öğretmenler";

                const priorityLabels = { low: 'Düşük Öncelik', medium: 'Orta Öncelik', high: 'Yüksek Öncelik' };
                const dateFormatted = new Date(a.timestamp).toLocaleDateString('tr-TR') + ' ' + new Date(a.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

                card.innerHTML = `
                    <div class="detail-card-glow"></div>
                    <div class="detail-card-header">
                        <div class="detail-type-badge type-text-${a.type}">
                            ${typeIcon}
                            <span>${typeLabel}</span>
                        </div>
                        <button class="btn-delete-announcement" data-id="${a.id}" title="Duyuruyu Sil">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                    <h3 class="detail-card-title">${a.title}</h3>
                    <p class="detail-card-body">${a.content.replace(/\n/g, '<br>')}</p>
                    <div class="detail-card-footer">
                        <span>Hedef: <strong>${audienceText}</strong> (${priorityLabels[a.priority]})</span>
                        <span>${dateFormatted}</span>
                    </div>
                `;

                card.querySelector('.btn-delete-announcement').addEventListener('click', () => {
                    this.handleDeleteAnnouncement(a.id);
                });

                this.domManager.panelAnnouncementsList.appendChild(card);
            });
        }
    }
}
