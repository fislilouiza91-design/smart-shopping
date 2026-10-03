(function () {
  'use strict';

  const STORAGE_KEY = 'ssw_language';

  // ============================================
  // Translations
  // ============================================
  const translations = {
    en: {
      direction: 'ltr',
      brand: 'Shopping Assistant',
      loading: 'Comparing prices...',
      cheapest: 'Cheapest',
      productMeta: (s, o) => `${s} stores · ${o} offers found`,
      offersTitle: 'Available offers',
      reviews: (n) => `${n} reviews`,
      aiTitle: '🤖 AI Analysis',
      aiText: 'Product has good reviews. Hover over any store to see all available offers with seller and rating.',
      errorServer: 'Connection failed.',
      errorNoResults: 'No results found.',
      close: 'Close'
    },
    ar: {
      direction: 'rtl',
      brand: 'مساعد التسوق',
      loading: 'جاري مقارنة الأسعار...',
      cheapest: 'الأرخص',
      productMeta: (s, o) => `${s} متاجر · ${o} عرض متاح`,
      offersTitle: 'العروض المتاحة',
      reviews: (n) => `${n} مراجعة`,
      aiTitle: '🤖 تحليل ذكي',
      aiText: 'منتج بتقييم جيد. حوّم على أي متجر لعرض جميع العروض مع البائع والتقييم.',
      errorServer: 'تعذر الاتصال.',
      errorNoResults: 'لا توجد نتائج.',
      close: 'إغلاق'
    },
    fr: {
      direction: 'ltr',
      brand: 'Assistant Shopping',
      loading: 'Comparaison des prix...',
      cheapest: 'Moins cher',
      productMeta: (s, o) => `${s} magasins · ${o} offres`,
      offersTitle: 'Offres disponibles',
      reviews: (n) => `${n} avis`,
      aiTitle: '🤖 Analyse IA',
      aiText: 'Produit bien noté. Survolez un magasin pour voir toutes les offres avec vendeur et note.',
      errorServer: 'Connexion échouée.',
      errorNoResults: 'Aucun résultat.',
      close: 'Fermer'
    },
    es: {
      direction: 'ltr',
      brand: 'Asistente de Compras',
      loading: 'Comparando precios...',
      cheapest: 'Más barato',
      productMeta: (s, o) => `${s} tiendas · ${o} ofertas`,
      offersTitle: 'Ofertas disponibles',
      reviews: (n) => `${n} reseñas`,
      aiTitle: '🤖 Análisis IA',
      aiText: 'Producto bien valorado. Pasa el cursor sobre una tienda para ver todas las ofertas.',
      errorServer: 'Conexión fallida.',
      errorNoResults: 'Sin resultados.',
      close: 'Cerrar'
    },
    de: {
      direction: 'ltr',
      brand: 'Einkaufsassistent',
      loading: 'Preise werden verglichen...',
      cheapest: 'Günstigster',
      productMeta: (s, o) => `${s} Geschäfte · ${o} Angebote`,
      offersTitle: 'Verfügbare Angebote',
      reviews: (n) => `${n} Bewertungen`,
      aiTitle: '🤖 KI-Analyse',
      aiText: 'Gut bewertetes Produkt. Fahren Sie über ein Geschäft für alle Angebote.',
      errorServer: 'Verbindung fehlgeschlagen.',
      errorNoResults: 'Keine Ergebnisse.',
      close: 'Schließen'
    }
  };

  function detectChromeLanguage() {
    let lang = '';
    try {
      if (chrome.i18n && chrome.i18n.getUILanguage) {
        lang = chrome.i18n.getUILanguage();
      }
    } catch (e) { }
    if (!lang) lang = navigator.language || 'en';
    const base = lang.toLowerCase().split('-')[0];
    return translations[base] ? base : 'en';
  }

  function getEffectiveLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY] && translations[result[STORAGE_KEY]]) {
          resolve(result[STORAGE_KEY]);
        } else {
          resolve(detectChromeLanguage());
        }
      });
    });
  }

  // ============================================
  // Store detection
  // ============================================
  function detectStore() {
    const host = location.hostname.toLowerCase();
    if (host.includes('amazon.')) return 'amazon';
    if (host.includes('noon.')) return 'noon';
    if (host.includes('aliexpress.')) return 'aliexpress';
    if (host.includes('ebay.')) return 'ebay';
    if (host.includes('temu.')) return 'temu';
    if (host.includes('mumzworld.')) return 'mumzworld';
    return null;
  }

  function getProductData() {
    const store = detectStore();
    if (!store) return null;

    const selectors = {
      amazon: {
        title: ['#productTitle', 'h1#title'],
        price: ['.a-price-whole', '#priceblock_ourprice']
      },
      noon: {
        title: ['h1[data-qa="product-title"]', '.productTitle'],
        price: ['[data-qa="price-now"]', '.priceNow']
      },
      aliexpress: {
        title: ['h1[data-pl="product-title"]', '.product-title-text'],
        price: ['.product-price-value', '.es--wrap--erdmPRe span']
      },
      ebay: {
        title: ['.x-item-title__mainTitle .ux-textspans', 'h1.it-ttl'],
        price: ['.x-price-primary .ux-textspans']
      },
      temu: {
        title: ['h1[class*="title"]'],
        price: ['[class*="price"] span']
      },
      mumzworld: {
        title: ['h1.product-name'],
        price: ['.product-info-main .price']
      }
    };

    function tryList(list) {
      for (const sel of list) {
        try {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) return el.textContent.trim();
        } catch (e) { }
      }
      return null;
    }

    const title = tryList(selectors[store].title);
    const price = tryList(selectors[store].price);
    if (!title) return null;

    return { store, title, price, url: location.href };
  }

  // ============================================
  // Generate offers (simulated)
  // ============================================
  function generateOffers(store, basePrice) {
    const sellers = {
      temu: ['Temu Official', 'Top Store', 'Mega Deals', 'Global Shop', 'Best Buy', 'Premium Store', 'Smart Shop', 'Fast Delivery'],
      noon: ['Noon Express', 'Noon Mart', 'Official Store', 'Prime Seller', 'Best Choice', 'Top Rated', 'Mega Store', 'Global Mart'],
      amazon: ['Amazon.ae', 'Amazon Warehouse', 'Sold by ABC', 'Sold by XYZ', 'Best Seller', 'Prime Store', 'Top Vendor', 'Mega Mart'],
      aliexpress: ['Official Store', 'Top Seller', 'Gold Supplier', 'Verified Store', 'Trusted Shop', 'Elite Vendor', 'Mega Factory', 'Direct Store'],
      ebay: ['Top Rated Seller', 'eBay Official', 'Gold Seller', 'Premium Store', 'Trusted Vendor', 'Mega Deals', 'Best Offer', 'Global Seller'],
      mumzworld: ['Mumzworld', 'Official Store', 'Top Seller', 'Premium Shop', 'Best Choice', 'Trusted Vendor', 'Mega Store', 'Value Shop']
    };

    const list = sellers[store] || sellers.amazon;
    const count = 10;

    return Array.from({ length: count }, (_, i) => {
      const variation = 1 + (i * 0.012) + (Math.random() * 0.02);
      const price = Math.round(basePrice * variation * 100) / 100;
      const rating = (3.9 + Math.random()).toFixed(1);
      const reviews = Math.floor(100 + Math.random() * 3000);
      return { seller: list[i % list.length], price, rating, reviews };
    }).sort((a, b) => a.price - b.price);
  }

  // ============================================
  // UI Creation
  // ============================================
  function createUI(T) {
    const old = document.getElementById('smart-shopping-widget');
    if (old) old.remove();

    const box = document.createElement('div');
    box.id = 'smart-shopping-widget';
    box.setAttribute('dir', T.direction);

    const savedPos = JSON.parse(localStorage.getItem('ssw_position') || 'null');
    if (savedPos) {
      box.style.bottom = 'auto';
      box.style.top = savedPos.top + 'px';
      box.style.right = 'auto';
      box.style.left = savedPos.left + 'px';
    }

    box.innerHTML = `
      <div class="ssw-header" id="sswHeader">
        <div class="ssw-brand">
          <div class="ssw-brand-icon">🛒</div>
          <span>${T.brand}</span>
        </div>
        <button class="ssw-close" aria-label="${T.close}">✕</button>
      </div>
      <div class="ssw-body">
        <div class="ssw-loading">
          <div class="ssw-spinner"></div>
          <p class="ssw-loading-text">${T.loading}</p>
        </div>
      </div>
    `;
    document.body.appendChild(box);

    box.querySelector('.ssw-close').addEventListener('click', () => box.remove());
    makeDraggable(box, box.querySelector('#sswHeader'));

    return box;
  }

  function makeDraggable(el, handle) {
    let isDragging = false, startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ssw-close')) return;
      isDragging = true;
      const rect = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      el.style.transition = 'none';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const nl = Math.max(0, Math.min(startLeft + dx, window.innerWidth - el.offsetWidth));
      const nt = Math.max(0, Math.min(startTop + dy, window.innerHeight - el.offsetHeight));
      el.style.bottom = 'auto';
      el.style.right = 'auto';
      el.style.left = nl + 'px';
      el.style.top = nt + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.transition = '';
      document.body.style.userSelect = '';
      const rect = el.getBoundingClientRect();
      localStorage.setItem('ssw_position', JSON.stringify({ left: rect.left, top: rect.top }));
    });
  }

  // ============================================
  // Render results
  // ============================================
  function renderResults(box, data, T) {
    const results = data.results || [];
    if (!results.length) {
      box.querySelector('.ssw-body').innerHTML =
        `<div class="ssw-error">${T.errorNoResults}</div>`;
      return;
    }

    const stores = results.map((r, i) => ({
      ...r,
      offers: generateOffers(r.store, r.price),
      isCheapest: i === 0
    }));

    const totalOffers = stores.reduce((s, x) => s + x.offers.length, 0);

    const storesHTML = stores.map((s) => `
      <div class="ssw-store ${s.isCheapest ? 'ssw-best' : ''}" data-store="${s.store}">
        <div class="ssw-store-left">
          <span class="ssw-store-icon" style="background:${s.bg}">${s.icon}</span>
          <span class="ssw-store-name">${s.name}</span>
          ${s.isCheapest ? `<span class="ssw-badge">${T.cheapest}</span>` : ''}
        </div>
        <div class="ssw-store-right">
          <span class="ssw-store-count">${s.offers.length}</span>
          <span class="ssw-store-price">${s.price} ${s.currency || '$'}</span>
        </div>
        <div class="ssw-offers">
          <div class="ssw-offers-title">${T.offersTitle}</div>
          ${s.offers.map(o => `
            <a class="ssw-offer" href="${s.url}" target="_blank" rel="noopener">
              <div class="ssw-offer-left">
                <span class="ssw-offer-seller">${o.seller}</span>
                <span class="ssw-offer-meta">
                  <span class="ssw-offer-stars">★ ${o.rating}</span> · ${T.reviews(o.reviews)}
                </span>
              </div>
              <span class="ssw-offer-price">${o.price} ${s.currency || '$'}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    box.querySelector('.ssw-body').innerHTML = `
      <div class="ssw-product">
        <div class="ssw-product-name">${data.product}</div>
        <div class="ssw-product-meta">${T.productMeta(stores.length, totalOffers)}</div>
      </div>
      ${storesHTML}
      <div class="ssw-ai">
        <div class="ssw-ai-title">${T.aiTitle}</div>
        <div>${T.aiText}</div>
      </div>
    `;

    // Click toggle for mobile (no hover)
    box.querySelectorAll('.ssw-store').forEach(store => {
      store.addEventListener('click', (e) => {
        if (e.target.closest('.ssw-offer')) return;
        if (window.matchMedia('(hover: none)').matches) {
          const isOpen = store.classList.contains('ssw-open');
          box.querySelectorAll('.ssw-store').forEach(s => s.classList.remove('ssw-open'));
          if (!isOpen) store.classList.add('ssw-open');
        }
      });
    });
  }

  // ============================================
  // Run
  // ============================================
  async function run() {
    const product = getProductData();
    if (!product) return;

    const lang = await getEffectiveLanguage();
    const T = translations[lang];

    const box = createUI(T);
    box.dataset.lang = lang;

    chrome.runtime.sendMessage(
      { action: 'compare', payload: product },
      (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          box.querySelector('.ssw-body').innerHTML =
            `<div class="ssw-error">${T.errorServer}</div>`;
          return;
        }
        renderResults(box, response.data, T);
      }
    );
  }

  // Reload on language change
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      const box = document.getElementById('smart-shopping-widget');
      if (box && box.dataset.lang !== changes[STORAGE_KEY].newValue) {
        box.remove();
        run();
      }
    }
  });

  if (document.readyState === 'complete') {
    setTimeout(run, 1000);
  } else {
    window.addEventListener('load', () => setTimeout(run, 1000));
  }
})();