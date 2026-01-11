// Функція для форматування ринкової капіталізації
function formatCap(n){
  if(n>1e12) return (n/1e12).toFixed(2)+'T';
  if(n>1e9) return (n/1e9).toFixed(2)+'B';
  if(n>1e6) return (n/1e6).toFixed(2)+'M';
  return n;
}

// Завантаження цін з CoinGecko
async function fetchPrices() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,litecoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
  );
  const data = await response.json();

  const PRICES = {
    BTC: {price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.bitcoin.usd_market_cap)},
    ETH: {price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.ethereum.usd_market_cap)},
    USDT: {price: data.tether.usd, change24h: data.tether.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.tether.usd_market_cap)},
    BNB: {price: data.binancecoin.usd, change24h: data.binancecoin.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.binancecoin.usd_market_cap)},
    LTC: {price: data.litecoin.usd, change24h: data.litecoin.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.litecoin.usd_market_cap)},
    SOL: {price: data.solana.usd, change24h: data.solana.usd_24h_change.toFixed(2)+'%', marketCap: formatCap(data.solana.usd_market_cap)}
  
  };

  updateUI(PRICES);
  window.PRICES = PRICES; // щоб обмін міг використовувати
}

// Оновлення інтерфейсу
function updateUI(PRICES){
  const coinsGrid = document.getElementById('coinsGrid');
  coinsGrid.innerHTML = '';
  for(const k in PRICES){
    const c=PRICES[k];
    const div=document.createElement('div'); div.className='coin';
    div.innerHTML=`<div style="font-weight:700">${k}</div>
                   <div class="muted">$${Number(c.price).toLocaleString()}</div>
                   <div style="margin-top:6px;color:var(--muted);font-size:0.9rem">24h: ${c.change24h}</div>`;
    coinsGrid.appendChild(div);
  }

  const marketTable = document.getElementById('marketTable');
  marketTable.innerHTML='';
  for(const k in PRICES){
    const c=PRICES[k];
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${k}</td><td>${k}</td><td>$${Number(c.price).toLocaleString()}</td><td>${c.change24h}</td><td>${c.marketCap}</td>`;
    marketTable.appendChild(tr);
  }
}

// Логіка обміну
function estimate(){
  if(!window.PRICES) return;
  const from=document.getElementById('fromCoin').value;
  const to=document.getElementById('toCoin').value;
  const a=parseFloat(document.getElementById('amt').value||0);
  if(!a){document.getElementById('estimate').innerText='Орієнтовно: —'; return;}
  const usd = a * PRICES[from].price;
  const out = usd / PRICES[to].price;
  document.getElementById('estimate').innerText =
    'Орієнтовно: '+out.toFixed(8)+' '+to+
    ' (курс $'+PRICES[from].price+' → $'+PRICES[to].price+')';
}

document.getElementById('amt').addEventListener('input', estimate);
document.getElementById('fromCoin').addEventListener('change', estimate);
document.getElementById('toCoin').addEventListener('change', estimate);

document.getElementById('sim').addEventListener('click', ()=>{
  estimate();
  alert(document.getElementById('estimate').innerText);
});
document.getElementById('exec').addEventListener('click', ()=>{
  estimate();
  alert('Демо: транзакція виконана (симуляція)');
});

// Виклик при завантаженні
fetchPrices();
// Оновлення кожні 10 хвилин
setInterval(fetchPrices, 10*60*1000);
const buttons = document.querySelectorAll('.security-grid button');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');

buttons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    modalText.innerText = btn.dataset.info;
    modal.style.display = 'flex';
  });
});
closeModal.onclick = ()=> modal.style.display='none';
window.onclick = e => { if(e.target==modal) modal.style.display='none'; }
let WALLET = {
BTC: 0.125,
USDT: 1200,
ETH: 0.5,
SOL: 2
};function updateWalletUI(){
if(!window.PRICES) return;
const w = document.getElementById('walletTable');
w.innerHTML = '';
for(const k in WALLET){
const amount = WALLET[k];
const price = PRICES[k]?.price || 0;
const value = amount * price;
const tr = document.createElement('tr');
tr.innerHTML = `<td>${k}</td><td>${amount}</td><td>$${value.toFixed(2)}</td><td>${PRICES[k]?.change24h||'-'}</td>`;
w.appendChild(tr);
}
}


// Patch exchange execution
document.getElementById('exec').addEventListener('click', ()=>{
estimate();
const from = document.getElementById('fromCoin').value;
const to = document.getElementById('toCoin').value;
const amt = parseFloat(document.getElementById('amt').value||0);
if(!amt || !window.PRICES) return;


const usd = amt * PRICES[from].price;
const out = usd / PRICES[to].price;


if(WALLET[from] >= amt){
WALLET[from] -= amt;
WALLET[to] = (WALLET[to]||0) + out;
alert('Демо: транзакція виконана!');
} else alert('Недостатньо балансу!');


updateWalletUI();
});const oldUpdateUI = updateUI;
updateUI = function(P){ oldUpdateUI(P); updateWalletUI(); };
const accName = document.getElementById("accName");
const accEmail = document.getElementById("accEmail");
const accCard = document.getElementById("accCard");
const accVerifyStatus = document.getElementById("accVerifyStatus");

// Load saved data
function loadAccount() {
  accName.value = localStorage.getItem("accName") || "";
  accEmail.value = localStorage.getItem("accEmail") || "";
  accCard.value = localStorage.getItem("accCard") || "";

  const verified = localStorage.getItem("accVerified") === "true";

  if (verified) {
    accVerifyStatus.innerText = "ВЕРИФІКОВАНО";
    accVerifyStatus.classList.add("verified");
  }
}

loadAccount();

// Save profile
document.getElementById("saveAcc").addEventListener("click", () => {
  localStorage.setItem("accName", accName.value);
  localStorage.setItem("accEmail", accEmail.value);
  localStorage.setItem("accCard", accCard.value);

  alert("Акаунт збережено ✔️");
});

// Verify account
document.getElementById("verAcc").addEventListener("click", () => {
  localStorage.setItem("accVerified", "true");
  accVerifyStatus.innerText = "ВЕРИФІКОВАНО";
  accVerifyStatus.classList.add("verified");

  alert("Верифікація пройдена ✔️");
});
const accPhoto = document.getElementById("accPhoto");
const accAvatar = document.getElementById("accAvatar");

// Завантаження фото
accPhoto.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event){
    const imgData = event.target.result;
    accAvatar.src = imgData;
    accAvatar.style.display = "block";
    localStorage.setItem("accPhoto", imgData); // зберігаємо в localStorage
  }
  reader.readAsDataURL(file);
});

// Завантаження фото при старті сторінки
const savedPhoto = localStorage.getItem("accPhoto");
if(savedPhoto){
  accAvatar.src = savedPhoto;
  accAvatar.style.display = "block";
}
document.getElementById("resetAcc").addEventListener("click", () => {
  // Видаляємо всі ключі акаунту
  localStorage.removeItem("accName");
  localStorage.removeItem("accEmail");
  localStorage.removeItem("accCard");
  localStorage.removeItem("accVerified");
  localStorage.removeItem("accPhoto");

  // Оновлюємо форму
  accName.value = "";
  accEmail.value = "";
  accCard.value = "";
  accVerifyStatus.innerText = "НЕ ВЕРИФІКОВАНО";
  accVerifyStatus.classList.remove("verified");
  accAvatar.src = "";
  accAvatar.style.display = "none";
  accPhoto.value = "";

  alert("Акаунт успішно скинуто до початкових налаштувань ✔️");
});
// Auto refresh кожні 10 секунд
setInterval(fetchPrices, 10000);
let LAST_PRICES = {};

function updateUI(PRICES){
  const coinsGrid = document.getElementById('coinsGrid');
  coinsGrid.innerHTML = '';

  for(const k in PRICES){
    const c = PRICES[k];
    const last = LAST_PRICES[k] || c.price;

    let direction = '';
    if(c.price > last) direction = 'up';
    if(c.price < last) direction = 'down';

    const div = document.createElement('div');
    div.className = `coin ${direction}`;

    div.innerHTML = `
      <div style="font-weight:700">${k}</div>
      <div class="price">$${Number(c.price).toLocaleString()}</div>
      <div class="muted" style="margin-top:6px">24h: ${c.change24h}</div>
    `;

    coinsGrid.appendChild(div);
    LAST_PRICES[k] = c.price;
  }

  // Market table
  const marketTable = document.getElementById('marketTable');
  marketTable.innerHTML = '';

  for(const k in PRICES){
    const c = PRICES[k];
    const last = LAST_PRICES[k] || c.price;

    let cls = '';
    if(c.price > last) cls = 'price-up';
    if(c.price < last) cls = 'price-down';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${k}</td>
      <td>${k}</td>
      <td class="${cls}">$${Number(c.price).toLocaleString()}</td>
      <td>${c.change24h}</td>
      <td>${c.marketCap}</td>
    `;

    marketTable.appendChild(tr);
  }

  updateWalletUI();
}
// ---------- Confirm-before-execute logic ----------
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const conf_from = document.getElementById('conf_from');
const conf_to = document.getElementById('conf_to');
const conf_rate = document.getElementById('conf_rate');
const conf_fee = document.getElementById('conf_fee');
const confConfirm = document.getElementById('confConfirm');
const confCancel = document.getElementById('confCancel');
const closeConfirm = document.getElementById('closeConfirm');

