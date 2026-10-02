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

    if (!url) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    const sourceStore = detectStore(url);
    const productName = title || extractProductName(url);
    const results = await searchProduct(productName, sourceStore);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        product: productName,
        sourceStore,
        results
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function detectStore(url) {
  const u = url.toLowerCase();
  if (u.includes('noon.')) return 'noon';
  if (u.includes('amazon.')) return 'amazon';
  if (u.includes('aliexpress.')) return 'aliexpress';
  if (u.includes('ebay.')) return 'ebay';
  if (u.includes('temu.')) return 'temu';
  if (u.includes('mumzworld.')) return 'mumzworld';
  return null;
}

function extractProductName(url) {
  try {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(Boolean);
    let best = '';
    for (const seg of segments) {
      const cleaned = seg.replace(/\.html?$/, '').replace(/-/g, ' ');
      if (cleaned.length > best.length && !cleaned.match(/^[A-Z0-9]{8,}$/)) {
        best = cleaned;
      }
    }
    return best || 'product';
  } catch {
    return 'product';
  }
}

async function searchProduct(productName, excludeStore) {
  const ALL_STORES = [
    { key: 'temu',       name: 'Temu',       icon: '🎁', bg: '#fde68a', domain: 'temu.com' },
    { key: 'noon',       name: 'Noon',       icon: '🛍️', bg: '#e0e7ff', domain: 'noon.com' },
    { key: 'amazon',     name: 'Amazon',     icon: '📦', bg: '#fef3c7', domain: 'amazon.ae' },
    { key: 'aliexpress', name: 'AliExpress', icon: '🚀', bg: '#fed7aa', domain: 'aliexpress.com' },
    { key: 'ebay',       name: 'eBay',       icon: '🏷️', bg: '#dbeafe', domain: 'ebay.com' },
    { key: 'mumzworld',  name: 'Mumzworld',  icon: '🍼', bg: '#fce7f3', domain: 'mumzworld.com' }
  ];

  const stores = ALL_STORES.filter(s => s.key !== excludeStore);
  const basePrice = 80 + Math.floor(Math.random() * 40);

  const results = stores.map(s => {
    const variation = 0.85 + Math.random() * 0.35;
    return {
      store: s.key,
      name: s.name,
      icon: s.icon,
      bg: s.bg,
      price: Math.round(basePrice * variation),
      currency: 'USD',
      url: `https://${s.domain}/search?q=${encodeURIComponent(productName)}`
    };
  });

  return results.sort((a, b) => a.price - b.price);
}
