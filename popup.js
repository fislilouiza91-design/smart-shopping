// popup.js
document.getElementById('privacyLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://stellar-pithivier-10424a.netlify.app/privacy.html' });
});
