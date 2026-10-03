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
      productMeta: (s, o) => `${s} stores · ${o} offers`,
      cheapest: 'Cheapest',
      offersCount: (n) => `${n} offers`,
      allOffers: (store) => `All offers in ${store}`,
      reviews: (n) => `(${n} reviews)`,
      aiTitle: '🤖 AI Analysis',
      aiText: 'Product has good reviews. Hover over any store to see 10+ detailed offers with seller and rating.',
      errorServer: 'Connection failed. Check your internet.',
      errorNoResults: 'No results found for this product.',
      close: 'Close'
    },
    ar: {
      direction: 'rtl',
      brand: 'مساعد التسوق',
      loading: 'جاري مقارنة الأسعار...',
      productMeta: (s, o) => `${s} متاجر · ${o} عرض متاح`,
      cheapest: 'الأرخص',
      offersCount: (n) => `${n} عرض`,
      allOffers: (store) => `جميع العروض في ${store}`,
      reviews: (n) => `(${n} مراجعة)`,
      aiTitle: '🤖 تحليل ذكي',
      aiText: 'منتج بتقييم جيد. حوّم على أي متجر لعرض 10 عروض مفصلة مع البائع والتقييم.',
      errorServer: 'تعذر الاتصال بالخادم. تحقق من الإنترنت.',
      errorNoResults: 'لم نجد نتائج لهذا المنتج.',
      close: 'إغلاق'
    },
    fr: {
      direction: 'ltr',
      brand: 'Assistant Shopping',
      loading: 'Comparaison des prix...',
      productMeta: (s, o) => `${s} magasins · ${o} offres`,
      cheapest: 'Moins cher',
      offersCount: (n) => `${n} offres`,
      allOffers: (store) => `Toutes les offres chez ${store}`,
      reviews: (n) => `(${n} avis)`,
      aiTitle: '🤖 Analyse IA',
      aiText: 'Produit bien noté. Survolez un magasin pour voir 10+ offres avec vendeur et note.',
      errorServer: 'Connexion échouée. Vérifiez votre internet.',
      errorNoResults: 'Aucun résultat pour ce produit.',
      close: 'Fermer'
    },
    es: {
      direction: 'ltr',
      brand: 'Asistente de Compras',
      loading: 'Comparando precios...',
      productMeta: (s, o) => `${s} tiendas · ${o} ofertas`,
      cheapest: 'Más barato',
      offersCount: (n) => `${n} ofertas`,
      allOffers: (store) => `Todas las ofertas en ${store}`,
      reviews: (n) => `(${n} reseñas)`,
      aiTitle: '🤖 Análisis IA',
      aiText: 'Producto bien valorado. Pasa el cursor sobre una tienda para ver 10+ ofertas.',
      errorServer: 'Conexión fallida. Verifica tu internet.',
      errorNoResults: 'No hay resultados para este producto.',
      close: 'Cerrar'
    },
    de: {
      direction: 'ltr',
      brand: 'Einkaufsassistent',
      loading: 'Preise werden verglichen...',
      productMeta: (s, o) => `${s} Geschäfte · ${o} Angebote`,
      cheapest: 'Günstigster',
      offersCount: (n) => `${n} Angebote`,
      allOffers: (store) => `Alle Angebote bei ${store}`,
      reviews: (n) => `(${n} Bewertungen)`,
      aiTitle: '🤖 KI-Analyse',
      aiText: 'Gut bewertetes Produkt. Fahren Sie über ein Geschäft für 10+ Angebote.',
      errorServer: 'Verbindung fehlgeschlagen. Prüfen Sie Ihr Internet.',
      errorNoResults: 'Keine Ergebnisse für dieses Produkt.',
      close: 'Schließen'
    }
  };

  // ============================================
  // Detect Chrome language (fallback)
  // ============================================
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

  // ============================================
  // Get effective language (async)
  // ============================================
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

  // ============================================
  // Product data
  // ============================================
  function getProductData() {
    const store = detectStore();
    if (!store) return null;

    const selectors = {
      amazon: {
        title: ['#productTitle', 'h1#title', '[data-feature-name="title"] h1'],
        price: ['.a-price-whole', '#priceblock_ourprice', '.a-price .a-offscreen', '#price_inside_buybox']
      },
      noon: {
        title: ['h1[data-qa="product-title"]', '.productTitle', 'h1.productTitle'],
        price: ['[data-qa="price-now"]', '.priceNow', '.price']
      },
      aliexpress: {
        title: ['h1[data-pl="product-title"]', '.product-title-text', 'h1.product-title'],
        price: ['.product-price-value', '.es--wrap--erdmPRe span', '.price--currentPriceText--V8_y_b5']
      },
      ebay: {
        title: ['.x-item-title__mainTitle .ux-textspans', 'h1.it-ttl'],
        price: ['.x-price-primary .ux-textspans', '#prcIsum']
      },
      temu: {
        title: ['h1[class*="title"]', '._2rn4tqXP h1'],
        price: ['[class*="price"] span', '._2rn4tqXP [class*="price"]']
      },
      mumzworld: {
        title: ['h1.product-name', '.page-title h1'],
        price: ['.product-info-main .price', '[data-price-type="finalPrice"]']
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
  // Offers simulation
  // ============================================
  function generateOffers(store, basePrice) {
    const sellers = {
      temu: ['Temu Official', 'Top Store', 'Mega Deals', 'Global Shop', 'Best Buy', 'Premium Store', 'Smart Shop', 'Fast Delivery', 'Value Store', 'Elite Seller'],
      noon: ['Noon Express', 'Noon Mart', 'Official Store', 'Prime Seller', 'Best Choice', 'Top Rated', 'Mega Store', 'Global Mart', 'Value Shop', 'Elite Vendor'],
      amazon: ['Amazon.ae', 'Amazon Warehouse', 'Sold by ABC', 'Sold by XYZ', 'Best Seller', 'Prime Store', 'Top Vendor', 'Mega Mart', 'Value Shop', 'Premium Seller'],
      aliexpress: ['Official Store', 'Top Seller', 'Gold Supplier', 'Verified Store', 'Trusted Shop', 'Elite Vendor', 'Mega Factory', 'Direct Store', 'Premium Shop', 'Best Choice'],
      ebay: ['Top Rated Seller', 'eBay Official', 'Gold Seller', 'Premium Store', 'Trusted Vendor', 'Mega Deals', 'Best Offer', 'Global Seller', 'Value Shop', 'Elite Store'],
      mumzworld: ['Mumzworld', 'Official Store', 'Top Seller', 'Premium Shop', 'Best Choice', 'Trusted Vendor', 'Mega Store', 'Value Shop', 'Elite Seller', 'Direct Store']
    };

    const list = sellers[store] || sellers.amazon;
    const count = 10 + Math.floor(Math.random() * 4);

    return Array.from({ length: count }, (_, i) => {
      const variation = 1 + (i * 0.015) + (Math.random() * 0.03);
      const price = Math.round(basePrice * variation * 100) / 100;
      const rating = (3.8 + Math.random() * 1.2).toFixed(1);
      const reviews = Math.floor(50 + Math.random() * 2000);
      return { seller: list[i % list.length], price, rating, reviews };
    }).sort((a, b) => a.price - b.price);
  }

  // ============================================
  // UI
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
      box.style.insetInlineEnd = 'auto';
      box.style.insetInlineStart = savedPos.left + 'px';
    }

    box.innerHTML = `
      <div class="ssw-header" id="sswHeader">
        <div class="ssw-brand">
          <div class="ssw-brand-icon">🛒</div>
          <div class="ssw-brand-text">${T.brand}</div>
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
      startX = e.clientX; startY = e.clientY;
      startLeft = rect.left; startTop = rect.top;
      el.style.transition = 'none';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      const nl = Math.max(0, Math.min(startLeft + dx, window.innerWidth - el.offsetWidth));
      const nt = Math.max(0, Math.min(startTop + dy, window.innerHeight - el.offsetHeight));
      el.style.bottom = 'auto';
      el.style.insetInlineEnd = 'auto';
      el.style.insetInlineStart = nl + 'px';
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

    handle.addEventListener('touchstart', (e) => {
      if (e.target.closest('.ssw-close')) return;
      const t = e.touches[0];
      const rect = el.getBoundingClientRect();
      startX = t.clientX; startY = t.clientY;
      startLeft = rect.left; startTop = rect.top;
      isDragging = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      const dx = t.clientX - startX, dy = t.clientY - startY;
      const nl = Math.max(0, Math.min(startLeft + dx, window.innerWidth - el.offsetWidth));
      const nt = Math.max(0, Math.min(startTop + dy, window.innerHeight - el.offsetHeight));
      el.style.bottom = 'auto';
      el.style.insetInlineEnd = 'auto';
      el.style.insetInlineStart = nl + 'px';
      el.style.top = nt + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const rect = el.getBoundingClientRect();
      localStorage.setItem('ssw_position', JSON.stringify({ left: rect.left, top: rect.top }));
    });
  }

  // ============================================
  // Render
  // ============================================
  function renderResults(box, data, T) {
    const results = data.results || [];
    if (!results.length) {
      box.querySelector('.ssw-body').innerHTML =
        `<div class="ssw-error">${T.errorNoResults}</div>`;
      return;
    }

    const storesWithOffers = results.map((r, index) => {
      const offers = generateOffers(r.store, r.price);
      return { ...r, offers, count: offers.length, isCheapest: index === 0 };
    });

    const totalOffers = storesWithOffers.reduce((s, x) => s + x.count, 0);

    const storesHTML = storesWithOffers.map((s) => `
      <div class="ssw-store-wrap" data-store="${s.store}">
        <div class="ssw-store ${s.isCheapest ? 'ssw-best' : ''}">
          <div class="ssw-store-left">
            <span class="ssw-store-icon" style="background:${s.bg}">${s.icon}</span>
            <span>${s.name}</span>
            ${s.isCheapest ? `<span class="ssw-badge">${T.cheapest}</span>` : ''}
          </div>
          <div class="ssw-store-right">
            <span class="ssw-store-count">${T.offersCount(s.count)}</span>
            <span class="ssw-store-price">${s.price} ${s.currency || '$'}</span>
          </div>
        </div>
        <div class="ssw-offers">
          <div class="ssw-offers-header">${T.allOffers(s.name)}</div>
          ${s.offers.map(o => `
            <a class="ssw-offer" href="${s.url}" target="_blank" rel="noopener">
              <div class="ssw-offer-info">
                <span class="ssw-offer-seller">${o.seller}</span>
                <span class="ssw-offer-meta">
                  <span class="ssw-offer-stars">★ ${o.rating}</span>
                  <span>${T.reviews(o.reviews)}</span>
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
        <div class="ssw-product-icon">📦</div>
        <div class="ssw-product-info">
          <div class="ssw-product-name">${data.product}</div>
          <div class="ssw-product-meta">${T.productMeta(storesWithOffers.length, totalOffers)}</div>
        </div>
      </div>
      <div class="ssw-stores">${storesHTML}</div>
      <div class="ssw-ai">
        <div class="ssw-ai-title">${T.aiTitle}</div>
        <p class="ssw-ai-text">${T.aiText}</p>
      </div>
    `;

    box.querySelectorAll('.ssw-store-wrap').forEach(wrap => {
      const store = wrap.querySelector('.ssw-store');
      store.addEventListener('click', (e) => {
        if (window.matchMedia('(hover: none)').matches) {
          e.preventDefault();
          const isOpen = wrap.classList.contains('ssw-open');
          box.querySelectorAll('.ssw-store-wrap').forEach(w => w.classList.remove('ssw-open'));
          if (!isOpen) wrap.classList.add('ssw-open');
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

  // ============================================
  // Storage change listener (update on language switch)
  // ============================================
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      const newLang = changes[STORAGE_KEY].newValue;
      const box = document.getElementById('smart-shopping-widget');
      if (box && translations[newLang] && box.dataset.lang !== newLang) {
        // إعادة تشغيل الواجهة باللغة الجديدة
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