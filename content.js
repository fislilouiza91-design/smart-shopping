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
      reviews: (n) => `${n} reviews`,
      aiTitle: '🤖 AI Analysis',
      aiText: 'Prices from Google Shopping. Click any offer to visit the store.',
      errorServer: 'Connection failed.',
      errorNoResults: 'No results found.',
      close: 'Close'
    },
    ar: {
      direction: 'rtl',
      brand: 'مساعد التسوق',
      loading: 'جاري مقارنة الأسعار...',
      cheapest: 'الأرخص',
      reviews: (n) => `${n} مراجعة`,
      aiTitle: '🤖 تحليل ذكي',
      aiText: 'الأسعار من Google Shopping. اضغط على أي عرض لزيارة المتجر.',
      errorServer: 'تعذر الاتصال.',
      errorNoResults: 'لا توجد نتائج.',
      close: 'إغلاق'
    },
    fr: {
      direction: 'ltr',
      brand: 'Assistant Shopping',
      loading: 'Comparaison des prix...',
      cheapest: 'Moins cher',
      reviews: (n) => `${n} avis`,
      aiTitle: '🤖 Analyse IA',
      aiText: 'Prix de Google Shopping. Cliquez sur une offre pour visiter le magasin.',
      errorServer: 'Connexion échouée.',
      errorNoResults: 'Aucun résultat.',
      close: 'Fermer'
    },
    es: {
      direction: 'ltr',
      brand: 'Asistente de Compras',
      loading: 'Comparando precios...',
      cheapest: 'Más barato',
      reviews: (n) => `${n} reseñas`,
      aiTitle: '🤖 Análisis IA',
      aiText: 'Precios de Google Shopping. Haz clic para visitar la tienda.',
      errorServer: 'Conexión fallida.',
      errorNoResults: 'Sin resultados.',
      close: 'Cerrar'
    },
    de: {
      direction: 'ltr',
      brand: 'Einkaufsassistent',
      loading: 'Preise werden verglichen...',
      cheapest: 'Günstigster',
      reviews: (n) => `${n} Bewertungen`,
      aiTitle: '🤖 KI-Analyse',
      aiText: 'Preise von Google Shopping. Klicken Sie für mehr.',
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

  // ============================================
  // URL pattern check
  // ============================================
  function isProductUrl(store) {
    const url = location.href.toLowerCase();
    const path = location.pathname.toLowerCase();

    const excludePatterns = [
      '/s?', '/search', '/sch/', '/w/wholesale',
      '/category/', '/categories/', '/catalog/', '/browse/',
      '/collection/', '/store/', '/brand/', '/seller/',
      '/user/', '/deals', '/offers', '/listing',
      '/cart', '/checkout', '/account', '/login', '/signup',
      '/help', '/about', '/contact', '/blog', '/news',
      '?q=', '&q=', '?query=', '&query='
    ];

    for (const p of excludePatterns) {
      if (url.includes(p)) return false;
    }

    const productPatterns = {
      amazon: [/\/dp\//, /\/gp\/product\//, /\/product\//, /\/ASIN\//],
      noon: [/\/p\/$/, /\/p\/\?/, /\/[a-z0-9-]+\/N[A-Z0-9]{6,}/i],
      aliexpress: [/\/item\//, /\/i\/\d+/],
      ebay: [/\/itm\//, /\/p\/\d+/],
      temu: [/\/g\//, /\/goods/, /-g-\d+/, /\/product/],
      mumzworld: [/\.html$/]
    };

    const patterns = productPatterns[store] || [];
    for (const regex of patterns) {
      if (regex.test(path) || regex.test(url)) return true;
    }
    return false;
  }

  // ============================================
  // Product data detection
  // ============================================
  function getProductData() {
    const store = detectStore();
    if (!store) return null;
    if (!isProductUrl(store)) return null;

    const selectors = {
      amazon: {
        title: ['#productTitle', 'h1#title', 'h1.product-title-word-break'],
        price: ['.a-price-whole', '#priceblock_ourprice', '.a-price .a-offscreen']
      },
      noon: {
        title: ['h1[data-qa="product-title"]', '.productTitle', 'h1.productTitle'],
        price: ['[data-qa="price-now"]', '.priceNow']
      },
      aliexpress: {
        title: ['h1[data-pl="product-title"]', '.product-title-text', 'h1.product-title'],
        price: ['.product-price-value', '.es--wrap--erdmPRe span']
      },
      ebay: {
        title: ['.x-item-title__mainTitle .ux-textspans', 'h1.it-ttl'],
        price: ['.x-price-primary .ux-textspans', '#prcIsum']
      },
      temu: {
        title: ['h1[class*="title"]', '[class*="ProductTitle"]', 'h1'],
        price: ['[class*="price"] span']
      },
      mumzworld: {
        title: ['h1.product-name', 'h1[itemprop="name"]'],
        price: ['.product-info-main .price', '[itemprop="price"]']
      }
    };

    function tryList(list) {
      for (const sel of list) {
        try {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim() && el.textContent.trim().length > 1) {
            return el.textContent.trim();
          }
        } catch (e) { }
      }
      return null;
    }

    let title = tryList(selectors[store].title);
    if (!title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && ogTitle.content && ogTitle.content.length > 3) {
        title = ogTitle.content.trim();
      }
    }
    if (!title) {
      title = document.title.split('|')[0].split(' - ')[0].trim();
    }

    let price = tryList(selectors[store].price) || '—';

    if (!title || title.length < 3) return null;

    return { store, title, price, url: location.href };
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
          <span class="ssw-brand-icon">🛒</span>
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

  // ============================================
  // Drag & Drop
  // ============================================
  function makeDraggable(el, handle) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    function startDrag(clientX, clientY) {
      isDragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      el.style.bottom = 'auto';
      el.style.right = 'auto';
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.transition = 'none';
      el.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
    }

    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      let newLeft = clientX - offsetX;
      let newTop = clientY - offsetY;
      const maxLeft = window.innerWidth - el.offsetWidth;
      const maxTop = window.innerHeight - el.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      el.style.transition = '';
      el.style.pointerEvents = '';
      document.body.style.userSelect = '';
      const rect = el.getBoundingClientRect();
      localStorage.setItem('ssw_position', JSON.stringify({ left: rect.left, top: rect.top }));
    }

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ssw-close')) return;
      startDrag(e.clientX, e.clientY);
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', endDrag);

    handle.addEventListener('touchstart', (e) => {
      if (e.target.closest('.ssw-close')) return;
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', endDrag);
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

    const rowsHTML = results.map((r, i) => {
      const isCheapest = i === 0;
      const starsHTML = r.rating ? `<span class="ssw-stars">★ ${r.rating}</span>` : '';
      const reviewsHTML = r.reviews ? `<span class="ssw-reviews">(${r.reviews})</span>` : '';

      return `
        <a class="ssw-store-row ${isCheapest ? 'ssw-best' : ''}" href="${r.url}" target="_blank" rel="noopener">
          <div class="ssw-store-left">
            <span class="ssw-store-name">${r.seller}</span>
            ${isCheapest ? `<span class="ssw-badge">${T.cheapest}</span>` : ''}
            ${starsHTML}
            ${reviewsHTML}
          </div>
          <span class="ssw-store-price">${r.priceFormatted || r.price}</span>
        </a>
      `;
    }).join('');

    box.querySelector('.ssw-body').innerHTML = `
      <div class="ssw-product-title">${data.product}</div>
      <div class="ssw-stores">${rowsHTML}</div>
      <div class="ssw-ai">
        <div class="ssw-ai-title">${T.aiTitle}</div>
        <div>${T.aiText}</div>
      </div>
    `;
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
    setTimeout(run, 1500);
  } else {
    window.addEventListener('load', () => setTimeout(run, 1500));
  }
})();