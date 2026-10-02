// content.js — يعمل داخل صفحات المتاجر
(function () {
  'use strict';

  // ===== 1. اكتشاف المتجر الحالي =====
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

  // ===== 2. قراءة بيانات المنتج (Selectors متعددة كـ Fallback) =====
  function getProductData() {
    const store = detectStore();
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

    const cfg = selectors[store];
    if (!cfg) return null;

    function tryList(list) {
      for (const sel of list) {
        try {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) return el.textContent.trim();
        } catch (e) { /* تجاهل */ }
      }
      return null;
    }

    const title = tryList(cfg.title);
    const price = tryList(cfg.price);
    if (!title) return null;

    return { store, title, price, url: location.href };
  }

  // ===== 3. بناء واجهة الإضافة المُحقونة =====
  function createUI(product) {
    // احذف أي واجهة موجودة مسبقاً
    const old = document.getElementById('smart-shopping-widget');
    if (old) old.remove();

    const box = document.createElement('div');
    box.id = 'smart-shopping-widget';
    box.innerHTML = `
      <div class="ssw-header">
        <div class="ssw-logo">🛒 <span>مساعد التسوق</span></div>
        <button class="ssw-close" aria-label="إغلاق">✕</button>
      </div>
      <div class="ssw-body">
        <div class="ssw-loading">
          <div class="ssw-spinner"></div>
          <p>جاري مقارنة الأسعار...</p>
        </div>
      </div>
    `;
    document.body.appendChild(box);

    box.querySelector('.ssw-close').addEventListener('click', () => box.remove());

    return box;
  }

  // ===== 4. عرض النتائج =====
  function renderResults(box, data) {
    const results = data.results || [];
    if (!results.length) {
      box.querySelector('.ssw-body').innerHTML =
        '<div class="ssw-error">لم نجد نتائج لهذا المنتج.</div>';
      return;
    }

    const rows = results.map((r, i) => `
      <a class="ssw-row ${i === 0 ? 'ssw-best' : ''}" href="${r.url}" target="_blank" rel="noopener">
        <div class="ssw-row-info">
          <span class="ssw-icon" style="background:${r.bg}">${r.icon}</span>
          <span class="ssw-name">${r.name}</span>
          ${i === 0 ? '<span class="ssw-badge">الأرخص</span>' : ''}
        </div>
        <span class="ssw-price">${r.price} ${r.currency || '$'}</span>
      </a>
    `).join('');

    box.querySelector('.ssw-body').innerHTML = `
      <div class="ssw-product-title">${data.product}</div>
      <div class="ssw-rows">${rows}</div>
      <div class="ssw-ai">
        <strong>🤖 تحليل ذكي</strong>
        <p>منتج بتقييم جيد. راجع التفاصيل على صفحة المتجر قبل الشراء.</p>
      </div>
    `;
  }

  // ===== 5. التشغيل الرئيسي =====
  async function run() {
    const product = getProductData();
    if (!product) return;

    const box = createUI(product);

    // أرسل البيانات إلى background.js الذي يستدعي Netlify Function
    chrome.runtime.sendMessage(
      { action: 'compare', payload: product },
      (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          box.querySelector('.ssw-body').innerHTML =
            '<div class="ssw-error">تعذر الاتصال بالخادم.</div>';
          return;
        }
        renderResults(box, response.data);
      }
    );
  }

  // انتظر تحميل الصفحة
  if (document.readyState === 'complete') {
    setTimeout(run, 800);
  } else {
    window.addEventListener('load', () => setTimeout(run, 800));
  }
})();
