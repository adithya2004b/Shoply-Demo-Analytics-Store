/* Shoply demo storefront. Events are sent to GA4 if configured in index.html.
   In GA4, custom events will appear in DebugView (debug mode) and Events reports.
   No real customer/payment information is collected by this demo. */

const products = [
  {id:"p101",name:"Studio Wireless Headphones",category:"tech",price:89,emoji:"🎧",color:"#e9e1d4",description:"Comfortable wireless sound for focused work and everyday listening."},
  {id:"p102",name:"Everyday Canvas Tote",category:"carry",price:32,emoji:"👜",color:"#e8dfd0",description:"A roomy, durable tote for errands, work, and weekends."},
  {id:"p103",name:"Minimal Desk Lamp",category:"home",price:58,emoji:"💡",color:"#e1e9dc",description:"Warm lighting with a clean silhouette for your workspace."},
  {id:"p104",name:"Insulated Water Bottle",category:"wellness",price:26,emoji:"🥤",color:"#dce9ec",description:"Keep your favorite drink close throughout the day."},
  {id:"p105",name:"Compact Bluetooth Speaker",category:"tech",price:49,emoji:"🔊",color:"#e9dfe6",description:"Portable sound for small spaces and outdoor moments."},
  {id:"p106",name:"Weekend Backpack",category:"carry",price:74,emoji:"🎒",color:"#e2e4d9",description:"Lightweight storage with pockets for daily essentials."},
  {id:"p107",name:"Ceramic Coffee Set",category:"home",price:38,emoji:"☕",color:"#f0e3d2",description:"A simple ceramic set to make your morning ritual feel special."},
  {id:"p108",name:"Relaxed Yoga Mat",category:"wellness",price:42,emoji:"🧘",color:"#dce7df",description:"A comfortable surface for stretching, movement, and mindful breaks."}
];

const cart = new Map();
let activeCategory = "all";
let searchTerm = "";
let currentView = "home";
let lastPageStart = Date.now();
let toastTimer;

