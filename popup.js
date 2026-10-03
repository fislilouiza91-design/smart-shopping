// ============================================
// Translations
// ============================================
const translations = {
  en: {
    direction: 'ltr',
    title: 'Shopping Assistant',
    subtitle: 'Compare, Analyze, Save',
    status: 'Extension is active',
    tipTitle: 'How to use?',
    tipText: 'Open any product page on supported stores. The comparison will appear automatically with AI analysis and best prices.',
    storesLabel: 'Supported Stores',
    featuresLabel: 'Features',
    feature1: 'Instant price comparison',
    feature2: 'AI product analysis',
    feature3: 'Coupon detection',
    privacyLink: 'Privacy Policy',
    version: 'Version 1.0.0'
  },
  ar: {
    direction: 'rtl',
    title: 'مساعد التسوق',
    subtitle: 'قارن، حلل، ووفّر',
    status: 'الإضافة تعمل بنجاح',
    tipTitle: 'كيف تستخدم الإضافة؟',
    tipText: 'افتح أي صفحة منتج في المتاجر المدعومة، وستظهر لك المقارنة تلقائياً مع تحليل ذكي وأفضل الأسعار.',
    storesLabel: 'المتاجر المدعومة',
    featuresLabel: 'المزايا',
    feature1: 'مقارنة فورية للأسعار',
    feature2: 'تحليل ذكي للمنتج',
    feature3: 'كشف الكوبونات',
    privacyLink: 'سياسة الخصوصية',
    version: 'الإصدار 1.0.0'
  },
  fr: {
    direction: 'ltr',
    title: 'Assistant Shopping',
    subtitle: 'Comparez, Analysez, Économisez',
    status: 'L\'extension est active',
    tipTitle: 'Comment utiliser ?',
    tipText: 'Ouvrez n\'importe quelle page produit sur les magasins supportés. La comparaison apparaîtra automatiquement avec analyse IA et meilleurs prix.',
    storesLabel: 'Magasins supportés',
    featuresLabel: 'Fonctionnalités',
    feature1: 'Comparaison instantanée des prix',
    feature2: 'Analyse IA du produit',
    feature3: 'Détection de coupons',
    privacyLink: 'Politique de confidentialité',
    version: 'Version 1.0.0'
  },
  es: {
    direction: 'ltr',
    title: 'Asistente de Compras',
    subtitle: 'Compara, Analiza, Ahorra',
    status: 'Extensión activa',
    tipTitle: '¿Cómo usar?',
    tipText: 'Abre cualquier página de producto en las tiendas compatibles. La comparación aparecerá automáticamente con análisis IA y mejores precios.',
    storesLabel: 'Tiendas compatibles',
    featuresLabel: 'Características',
    feature1: 'Comparación instantánea de precios',
    feature2: 'Análisis IA del producto',
    feature3: 'Detección de cupones',
    privacyLink: 'Política de privacidad',
    version: 'Versión 1.0.0'
  },
  de: {
    direction: 'ltr',
    title: 'Einkaufsassistent',
    subtitle: 'Vergleichen, Analysieren, Sparen',
    status: 'Erweiterung ist aktiv',
    tipTitle: 'Wie verwenden?',
    tipText: 'Öffnen Sie eine Produktseite in unterstützten Geschäften. Der Vergleich erscheint automatisch mit KI-Analyse und besten Preisen.',
    storesLabel: 'Unterstützte Geschäfte',
    featuresLabel: 'Funktionen',
    feature1: 'Sofortiger Preisvergleich',
    feature2: 'KI-Produktanalyse',
    feature3: 'Coupon-Erkennung',
    privacyLink: 'Datenschutzrichtlinie',
    version: 'Version 1.0.0'
  }
};

const STORAGE_KEY = 'ssw_language';

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
// Get effective language (saved > chrome > en)
// ============================================
function getEffectiveLanguage(callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY] && translations[result[STORAGE_KEY]]) {
      callback(result[STORAGE_KEY]);
    } else {
      callback(detectChromeLanguage());
    }
  });
}

// ============================================
// Apply translations
// ============================================
function applyTranslations(lang) {
  const T = translations[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = T.direction;
  document.title = T.title;

  document.getElementById('headerTitle').textContent = T.title;
  document.getElementById('headerSub').textContent = T.subtitle;
  document.getElementById('statusText').textContent = T.status;
  document.getElementById('tipTitle').textContent = T.tipTitle;
  document.getElementById('tipText').textContent = T.tipText;
  document.getElementById('storesLabel').textContent = T.storesLabel;
  document.getElementById('featuresLabel').textContent = T.featuresLabel;
  document.getElementById('feature1').textContent = T.feature1;
  document.getElementById('feature2').textContent = T.feature2;
  document.getElementById('feature3').textContent = T.feature3;
  document.getElementById('privacyLink').textContent = T.privacyLink;
  document.getElementById('version').textContent = T.version;

  document.getElementById('langSelector').value = lang;
}

// ============================================
// Initialize
// ============================================
getEffectiveLanguage((lang) => {
  applyTranslations(lang);
});

// ============================================
// Language Selector change
// ============================================
document.getElementById('langSelector').addEventListener('change', (e) => {
  const newLang = e.target.value;
  chrome.storage.local.set({ [STORAGE_KEY]: newLang }, () => {
    applyTranslations(newLang);
  });
});

// ============================================
// Privacy link
// ============================================
document.getElementById('privacyLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({
    url: 'https://tranquil-dodol-bf4a7b.netlify.app/privacy.html'
  });
});