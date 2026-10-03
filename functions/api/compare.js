// functions/api/compare.js
// Cloudflare Pages Function

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders()
    });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: getCorsHeaders() }
    );
  }

  try {
    const { url, title } = await request.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: getCorsHeaders() }
      );
    }

    const SERPER_KEY = env.SERPER_API_KEY;

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
        num: 10
      })
    });

    if (!serperResponse.ok) {
      throw new Error('Serper API error: ' + serperResponse.status);
    }

    const serperData = await serperResponse.json();
    const shoppingResults = serperData.shopping || [];

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
          image: item.imageUrl || ''
        };
      })
      .filter(Boolean);

    const uniqueMap = new Map();
    for (const r of rawResults) {
      const key = r.seller.toLowerCase();
      if (!uniqueMap.has(key) || uniqueMap.get(key).price > r.price) {
        uniqueMap.set(key, r);
      }
    }

    const results = Array.from(uniqueMap.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, 12);

    return new Response(
      JSON.stringify({
        success: true,
        product: title,
        sourceStore: url ? new URL(url).hostname : 'unknown',
        results
      }),
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

// ===== Helper Functions =====

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

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

function cleanSellerName(name) {
  return name
    .replace(/\s*-\s*Seller$/i, '')
    .replace(/\s*Seller$/i, '')
    .replace(/\s*Store$/i, '')
    .trim() || 'Store';
}

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