function gaEvent(name, params={}) {
  const payload = { ...params, event_category: params.event_category || "demo_store", event_label: params.event_label || name };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event:name, ...payload});
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
  console.debug("[Analytics event]", name, payload);
}
function pageView(pageName, pageTitle) {
  gaEvent("demo_page_view", {page_name:pageName, page_title:pageTitle, page_location:location.href});
  lastPageStart = Date.now();
}
function trackAction(action, extra={}) {
  gaEvent("demo_button_click", {button_name:action, ...extra});
}
function toast(message) {
  const el=document.getElementById("toast");
  el.textContent=message;el.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400);
}
function formatMoney(value){return "$"+value.toFixed(2)}
function filteredProducts(){
  return products.filter(p=>(activeCategory==="all"||p.category===activeCategory)&&
    (!searchTerm||`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase())));
}
function renderProducts(){
  const list=filteredProducts(), grid=document.getElementById("productGrid");
  grid.innerHTML=list.map(p=>`<article class="product-card" data-product-id="${p.id}">
    <div class="product-image" style="background:${p.color}" data-view-product="${p.id}" role="button" tabindex="0" aria-label="View ${p.name}">
      <span class="product-symbol">${p.emoji}</span>
    </div>
    <div class="product-meta"><div><p class="product-name">${p.name}</p><p class="product-category">${p.category}</p></div><span class="product-price">${formatMoney(p.price)}</span></div>
    <button class="add-btn" data-add="${p.id}">Add to cart +</button>
  </article>`).join("");
  document.getElementById("emptyState").classList.toggle("hidden",list.length>0);
}
function viewProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  gaEvent("view_item",{currency:"USD",value:p.price,items:[{item_id:p.id,item_name:p.name,item_category:p.category,price:p.price}]});
  gaEvent("product_detail_open",{product_id:p.id,product_name:p.name,product_category:p.category,price:p.price});
  const c=document.getElementById("modalContent");
  c.innerHTML=`<div class="modal-product-art" style="background:${p.color}">${p.emoji}</div><p class="eyebrow">${p.category.toUpperCase()}</p><h2>${p.name}</h2><strong>${formatMoney(p.price)}</strong><p>${p.description}</p><div class="modal-actions"><button class="primary-btn" id="modalAdd">Add to cart</button><button class="secondary-btn" id="modalCloseAction">Continue browsing</button></div>`;
  showModal();
  document.getElementById("modalAdd").addEventListener("click",()=>addToCart(p.id,"product_detail"));
  document.getElementById("modalCloseAction").addEventListener("click",closeModal);
}
function addToCart(id,source="product_card"){
  const p=products.find(x=>x.id===id);if(!p)return;
  const current=cart.get(id)||0;cart.set(id,current+1);
  gaEvent("add_to_cart",{currency:"USD",value:p.price,items:[{item_id:p.id,item_name:p.name,item_category:p.category,price:p.price,quantity:1}],action_source:source});
  renderCart();toast(`${p.name} added to cart`);
}
function removeFromCart(id){
  const p=products.find(x=>x.id===id),qty=cart.get(id)||0;if(!p||!qty)return;
  if(qty<=1)cart.delete(id);else cart.set(id,qty-1);
  gaEvent("remove_from_cart",{currency:"USD",value:p.price,items:[{item_id:p.id,item_name:p.name,item_category:p.category,price:p.price,quantity:1}]});
  renderCart();
}
function cartDetails(){
  return [...cart.entries()].map(([id,qty])=>({product:products.find(p=>p.id===id),qty})).filter(x=>x.product);
}
function renderCart(){
  const entries=cartDetails(),count=entries.reduce((sum,x)=>sum+x.qty,0),subtotal=entries.reduce((sum,x)=>sum+x.product.price*x.qty,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartSubtotal").textContent=formatMoney(subtotal);
  document.getElementById("cartItems").innerHTML=entries.length?entries.map(({product:p,qty})=>`<div class="cart-item">
    <div class="cart-item-icon" style="background:${p.color}">${p.emoji}</div><div class="cart-item-details"><strong>${p.name}</strong><small>${formatMoney(p.price)} each</small>
    <div class="qty-controls"><button data-minus="${p.id}" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-plus="${p.id}" aria-label="Increase quantity">+</button></div></div></div>`).join(""):`<p class="muted">Your cart is empty. Browse the collection to add something.</p>`;
}
function openCart(){
  document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.remove("hidden");
  gaEvent("view_cart",{currency:"USD",value:cartDetails().reduce((s,x)=>s+x.product.price*x.qty,0),items:cartDetails().map(({product:p,qty})=>({item_id:p.id,item_name:p.name,item_category:p.category,price:p.price,quantity:qty}))});
}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.add("hidden")}
function showModal(){document.getElementById("modal").classList.remove("hidden");document.getElementById("overlay").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden");if(!document.getElementById("cartDrawer").classList.contains("open"))document.getElementById("overlay").classList.add("hidden")}
function checkout(){
  const entries=cartDetails();if(!entries.length){toast("Your cart is empty");gaEvent("checkout_empty_cart_attempt");return;}
  const total=entries.reduce((s,x)=>s+x.product.price*x.qty,0);
  gaEvent("begin_checkout",{currency:"USD",value:total,items:entries.map(({product:p,qty})=>({item_id:p.id,item_name:p.name,item_category:p.category,price:p.price,quantity:qty}))});
  closeCart();
  document.getElementById("modalContent").innerHTML=`<p class="eyebrow">DEMO CHECKOUT</p><h2>You're almost there.</h2><p>This is a demo checkout step. No payment or real order will be made.</p><p><strong>Order subtotal: ${formatMoney(total)}</strong></p><button class="primary-btn" id="demoPurchase">Complete demo purchase</button>`;
  showModal();
  document.getElementById("demoPurchase").addEventListener("click",()=>{
    gaEvent("purchase",{transaction_id:"DEMO-"+Date.now(),currency:"USD",value:total,tax:0,shipping:0,items:entries.map(({product:p,qty})=>({item_id:p.id,item_name:p.name,item_category:p.category,price:p.price,quantity:qty}))});
    cart.clear();renderCart();closeModal();toast("Demo purchase recorded!");pageView("purchase_confirmation","Demo Purchase Confirmation");
  });
}
function navTo(page){
  const titles={home:"Shoply Home",shop:"Shop Collection",about:"About Shoply"};
  gaEvent("navigation_click",{destination:page});
  currentView=page;document.querySelectorAll(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.nav===page));
  if(page==="shop"){document.getElementById("shopSection").scrollIntoView({behavior:"smooth"});pageView("shop",titles.shop);}
  else if(page==="about"){document.getElementById("promo").scrollIntoView({behavior:"smooth"});pageView("about",titles.about);toast("Shoply is a demo storefront.");}
  else {window.scrollTo({top:0,behavior:"smooth"});pageView("home",titles.home);}
}
function runSearch(term){
  searchTerm=term.trim();activeCategory="all";renderProducts();
  const count=filteredProducts().length;
  gaEvent("search",{search_term:searchTerm,results_count:count});
  gaEvent("product_search",{search_term:searchTerm,results_count:count});
  document.getElementById("searchFeedback").textContent=count?`${count} result(s) found.`:"No results. Try another search.";
  document.getElementById("shopSection").scrollIntoView({behavior:"smooth"});
}
function wire(){
  document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.nav)));
  document.querySelector("[data-action='hero_shop_click']").addEventListener("click",()=>{trackAction("hero_explore_collection",{placement:"hero"});navTo("shop")});
  document.querySelector("[data-action='promo_click']").addEventListener("click",()=>{trackAction("promo_discover_more",{placement:"mid_page"});toast("Thanks for exploring!")});
  document.getElementById("categoryFilters").addEventListener("click",e=>{
    const b=e.target.closest("[data-category]");if(!b)return;
    activeCategory=b.dataset.category;searchTerm="";
    document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("selected",x===b));
    gaEvent("category_filter",{category:activeCategory});
    renderProducts();
  });
  document.getElementById("productGrid").addEventListener("click",e=>{
    const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}
    const view=e.target.closest("[data-view-product]");if(view)viewProduct(view.dataset.viewProduct);
  });
  document.getElementById("productGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-view-product]"))viewProduct(e.target.dataset.viewProduct)});
  document.getElementById("searchToggle").addEventListener("click",()=>{document.getElementById("searchPanel").classList.toggle("hidden");trackAction("open_search",{placement:"header"});document.getElementById("siteSearch").focus()});
  document.getElementById("searchClose").addEventListener("click",()=>document.getElementById("searchPanel").classList.add("hidden"));
  document.getElementById("searchSubmit").addEventListener("click",()=>runSearch(document.getElementById("siteSearch").value));
  document.getElementById("siteSearch").addEventListener("keydown",e=>{if(e.key==="Enter")runSearch(e.target.value)});
  document.getElementById("cartToggle").addEventListener("click",openCart);
  document.getElementById("cartClose").addEventListener("click",closeCart);
  document.getElementById("overlay").addEventListener("click",()=>{closeCart();closeModal()});
  document.getElementById("cartItems").addEventListener("click",e=>{
    const minus=e.target.closest("[data-minus]"),plus=e.target.closest("[data-plus]");
    if(minus)removeFromCart(minus.dataset.minus);if(plus)addToCart(plus.dataset.plus,"cart_quantity");
  });
  document.getElementById("checkoutBtn").addEventListener("click",checkout);
  document.getElementById("modalClose").addEventListener("click",closeModal);
  document.getElementById("accountBtn").addEventListener("click",()=>{trackAction("account_click",{placement:"header"});document.getElementById("modalContent").innerHTML=`<p class="eyebrow">DEMO ACCOUNT</p><h2>Welcome back</h2><p>Account sign-in is not enabled in this demo.</p><button class="primary-btn" id="accountDemoClose">Okay</button>`;showModal();document.getElementById("accountDemoClose").addEventListener("click",closeModal)});
  document.getElementById("newsletterForm").addEventListener("submit",e=>{
    e.preventDefault();const email=document.getElementById("newsletterEmail").value.trim();
    if(!email){gaEvent("form_validation_error",{form_name:"newsletter",field:"email"});return;}
    gaEvent("newsletter_signup",{form_name:"newsletter",method:"demo",email_domain:email.split("@")[1]||"unknown"});
    document.getElementById("newsletterMessage").textContent="Thanks! Your demo signup has been recorded.";
    toast("Demo signup recorded.");e.target.reset();
  });
  document.querySelectorAll("[data-footer]").forEach(b=>b.addEventListener("click",()=>{trackAction("footer_link_click",{link_name:b.dataset.footer});toast(`${b.dataset.footer} section is demo-only.`)}));
  document.addEventListener("scroll",()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;if(max<=0)return;
    const percent=Math.round(window.scrollY/max*100);
    [25,50,75,90].forEach(mark=>{if(percent>=mark&&!window.__scrollMarks?.includes(mark)){window.__scrollMarks=window.__scrollMarks||[];window.__scrollMarks.push(mark);gaEvent("scroll_depth",{percent_scrolled:mark});}});
  },{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){gaEvent("page_engagement_summary",{visible_time_ms:Date.now()-lastPageStart,page_name:currentView})}});
  window.addEventListener("error",e=>gaEvent("demo_js_error",{message:String(e.message||"unknown error"),source:e.filename||"",line:e.lineno||0}));
}
renderProducts();renderCart();wire();pageView("home","Shoply Home");
