const API_URL = 'https://tranquil-dodol-bf4a7b.netlify.app/.netlify/functions/compare';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'compare') {
    handleCompare(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => {
        console.error('Compare error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});

async function handleCompare(product) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: product.url,
      title: product.title,
      price: product.price,
      store: product.store
    })
  });

  if (!response.ok) {
    throw new Error('Server error: ' + response.status);
  }

  return await response.json();
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
  }
});
