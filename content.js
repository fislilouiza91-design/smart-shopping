/* ============================================
   Smart Shopping Widget — Clean Design
   ============================================ */

#smart-shopping-widget {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --accent: #a855f7;
  --success: #22c55e;
  --warning: #f59e0b;
  --dark: #0f172a;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-500: #64748b;
  --gray-700: #334155;

  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 360px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', system-ui, sans-serif;
  z-index: 2147483647;
  animation: sswIn 0.35s ease;
  overflow: visible;
}

#smart-shopping-widget[dir="rtl"] {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  right: auto;
  left: 20px;
}

@keyframes sswIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Header (Draggable) ===== */
#smart-shopping-widget .ssw-header {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
  cursor: grab;
  user-select: none;
}

#smart-shopping-widget .ssw-header:active {
  cursor: grabbing;
}

#smart-shopping-widget .ssw-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 14px;
}

#smart-shopping-widget .ssw-brand-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

#smart-shopping-widget .ssw-close {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

#smart-shopping-widget .ssw-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

/* ===== Body ===== */
#smart-shopping-widget .ssw-body {
  padding: 12px;
  max-height: 500px;
  overflow-y: auto;
  border-radius: 0 0 16px 16px;
}

#smart-shopping-widget .ssw-body::-webkit-scrollbar {
  width: 6px;
}

#smart-shopping-widget .ssw-body::-webkit-scrollbar-thumb {
  background: var(--gray-200);
  border-radius: 3px;
}

/* ===== Loading ===== */
#smart-shopping-widget .ssw-loading {
  text-align: center;
  padding: 30px 20px;
}

#smart-shopping-widget .ssw-spinner {
  width: 36px;
  height: 36px;
  margin: 0 auto 12px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: sswSpin 0.9s linear infinite;
}

@keyframes sswSpin {
  to { transform: rotate(360deg); }
}

#smart-shopping-widget .ssw-loading-text {
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

/* ===== Product Header ===== */
#smart-shopping-widget .ssw-product {
  padding: 10px 12px;
  background: var(--gray-50);
  border-radius: 10px;
  margin-bottom: 10px;
}

#smart-shopping-widget .ssw-product-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

#smart-shopping-widget .ssw-product-meta {
  font-size: 10.5px;
  color: var(--gray-500);
  font-weight: 600;
}

/* ===== Store Rows ===== */
#smart-shopping-widget .ssw-store {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border: 1.5px solid var(--gray-200);
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

#smart-shopping-widget .ssw-store:hover {
  border-color: var(--primary);
  background: #f8f7ff;
}

#smart-shopping-widget .ssw-store.ssw-best {
  border-color: var(--success);
  background: #f0fdf4;
}

#smart-shopping-widget .ssw-store-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

#smart-shopping-widget .ssw-store-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

#smart-shopping-widget .ssw-store-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#smart-shopping-widget .ssw-badge {
  background: var(--success);
  color: #fff;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  flex-shrink: 0;
}

#smart-shopping-widget .ssw-store-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

#smart-shopping-widget .ssw-store-price {
  font-size: 13px;
  font-weight: 900;
  color: var(--dark);
  white-space: nowrap;
}

#smart-shopping-widget .ssw-store-count {
  background: var(--gray-100);
  color: var(--gray-500);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
}

/* ===== Offers Dropdown (absolute overlay) ===== */
#smart-shopping-widget .ssw-offers {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid var(--primary);
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 50;
  max-height: 260px;
  overflow-y: auto;
  display: none;
}

#smart-shopping-widget .ssw-store.ssw-open .ssw-offers,
#smart-shopping-widget .ssw-store:hover .ssw-offers {
  display: block;
}

#smart-shopping-widget .ssw-offers::-webkit-scrollbar {
  width: 5px;
}

#smart-shopping-widget .ssw-offers::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}

#smart-shopping-widget .ssw-offers-title {
  font-size: 10px;
  font-weight: 800;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 6px 8px;
  border-bottom: 1px solid var(--gray-100);
  margin-bottom: 6px;
}

#smart-shopping-widget .ssw-offer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;
}

#smart-shopping-widget .ssw-offer:hover {
  background: var(--gray-50);
}

#smart-shopping-widget .ssw-offer-left {
  min-width: 0;
  flex: 1;
}

#smart-shopping-widget .ssw-offer-seller {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--dark);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#smart-shopping-widget .ssw-offer-meta {
  font-size: 10px;
  color: var(--gray-500);
  font-weight: 600;
  margin-top: 2px;
}

#smart-shopping-widget .ssw-offer-stars {
  color: #f59e0b;
}

#smart-shopping-widget .ssw-offer-price {
  font-size: 12.5px;
  font-weight: 900;
  color: var(--primary-dark);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== AI ===== */
#smart-shopping-widget .ssw-ai {
  background: #fef3c7;
  border-left: 3px solid var(--warning);
  padding: 10px 12px;
  border-radius: 10px;
  margin-top: 10px;
  font-size: 11px;
  color: #78350f;
  line-height: 1.6;
}

#smart-shopping-widget[dir="rtl"] .ssw-ai {
  border-left: none;
  border-right: 3px solid var(--warning);
}

#smart-shopping-widget .ssw-ai-title {
  font-weight: 800;
  margin-bottom: 4px;
  font-size: 11.5px;
}

/* ===== Error ===== */
#smart-shopping-widget .ssw-error {
  padding: 20px;
  text-align: center;
  color: #991b1b;
  background: #fef2f2;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}