let PENDING_TX = null;

// Utility to open modal with tx details
function openConfirmModal({from, to, amt, rateFrom, rateTo, out, fee, finalOut}) {
  PENDING_TX = {from, to, amt, rateFrom, rateTo, out, fee, finalOut};

  confirmText.innerHTML = `Ви точно хочете обміняти <strong>${amt} ${from}</strong> → <strong>${to}</strong> ?`;
  conf_from.innerText = `${amt} ${from} ($${(amt*rateFrom).toLocaleString()})`;
  conf_to.innerText = `${finalOut.toFixed(8)} ${to} (після вирахування комісії)`;
  conf_rate.innerText = `$${rateFrom.toFixed(6)} → $${rateTo.toFixed(6)} (курс розрахунку)`;
  conf_fee.innerText = `${fee.toFixed(8)} ${to} (≈ $${(fee*rateTo).toFixed(2)})`;

  // show modal
  confirmModal.style.display = 'flex';
  confirmModal.setAttribute('aria-hidden','false');
  // focus the confirm button for keyboard users
  confConfirm.focus();
}

// Close modal
function closeConfirmModal() {
  confirmModal.style.display = 'none';
  confirmModal.setAttribute('aria-hidden','true');
  PENDING_TX = null;
}

// When user clicks "Виконати (демо)" — open confirmation instead of immediate execution
// Remove or disable previous exec listeners to avoid duplicates
const execBtn = document.getElementById('exec');
if(execBtn){
  execBtn.replaceWith(execBtn.cloneNode(true)); // remove old listeners
}

