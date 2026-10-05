'use strict';
// ---------- Product data (replace image URLs with files in /images if you like) ----------
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=80`;
const products = [
  {id:1,name:'Floral Summer Dress',cat:'western',price:1499,img:U('photo-1490481651871-ab68de25d43d')},
  {id:2,name:'Classic Party Gown',cat:'western',price:2999,img:U('photo-1445205170230-053b83016050')},
  {id:3,name:'Kanjivaram Silk Saree',cat:'sarees',price:5499,img:U('photo-1610030469983-98e550d6193c')},
  {id:4,name:'Cotton Printed Saree',cat:'sarees',price:1299,img:U('photo-1610030469983-98e550d6193c')},
  {id:5,name:'High-Waist Blue Jeans',cat:'jeans',price:1899,img:U('photo-1542272604-787c3835535d')},
  {id:6,name:'Slim Fit Dark Jeans',cat:'jeans',price:1699,img:U('photo-1542272604-787c3835535d')},
  {id:7,name:'Glass Bangles Set',cat:'jewellery',price:499,img:U('photo-1515562141207-7a88fb7ce338')},
  {id:8,name:'Gold-tone Earrings',cat:'jewellery',price:699,img:U('photo-1515562141207-7a88fb7ce338')},
  {id:9,name:'Pearl Pendant',cat:'jewellery',price:899,img:U('photo-1515562141207-7a88fb7ce338')},
  {id:10,name:'Analog Wrist Watch',cat:'watches',price:2499,img:U('photo-1523275335684-37898b6baf30')},
  {id:11,name:'Leather Tote Bag',cat:'handbags',price:2799,img:U('photo-1584917865442-de89df76afd3')},
  {id:12,name:'Sling Bag',cat:'handbags',price:1599,img:U('photo-1584917865442-de89df76afd3')}
];
const labels = {all:'All',western:'Western wear',sarees:'Sarees',jeans:'Jeans',jewellery:'Jewellery',watches:'Watches',handbags:'Handbags'};
const $ = s => document.querySelector(s);
let cart = [], filter = 'all';

// ---------- Products ----------
function renderTabs(){
  $('#tabs').innerHTML = Object.keys(labels).map(k =>
    `<button class="${k===filter?'active':''}" data-f="${k}">${labels[k]}</button>`).join('');
}
function renderProducts(){
  const list = products.filter(p => filter==='all' || p.cat===filter);
  $('#productGrid').innerHTML = list.map(p => `
    <article class="card">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div><h3>${p.name}</h3><p class="price">₹${p.price.toLocaleString('en-IN')}</p>
      <button data-add="${p.id}">Add to cart</button></div>
    </article>`).join('');
}
function setFilter(f){ filter = f; renderTabs(); renderProducts(); }
$('#tabs').addEventListener('click', e => { if(e.target.dataset.f) setFilter(e.target.dataset.f); });
document.querySelectorAll('.cat').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.filter)));

// ---------- Cart ----------
function renderCart(){
  $('#cartCount').textContent = cart.length;
  $('#cartList').innerHTML = cart.length
    ? cart.map((p,i) => `<li><span>${p.name}<br>₹${p.price.toLocaleString('en-IN')}</span><button data-rm="${i}">Remove</button></li>`).join('')
    : '<li>Your cart is empty. Add something you like.</li>';
  $('#cartTotal').textContent = '₹' + cart.reduce((s,p) => s + p.price, 0).toLocaleString('en-IN');
}
$('#productGrid').addEventListener('click', e => {
  const id = e.target.dataset.add;
  if(id){ cart.push(products.find(p => p.id == id)); renderCart(); $('#drawer').classList.add('open'); }
});
$('#cartList').addEventListener('click', e => {
  if(e.target.dataset.rm !== undefined){ cart.splice(+e.target.dataset.rm, 1); renderCart(); }
});
$('#cartBtn').addEventListener('click', () => $('#drawer').classList.add('open'));
$('#closeCart').addEventListener('click', () => $('#drawer').classList.remove('open'));

// ---------- Delivery check (30 km, 30 minutes) ----------
const MAX_KM = 30;
function deliveryMessage(km){
  return km <= MAX_KM
    ? {ok:true, text:`Good news! You are ${km} km away, so we can deliver within 30 minutes.`}
    : {ok:false, text:`Sorry, ${km} km is outside our ${MAX_KM} km delivery range.`};
}
$('#deliveryCheck').addEventListener('submit', e => {
  e.preventDefault();
  const km = parseFloat($('#km').value), out = $('#deliveryResult');
  if(isNaN(km) || km < 0){ out.textContent = 'Enter a distance in kilometres, for example 12.5.'; out.className = 'bad'; return; }
  const r = deliveryMessage(km); out.textContent = r.text; out.className = r.ok ? 'ok' : 'bad';
});

// ---------- Form validation ----------
const rules = {
  name:    v => v.trim().length >= 3 || 'Enter your full name (at least 3 characters).',
  email:   v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim()) || 'Enter a valid email, like you@example.com.',
  phone:   v => /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/.test(v.trim()) || 'Enter a valid 10-digit Indian mobile number starting with 6-9.',
  address: v => v.trim().length >= 10 || 'Enter your full address (at least 10 characters).',
  delAddress: v => $('#same').checked || v.trim().length >= 10 || 'Enter your delivery address (at least 10 characters).',
  pin:     v => /^[1-9]\d{5}$/.test(v.trim()) || 'Enter a valid 6-digit pincode.',
  distance:v => (v !== '' && +v >= 0 && +v <= MAX_KM) || `Distance must be between 0 and ${MAX_KM} km for 30-minute delivery.`
};
function check(id){
  const el = $('#'+id), res = rules[id](el.value), err = el.parentElement.querySelector('.err');
  const ok = res === true;
  err.textContent = ok ? '' : res;
  el.classList.toggle('invalid', !ok); el.classList.toggle('valid', ok && el.value !== '');
  return ok;
}
Object.keys(rules).forEach(id => $('#'+id).addEventListener('blur', () => check(id)));
$('#same').addEventListener('change', e => {
  $('#delWrap').hidden = e.target.checked;
  if(e.target.checked){ $('#delAddress').value=''; $('#delAddress').classList.remove('invalid','valid'); $('#delAddress').parentElement.querySelector('.err').textContent=''; }
});
$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const allOk = Object.keys(rules).map(check).every(Boolean), msg = $('#formMsg');
  if(!allOk){ msg.textContent = 'Please fix the highlighted fields.'; msg.className = 'bad'; return; }
  if(!cart.length){ msg.textContent = 'Your cart is empty. Add at least one item before ordering.'; msg.className = 'bad'; return; }
  msg.textContent = `Order placed! We will deliver to you within 30 minutes. A confirmation will be sent to ${$('#email').value.trim()}.`;
  msg.className = 'ok'; cart = []; renderCart(); e.target.reset(); $('#delWrap').hidden = true;
  document.querySelectorAll('.valid').forEach(i => i.classList.remove('valid'));
});

// ---------- Image fallback & init ----------
document.addEventListener('error', e => { if(e.target.tagName==='IMG') e.target.alt = e.target.alt + ' (image unavailable)'; }, true);
$('#year').textContent = new Date().getFullYear();
renderTabs(); renderProducts(); renderCart();
