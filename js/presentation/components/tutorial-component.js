/**
 * Sistem Kullanım Rehberi Bileşeni (TutorialComponent) - Presentation Layer
 * Sistemin ilk kez kullanılmasında veya istek üzerine parlayan saydam cam maskelerle
 * adım adım mimariyi ve kullanımı anlatan interaktif rehber bileşeni.
 */
export class TutorialComponent {
    /**
     * @param {DOMManager} domManager - Ana arabulucu arayüz yöneticisi
     */
    constructor(domManager) {
        this.domManager = domManager;
        this.currentStep = 0;
        this.isActive = false;
        this.currentTargetEl = null;

        // Rehber Adımları Tanımı - UX Odaklı Sade Türkçe Metinler
        this.steps = [
            {
                target: null, // Ekranın ortası
                tab: 'tab-create-announcement',
                title: '🏫 Akıllı Kampüs Duyuru Sistemi',
                body: 'Sistemimize hoş geldiniz! Kampüs içi duyuruları ve kullanıcılara giden bildirim kanallarını kolayca yönetebileceğiniz bu panel için pratik bir rehber hazırladık.<br><br>Sistemi nasıl verimli kullanacağınızı keşfetmek için 5 adımlı hızlı bir tura çıkalım!'
            },
            {
                target: '#form-add-user',
                tab: 'tab-create-announcement',
                title: '👤 Kolay Kullanıcı Kaydı',
                body: 'Buradan sisteme yeni öğrenciler ve öğretmenler ekleyebilirsiniz. İsim yazıp e-posta, SMS veya Mobil kanallarını seçerek, bu kişilerin duyuruları hangi yollarla alacağını kolayca belirleyebilirsiniz.'
            },
            {
                target: '#form-create-announcement',
                tab: 'tab-create-announcement',
                title: '📣 Yeni Duyuru Yayınlama',
                body: 'Öğrencilerinize veya öğretmenlerinize ulaştırmak istediğiniz haberleri buradan yazıp gönderebilirsiniz. Sınav, seminer, yemekhane veya kütüphane kategorilerinden birini seçerek duyurunuzu anında hazırlayabilirsiniz.'
            },
            {
                target: '#btn-show-logger',
                tab: 'tab-create-announcement',
                title: '🖥️ Canlı İşlem Takibi',
                body: 'Bu ikona tıklayarak sistemin arka planında gerçekleşen tüm işlemleri, kullanıcı kayıtlarını ve giden bildirimleri canlı olarak takip edebileceğiniz konsol ekranını açabilirsiniz.'
            },
            {
                target: '.right-column',
                tab: 'tab-create-announcement',
                title: '🔔 Canlı Bildirim Akışı',
                body: 'Gönderdiğiniz tüm duyuruların geçmişi ve kullanıcılara anlık olarak giden mesajların canlı akışı bu sütunda listelenir. Kimin hangi kanaldan mesaj aldığını buradan takip edebilirsiniz.'
            },
            {
                target: '#btn-demo-scenario',
                tab: 'tab-create-announcement',
                title: '🤖 Otomatik Demo Deneyimi',
                body: 'Sistemi kendi kendinize denemekle uğraşmak istemiyorsanız, bu mor butona basarak sistemin otomatik olarak örnek kullanıcılar eklemesini ve duyuru göndererek çalışmasını keyifle izleyebilirsiniz!'
            }
        ];

        // UI Elemanlarının Dinamik Oluşturulması
        this.createTutorialElements();
    }

    /**
     * Rehber maske ve bilgi kartı elementlerini dinamik olarak sayfaya enjekte eder
     */
    createTutorialElements() {
        // 1. Ekranı Karartan Maske Overlay (Sadece tıklamaları engellemek ve introda karartmak için)
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        document.body.appendChild(this.overlay);

        // 2. Parlayan Spotlight Maskesi (Sayfa kaydırmalarından etkilenmeyen fixed eleman)
        this.spotlight = document.createElement('div');
        this.spotlight.className = 'tutorial-spotlight';
        document.body.appendChild(this.spotlight);

        // 3. Yönlendirme ve Bilgi Kartı
        this.card = document.createElement('div');
        this.card.className = 'tutorial-card';
        document.body.appendChild(this.card);
    }