document.getElementById('exec').addEventListener('click', ()=> {
  estimate(); // ensure estimate shown

  const from = document.getElementById('fromCoin').value;
  const to = document.getElementById('toCoin').value;
  const amt = parseFloat(document.getElementById('amt').value || 0);
  if(!amt || !window.PRICES) { alert('Вкажіть коректну суму та зачекайте завантаження цін'); return; }

  const rateFrom = PRICES[from].price;
  const rateTo = PRICES[to].price;
  const usd = amt * rateFrom;
  const out = usd / rateTo;
  const fee = out * 0.01; // 1% комісія (регулюється)
  const finalOut = out - fee;

  // open confirm modal with computed values
  openConfirmModal({from, to, amt, rateFrom, rateTo, out, fee, finalOut});
});

// Confirm / Cancel handlers
confCancel.addEventListener('click', closeConfirmModal);
closeConfirm.addEventListener('click', closeConfirmModal);
confirmModal.addEventListener('click', (e)=>{ if(e.target === confirmModal) closeConfirmModal(); });

// Keyboard: Esc to cancel
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && confirmModal.style.display === 'flex') closeConfirmModal();
});

// When user confirms — perform same logic as before, record history, update wallet
confConfirm.addEventListener('click', ()=> {
  if(!PENDING_TX) return;
  const {from, to, amt, finalOut, fee} = PENDING_TX;

  if(WALLET[from] >= amt){
    WALLET[from] -= amt;
    WALLET[to] = (WALLET[to] || 0) + finalOut;

    const tx = {
      date: new Date().toLocaleString(),
      pair: `${from} → ${to}`,
      amount: amt.toFixed(8) + " " + from,
      received: finalOut.toFixed(8) + " " + to,
      rate: `$${PENDING_TX.rateFrom.toFixed(6)} → $${PENDING_TX.rateTo.toFixed(6)}`,
      fee: fee.toFixed(8) + " " + to
    };

    HISTORY.push(tx);
    localStorage.setItem("exchangeHistory", JSON.stringify(HISTORY));
    renderHistory();
    updateWalletUI();

    alert('Демо: транзакція виконана ✅');
  } else {
    alert('Недостатньо балансу ❌');
  }

  closeConfirmModal();
});
// --- Price refresh UI helpers ---
const refreshSpinner = document.getElementById('refreshSpinner');
const refreshText = document.getElementById('refreshText');
const refreshCountdown = document.getElementById('refreshCountdown');

