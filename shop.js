
// Demo shop logic. Orders saved to localStorage under 'shop_orders_v1' (array).
// Products are defined here.
const PRODUCTS = [
  {id:'p1', title:'Flexibler Handyhalter', price:12.5, desc:'Praktischer Stand für Smartphone, TPU-Flex.'},
  {id:'p2', title:'Vasen-Set (2)', price:29.0, desc:'Deko-Vasen, PLA, 2er-Set.'},
  {id:'p3', title:'Mini-Figur (Personalisierbar)', price:18.75, desc:'Sammelfigur, ideal als Geschenk.'},
  {id:'p4', title:'Custom Ersatzteil (klein)', price:9.5, desc:'Kleines Ersatzteil, präzise gedruckt.'},
  {id:'p5', title:'Schlüsselanhänger (Set 3)', price:7.9, desc:'Buntes Set, 3 Stück.'}
];

function formatMoney(n){ return n.toLocaleString('de-DE',{minimumFractionDigits:2, maximumFractionDigits:2}) + ' €'; }

// render products
const catalog = document.getElementById('catalog');
PRODUCTS.forEach(p=>{
  const el = document.createElement('article'); el.className='card product';
  el.innerHTML = `<div class="product-art"><svg width="180" height="120" viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="164" height="104" rx="8" fill="#eef2ff"/></svg></div>
    <h4 class="product-title">${p.title}</h4>
    <div class="product-desc">${p.desc}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div class="price">${formatMoney(p.price)}</div><button class="addBtn" data-id="${p.id}">In den Warenkorb</button></div>`;
  catalog.appendChild(el);
});

// cart handling
let cart = JSON.parse(localStorage.getItem('shop_cart_v1') || '{}');
function saveCart(){ localStorage.setItem('shop_cart_v1', JSON.stringify(cart)); renderCart(); }
function addToCart(id, qty=1){ cart[id] = (cart[id]||0) + qty; saveCart(); }
function changeQty(id, delta){ cart[id] = Math.max(0,(cart[id]||0)+delta); if(cart[id]===0) delete cart[id]; saveCart(); }
function clearCart(){ cart = {}; saveCart(); }

function renderCart(){
  const itemsEl = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('totalPrice');
  itemsEl.innerHTML = '';
  const ids = Object.keys(cart);
  if(ids.length===0){ itemsEl.innerHTML = '<div class="small">Dein Warenkorb ist leer.</div>'; countEl.textContent = '0'; totalEl.textContent = formatMoney(0); return; }
  let total = 0; let count = 0;
  ids.forEach(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    const q = cart[id];
    total += p.price * q; count += q;
    const div = document.createElement('div'); div.className='cart-item';
    div.innerHTML = `<div style="width:60px;height:60px;border-radius:8px;background:#f8fafc;display:flex;align-items:center;justify-content:center">${p.title.split(' ')[0]}</div>
      <div style="flex:1"><div style="font-weight:700">${p.title}</div><div class="small">${formatMoney(p.price)} × ${q}</div></div>
      <div style="text-align:right"><div class="price">${formatMoney(p.price*q)}</div><div class="qty"><button data-action="minus" data-id="${id}">−</button><span style="padding:0 8px">${q}</span><button data-action="plus" data-id="${id}">+</button></div></div>`;
    itemsEl.appendChild(div);
  });
  countEl.textContent = String(count);
  totalEl.textContent = formatMoney(total);
}

// UI bindings
document.body.addEventListener('click', e=>{
  if(e.target.matches('.addBtn')) addToCart(e.target.dataset.id);
  if(e.target.matches('[data-action="plus"]')) changeQty(e.target.dataset.id, 1);
  if(e.target.matches('[data-action="minus"]')) changeQty(e.target.dataset.id, -1);
  if(e.target.id === 'cartBtn') openCart();
  if(e.target.id === 'closeCart') closeCart();
  if(e.target.id === 'clearCart') { if(confirm('Warenkorb leeren?')) clearCart(); }
  if(e.target.id === 'checkout') openCheckout();
  if(e.target.id === 'shopNow') window.scrollTo({top:document.getElementById('catalog').offsetTop - 20, behavior:'smooth'});
});

function openCart(){ document.getElementById('cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ document.getElementById('cartDrawer').setAttribute('aria-hidden','true'); }

// checkout modal
function openCheckout(){ document.getElementById('checkoutModal').setAttribute('aria-hidden','false'); }
function closeCheckout(){ document.getElementById('checkoutModal').setAttribute('aria-hidden','true'); }

document.getElementById('cancelCheckout').addEventListener('click', ()=>{ closeCheckout(); });

// place order (simulated)
document.getElementById('checkoutForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  if(!name || !email || !address){ document.getElementById('checkoutMsg').textContent = 'Bitte alle Felder ausfüllen.'; return; }
  // create order object
  const rawCart = JSON.parse(localStorage.getItem('shop_cart_v1') || '{}');
  if(Object.keys(rawCart).length===0){ document.getElementById('checkoutMsg').textContent = 'Warenkorb ist leer.'; return; }
  let total = 0;
  Object.keys(rawCart).forEach(id=>{ const p = PRODUCTS.find(x=>x.id===id); total += p.price * rawCart[id]; });
  const order = { id: 'ORD' + Math.floor(Math.random()*90000+10000), name, email, address, items: rawCart, total: formatMoney(total), date: new Date().toISOString(), status: 'neu' };
  // save into orders array in localStorage
  const orders = JSON.parse(localStorage.getItem('shop_orders_v1') || '[]');
  orders.push(order);
  localStorage.setItem('shop_orders_v1', JSON.stringify(orders));
  // clear cart
  localStorage.removeItem('shop_cart_v1');
  cart = {};
  renderCart();
  closeCheckout();
  document.getElementById('checkoutMsg').textContent = 'Danke! Bestellung simuliert. Bestell‑ID: ' + order.id;
});

// init
renderCart();