    /**
     * Olay dinleyicilerini bağlar
     */
    bindEvents() {
        // Üst bardaki "Sistem Rehberi" butonunu dinle
        const btnStart = document.getElementById('btn-start-tutorial');
        if (btnStart) {
            btnStart.addEventListener('click', () => this.start());
        }

        // Pencere boyutu değiştiğinde spotlight ve kart konumunu güncelle
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.updatePosition(this.currentTargetEl);
            }
        });

        // Sayfa veya herhangi bir scrollable sütun kaydırıldığında da konumu koru (Event Capture kullanılır)
        window.addEventListener('scroll', () => {
            if (this.isActive) {
                this.updatePosition(this.currentTargetEl);
            }
        }, true);

        // Sayfa açıldığında ilk kez girenler için otomatik başlat
        setTimeout(() => {
            const completed = localStorage.getItem('kampus_tutorial_completed');
            if (!completed) {
                this.start();
            }
        }, 1200);
    }

    /**
     * Rehberi başlatır
     */
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.add('active');
        this.showStep(0);
        this.domManager.logger.log("Etkileşimli sistem rehberi başlatıldı.", "info", "Presentation");
    }

    /**
     * Rehberi durdurur ve temizler
     */
    stop() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.overlay.classList.remove('transparent');
        this.card.classList.remove('active');
        this.spotlight.classList.remove('active');
        this.currentTargetEl = null;

        // Varsa highlighted sınıfını temizle
        const highlighted = document.querySelector('.tutorial-highlighted');
        if (highlighted) {
            highlighted.classList.remove('tutorial-highlighted');
        }

        localStorage.setItem('kampus_tutorial_completed', 'true');
        this.domManager.logger.log("Etkileşimli sistem rehberi kapatıldı.", "info", "Presentation");
    }

    /**
     * Bir sonraki adıma geçer
     */
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.stop();
        }
    }

    /**
     * Bir önceki adıma geçer
     */
    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    /**
     * İlgili adımın detaylarını çizer ve konumlandırır
     * @param {number} index - Adım indeksi
     */
    showStep(index) {
        const step = this.steps[index];

        // 1. Gerekli sekme geçişini otomatik yap
        if (step.tab && this.domManager.tabPanels) {
            const activeTab = document.querySelector('.tab-panel.active');
            if (activeTab && activeTab.id !== step.tab) {
                this.domManager.switchTab(step.tab);
            }
        }

        // 2. Eski spotlight efektini kaldır
        const oldHighlighted = document.querySelector('.tutorial-highlighted');
        if (oldHighlighted) {
            oldHighlighted.classList.remove('tutorial-highlighted');
        }

        // 3. Bilgi kartı içeriğini güncelle
        const isLast = index === this.steps.length - 1;
        const isFirst = index === 0;

        // Adım noktalarını (dots) oluştur
        let dotsHtml = '';
        for (let i = 0; i < this.steps.length; i++) {
            dotsHtml += `<div class="tutorial-step-dot ${i === index ? 'active' : ''}"></div>`;
        }

        this.card.innerHTML = `
            <div class="tutorial-card-header">
                <h3>${step.title}</h3>
                <button class="tutorial-card-close" title="Kapat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-sm"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="tutorial-card-body">
                ${step.body}
            </div>
            <div class="tutorial-card-footer">
                <div class="tutorial-steps-indicator">
                    ${dotsHtml}
                </div>
                <div class="tutorial-nav-buttons">
                    ${!isFirst ? `<button class="tutorial-btn tutorial-btn-prev">Geri</button>` : ''}
                    <button class="tutorial-btn tutorial-btn-next">${isLast ? 'Bitir' : 'İleri'}</button>
                </div>
            </div>
        `;

        // 4. Kart Buton Olay Dinleyicileri
        this.card.querySelector('.tutorial-card-close').addEventListener('click', () => this.stop());
        this.card.querySelector('.tutorial-btn-next').addEventListener('click', () => this.next());
        
        const btnPrev = this.card.querySelector('.tutorial-btn-prev');
        if (btnPrev) {
            btnPrev.addEventListener('click', () => this.prev());
        }

        // 5. Hedef elemanı bul ve konumlandır
        let targetEl = null;
        if (step.target) {
            targetEl = document.querySelector(step.target);
        }

        this.currentTargetEl = targetEl;

        if (targetEl) {
            // Elemanı sayfada pürüzsüzce görünür kıl
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Kaydırma animasyonu tamamlandıktan sonra konumlandır
            setTimeout(() => {
                targetEl.classList.add('tutorial-highlighted');
                this.updatePosition(targetEl);
                this.card.classList.add('active');
            }, 300);
        } else {
            // Ekranın tam ortasına yerleştir
            this.updatePosition(null);
            this.card.classList.add('active');
        }
    }

    /**
     * Bilgi kartını ve spotlight'ı hedef elemana göre veya ekranın ortasına konumlandırır
     * @param {HTMLElement|null} targetEl - Hedef eleman
     */
    updatePosition(targetEl = null) {
        if (!targetEl) {
            // Target yoksa (Intro adımı gibi): Spotlight'ı gizle, overlay'i koyulaştır
            this.overlay.classList.remove('transparent');
            this.spotlight.classList.remove('active');

            const cardWidth = this.card.offsetWidth || 380;
            const cardHeight = this.card.offsetHeight || 180;
            const top = (window.innerHeight - cardHeight) / 2;
            const left = (window.innerWidth - cardWidth) / 2;
            this.card.style.top = `${top}px`;
            this.card.style.left = `${left}px`;
            return;
        }

        // Target varsa: Spotlight'ı konumlandır ve göster, overlay'i şeffaflaştır
        this.overlay.classList.add('transparent');

        const rect = targetEl.getBoundingClientRect();
        
        // Spotlight parlamasını ve dimming box-shadow'unu hedef elemanın üzerine yerleştir
        this.spotlight.style.top = `${rect.top}px`;
        this.spotlight.style.left = `${rect.left}px`;
        this.spotlight.style.width = `${rect.width}px`;
        this.spotlight.style.height = `${rect.height}px`;
        this.spotlight.classList.add('active');

        // Kart konumunu hesapla
        const cardWidth = this.card.offsetWidth || 380;
        const cardHeight = this.card.offsetHeight || 180;

        let top = rect.bottom + 15;
        let left = rect.left + (rect.width - cardWidth) / 2;

        // Ekran kenar taşmaları engellemesi
        if (left < 15) {
            left = 15;
        }
        if (left + cardWidth > window.innerWidth - 15) {
            left = window.innerWidth - cardWidth - 15;
        }

        // Eğer altta sığmıyorsa elemanın üstüne yerleştir
        if (top + cardHeight > window.innerHeight - 15) {
            top = rect.top - cardHeight - 15;
        }

        // Eğer üstte de sığmıyorsa elemanın yanına yerleştir
        if (top < 15) {
            top = rect.top + 15;
            if (rect.right + cardWidth + 15 < window.innerWidth) {
                left = rect.right + 15;
            } else if (rect.left - cardWidth - 15 > 0) {
                left = rect.left - cardWidth - 15;
            } else {
                // Son çare ekranın ortası
                top = (window.innerHeight - cardHeight) / 2;
                left = (window.innerWidth - cardWidth) / 2;
            }
        }

        this.card.style.top = `${top}px`;
        this.card.style.left = `${left}px`;
    }
}