let REFRESH_INTERVAL_SEC = 10;
let refreshCountdownTimer = REFRESH_INTERVAL_SEC;
let refreshCountdownHandle = null;

// call this when a fetch starts
function showFetching() {
  refreshSpinner.classList.add('active');
  refreshText.innerText = 'Оновлюється...';
  refreshCountdown.innerText = '';
  // subtle pulse on header to attract attention
  const hdr = document.querySelector('header');
  hdr.style.boxShadow = '0 8px 30px rgba(6,182,212,0.06)';
  setTimeout(()=> hdr.style.boxShadow = '', 700);
}

// call this when fetch finishes successfully
function showFetched() {
  refreshSpinner.classList.remove('active');
  const t = new Date();
  refreshText.innerText = 'Оновлено: ' + t.toLocaleTimeString();
  refreshCountdownTimer = REFRESH_INTERVAL_SEC;
  refreshCountdown.innerText = refreshCountdownTimer + 's';
  // start countdown ticking
  if(refreshCountdownHandle) clearInterval(refreshCountdownHandle);
  refreshCountdownHandle = setInterval(()=>{
    refreshCountdownTimer--;
    if(refreshCountdownTimer <= 0) {
      refreshCountdownTimer = 0;
      clearInterval(refreshCountdownHandle);
      refreshCountdown.innerText = '...';
    } else {
      refreshCountdown.innerText = refreshCountdownTimer + 's';
    }
  }, 1000);
}

// enhance fetchPrices to call showFetching/showFetched and highlight changed coins
const ORIGINAL_fetchPrices = fetchPrices;
fetchPrices = async function(...args) {
  try {
    showFetching();
    const beforePrices = window.PRICES ? {...window.PRICES} : null;
    await ORIGINAL_fetchPrices(...args);
    // highlight diffs
    if(beforePrices && window.PRICES){
      for(const sym in window.PRICES){
        const oldP = beforePrices[sym]?.price ?? null;
        const newP = window.PRICES[sym].price;
        if(oldP === null) continue;
        const el = document.querySelector(`.coin:has(canvas[data-coin="${sym}"])`) || document.querySelector(`.coin:contains(${sym})`);
        // safer query: find coin by data-coin on canvas
        const canvas = document.querySelector(`canvas.mini-canvas[data-coin="${sym}"]`);
        const coinElem = canvas ? canvas.closest('.coin') : null;
        if(!coinElem) continue;
        // add flash class depending on direction
        if(newP > oldP) {
          coinElem.classList.remove('down'); coinElem.classList.add('up','flash-up');
        } else if(newP < oldP) {
          coinElem.classList.remove('up'); coinElem.classList.add('down','flash-down');
        }
        // show small arrow indicator
        const move = document.createElement('span');
        move.className = 'move-indicator';
        move.innerHTML = (newP > oldP) ? '▲' : (newP < oldP) ? '▼' : '';
        // append or replace existing
        const titleRow = coinElem.querySelector('div') || coinElem;
        const existing = coinElem.querySelector('.move-indicator');
        if(existing) existing.replaceWith(move); else titleRow.appendChild(move);

        // remove flash class after animation ends
        setTimeout(()=> {
          coinElem.classList.remove('flash-up','flash-down');
        }, 900);
      }
    }
    showFetched();
  } catch (e) {
    console.warn("fetchPrices error", e);
    refreshSpinner.classList.remove('active');
    refreshText.innerText = 'Помилка оновлення';
  }
};

// start initial countdown if fetchPrices already called once
if(typeof window.PRICES !== 'undefined') showFetched();
// ===== COIN SEARCH FILTER =====

const coinSearch = document.getElementById("coinSearch");
const searchCount = document.getElementById("searchCount");

coinSearch.addEventListener("input", function(){
  const value = this.value.toLowerCase();
  const rows = document.querySelectorAll("#marketTable tr");

  let visible = 0;

  rows.forEach(tr => {
    const symbol = tr.children[0].innerText.toLowerCase();
    const name   = tr.children[1].innerText.toLowerCase();

    if(symbol.includes(value) || name.includes(value)){
      tr.style.display = "";
      visible++;
    } else {
      tr.style.display = "none";
    }
  });

  searchCount.innerText = `Знайдено: ${visible}`;
});
