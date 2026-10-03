// netlify/functions/compare.js

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url, title } = JSON.parse(event.body);

    if (!title) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Product title is required' })
      };
    }

    const SERPER_KEY = process.env.SERPER_API_KEY;

    const serperResponse = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: title,
        gl: 'ae',
        hl: 'en',
        num: 40
      })
    });

    if (!serperResponse.ok) {
      throw new Error('Serper API error: ' + serperResponse.status);
    }

    const serperData = await serperResponse.json();
    const shoppingResults = serperData.shopping || [];

    // تحويل وتحسين النتائج
    const rawResults = shoppingResults
      .map(item => {
        const price = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0;
        if (!price) return null;

        const currency = extractCurrency(item.price);
        const seller = cleanSellerName(item.source || 'Store');

        return {
          seller,
          price,
          currency,
          priceFormatted: formatPrice(price, currency),
          url: item.link,
          rating: item.rating || 0,
          reviews: item.ratingCount || 0,
          image: item.imageUrl || '',
          icon: getStoreIcon(seller),
          bg: getStoreBg(seller)
        };
      })
      .filter(Boolean);

    // إزالة التكرار: نحتفظ بأرخص عرض لكل بائع
    const uniqueMap = new Map();
    for (const r of rawResults) {
      const key = r.seller.toLowerCase();
      if (!uniqueMap.has(key) || uniqueMap.get(key).price > r.price) {
        uniqueMap.set(key, r);
      }
    }

    // ترتيب حسب السعر (الأرخص أولاً)
    const results = Array.from(uniqueMap.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, 12);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        product: title,
        sourceStore: url ? new URL(url).hostname : 'unknown',
        results
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

// ===== Helper: تنسيق السعر مع الرمز في المكان الصحيح =====
function formatPrice(amount, currency) {
  const value = amount.toFixed(2);
  switch (currency) {
    case 'USD': return `$${value}`;
    case 'EUR': return `€${value}`;
    case 'GBP': return `£${value}`;
    case 'AED': return `AED ${value}`;
    case 'SAR': return `SAR ${value}`;
    case 'EGP': return `EGP ${value}`;
    case 'DZD': return `DZD ${value}`;
    case 'MAD': return `MAD ${value}`;
    default:    return `${value} ${currency}`;
  }
}

// ===== Helper: تنظيف اسم البائع =====
function cleanSellerName(name) {
  return name
    .replace(/\s*-\s*Seller$/i, '')
    .replace(/\s*Seller$/i, '')
    .replace(/\s*Store$/i, '')
    .trim() || 'Store';
}

// ===== Helper: استخراج العملة =====
function extractCurrency(priceStr) {
  if (!priceStr) return 'USD';
  const s = priceStr.toUpperCase();
  if (s.includes('AED')) return 'AED';
  if (s.includes('SAR')) return 'SAR';
  if (s.includes('EGP')) return 'EGP';
  if (s.includes('DZD')) return 'DZD';
  if (s.includes('MAD')) return 'MAD';
  if (s.includes('EUR') || s.includes('€')) return 'EUR';
  if (s.includes('GBP') || s.includes('£')) return 'GBP';
  return 'USD';
}

// ===== Helper: أيقونة المتجر =====
function getStoreIcon(source) {
  if (!source) return '🏪';
  const s = source.toLowerCase();
  if (s.includes('amazon')) return '📦';
  if (s.includes('noon')) return '🛍️';
  if (s.includes('aliexpress')) return '🚀';
  if (s.includes('ebay')) return '🏷️';
  if (s.includes('temu')) return '🎁';
  if (s.includes('mumzworld')) return '🍼';
  if (s.includes('walmart')) return '🏬';
  return '🏪';
}

// ===== Helper: لون المتجر =====
function getStoreBg(source) {
  if (!source) return '#f1f5f9';
  const s = source.toLowerCase();
  if (s.includes('amazon')) return '#fef3c7';
  if (s.includes('noon')) return '#e0e7ff';
  if (s.includes('aliexpress')) return '#fed7aa';
  if (s.includes('ebay')) return '#dbeafe';
  if (s.includes('temu')) return '#fde68a';
  if (s.includes('mumzworld')) return '#fce7f3';
  return '#f1f5f9';
}