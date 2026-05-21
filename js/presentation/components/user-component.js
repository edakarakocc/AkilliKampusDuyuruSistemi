import { UserFactory } from '../../domain/user-factory.js';

/**
 * Kullanıcı isminden akademik unvanları temizleyerek baş harfleri döndürür.
 * @param {string} name - Kullanıcı adı
 * @returns {string} Baş harfler (örneğin "Fatma Şahin" -> "FŞ")
 */
function getUserInitials(name) {
    if (!name) return 'U';
    let cleanName = name;
    let oldName;
    do {
        oldName = cleanName;
        cleanName = cleanName.replace(/^\s*(prof\.|dr\.|doç\.|yrd\.\s*doç\.|arş\.\s*gör\.|öğr\.\s*gör\.|öğr\.\s*üyesi|dr\s+|doç\s+|prof\s+|ve\s+)/gi, '').trim();
    } while (cleanName !== oldName);

    const parts = cleanName.split(/\s+/).filter(p => p.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Kullanıcı Bileşeni (UserComponent) - Presentation Layer
 * Kullanıcı ekleme formu, filtreleme butonları ve kullanıcı listelerini yönetir.
 */
export class UserComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.publisher = domManager.publisher;
    }

    /**
     * Kullanıcı olay dinleyicilerini bağlar
     */
    bindEvents() {
        // Kullanıcı Filtre Sekmeleri
        this.domManager.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.domManager.filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.domManager.activeFilterUsers = tab.getAttribute('data-filter');
                this.renderUsers();
            });
        });

        // Kullanıcı Ekleme Formu Gönderimi
        if (this.domManager.formAddUser) {
            this.domManager.formAddUser.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddUserSubmit();
            });
        }
    }

    /**
     * Kullanıcı kayıt işlemini ele alır
     */
    handleAddUserSubmit() {
        const fullname = this.domManager.userFullname.value.trim();
        const type = this.domManager.userType.value;
        const channels = {
            email: this.domManager.prefEmail.checked,
            sms: this.domManager.prefSMS.checked,
            push: this.domManager.prefMobile.checked
        };

        if (!fullname) {
            this.domManager.showToast("Lütfen isim ve soyisim giriniz!", "error");
            return;
        }

        const id = 'user_' + Date.now();
        
        // UserFactory ile kullanıcı nesnesinin oluşturulması
        const user = UserFactory.createUser(type, { id, name: fullname, channels });

        // Gözlemciyi Yayıncıya Kaydet (Reaktif akışı başlatır)
        this.publisher.subscribe(user);

        // Form Sıfırlama
        this.domManager.userFullname.value = '';
        this.domManager.prefEmail.checked = true;
        this.domManager.prefSMS.checked = false;
        this.domManager.prefMobile.checked = true;

        this.domManager.showToast(`${fullname} sisteme başarıyla eklendi!`, "success");
    }

    /**
     * Kullanıcı silme işlemini ele alır
     * @param {string} userId 
     */
    handleDeleteUser(userId) {
        const user = this.publisher.getObservers().find(obs => obs.id === userId);
        if (user) {
            this.publisher.unsubscribe(user);
            this.domManager.showToast(`${user.name} sistemden silindi.`, "info");
        }
    }

    /**
     * Kullanıcı listelerini (sidebar ve detay) render eder
     */
    renderUsers() {
        const observers = this.publisher.getObservers();
        
        // Filtreleme
        const filtered = observers.filter(user => {
            if (this.domManager.activeFilterUsers === 'all') return true;
            return user.type === this.domManager.activeFilterUsers;
        });

        // 1. Sidebar Hızlı Liste Render
        this.domManager.widgetUsersList.innerHTML = '';
        if (filtered.length === 0) {
            this.domManager.widgetUsersList.innerHTML = `<div class="empty-state">Kullanıcı bulunamadı</div>`;
        } else {
            filtered.forEach(user => {
                const item = document.createElement('div');
                item.className = 'user-list-item';
                
                const roleColorClass = user.type === 'teacher' ? 'role-teacher' : 'role-student';
                
                item.innerHTML = `
                    <div class="user-list-left">
                        <div class="user-avatar-wrapper">
                            <div class="user-avatar-initials ${roleColorClass}">
                                ${getUserInitials(user.name)}
                            </div>
                            <div class="user-role-badge ${roleColorClass}"></div>
                        </div>
                        <div class="user-item-info">
                            <span class="user-item-name">${user.name}</span>
                            <span class="user-item-role">${user.type === 'teacher' ? 'Öğretmen' : 'Öğrenci'}</span>
                        </div>
                    </div>
                    <div class="user-list-right">
                        <div class="preference-pill-icon ${user.channels.email ? 'enabled' : ''}" title="E-posta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div class="preference-pill-icon ${user.channels.sms ? 'enabled' : ''}" title="SMS">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="preference-pill-icon ${user.channels.push ? 'enabled' : ''}" title="Mobil">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                        </div>
                        <button class="btn-delete-user" data-id="${user.id}" title="Kullanıcıyı Sil">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                `;

                // Silme olayı
                item.querySelector('.btn-delete-user').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDeleteUser(user.id);
                });

                this.domManager.widgetUsersList.appendChild(item);
            });
        }

        this.domManager.widgetUsersCount.textContent = `${filtered.length} kullanıcı kayıtlı`;

        // 2. Detaylı Kullanıcı Tabu (Grid) Render
        this.domManager.panelUsersGrid.innerHTML = '';
        if (observers.length === 0) {
            this.domManager.panelUsersGrid.innerHTML = `<div class="empty-state card" style="grid-column: 1/-1; padding: 40px;">Sistemde kayıtlı kullanıcı bulunmamaktadır. Sol menüden ekleyebilirsiniz.</div>`;
        } else {
            observers.forEach(user => {
                const card = document.createElement('div');
                card.className = `detail-user-card card ${user.type}`;
                card.innerHTML = `
                    <button class="btn-detail-delete-user" data-id="${user.id}" title="Kullanıcıyı Sil">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-xs"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <div class="detail-user-avatar-initials detail-role-${user.type}">
                        ${getUserInitials(user.name)}
                    </div>
                    <div class="detail-user-info">
                        <h3 class="detail-user-name">${user.name}</h3>
                        <span class="detail-user-type-badge badge-${user.type}">${user.type === 'student' ? 'Öğrenci' : 'Öğretmen'}</span>
                    </div>
                    <div class="detail-user-preferences">
                        <div class="pref-badge ${user.channels.email ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <span>E-posta</span>
                        </div>
                        <div class="pref-badge ${user.channels.sms ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span>SMS</span>
                        </div>
                        <div class="pref-badge ${user.channels.push ? 'active' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                            <span>Mobil</span>
                        </div>
                    </div>
                `;

                card.querySelector('.btn-detail-delete-user').addEventListener('click', () => {
                    this.handleDeleteUser(user.id);
                });

                this.domManager.panelUsersGrid.appendChild(card);
            });
        }
    }
}
