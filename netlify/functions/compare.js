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

    // استخدام fetch المدمج في Node 18+
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

    const results = shoppingResults.map(item => ({
      name: item.source || 'Store',
      icon: getStoreIcon(item.source),
      bg: getStoreBg(item.source),
      price: item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0,
      currency: extractCurrency(item.price),
      url: item.link,
      rating: item.rating || 0,
      reviews: item.ratingCount || 0,
      image: item.imageUrl || ''
    }))
    .filter(r => r.price > 0)
    .sort((a, b) => a.price - b.price);

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
  if (s.includes('target')) return '🎯';
  if (s.includes('best buy')) return '💻';
  return '🏪';
}

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

function extractCurrency(priceStr) {
  if (!priceStr) return '$';
  if (priceStr.includes('AED') || priceStr.includes('د.إ')) return 'AED';
  if (priceStr.includes('SAR') || priceStr.includes('ر.س')) return 'SAR';
  if (priceStr.includes('EGP') || priceStr.includes('ج.م')) return 'EGP';
  if (priceStr.includes('DZD') || priceStr.includes('د.ج')) return 'DZD';
  if (priceStr.includes('MAD') || priceStr.includes('د.م')) return 'MAD';
  if (priceStr.includes('USD') || priceStr.includes('$')) return '$';
  if (priceStr.includes('EUR') || priceStr.includes('€')) return '€';
  if (priceStr.includes('GBP') || priceStr.includes('£')) return '£';
  return '$';
}