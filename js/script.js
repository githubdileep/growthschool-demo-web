/**
 * Pixalara Store - Final Consolidated Logic
 * Project: Pixalara Grocery & Electronics Store
 * Features: LocalStorage Persistence, Dynamic Filtering, Toast Notifications
 */

// 1. PRODUCT DATABASE (Using high-quality dynamic Unsplash links)
const products = [
    { 
        id: 1, 
        name: "Premium Hass Avocado", 
        price: 4.99, 
        category: "Grocery", 
        img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 2, 
        name: "Sony Wireless Headphones", 
        price: 129.00, 
        category: "Electronics", 
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 3, 
        name: "Organic Blueberries 250g", 
        price: 5.50, 
        category: "Grocery", 
        img: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 4, 
        name: "Mechanical RGB Keyboard", 
        price: 89.00, 
        category: "Electronics", 
        img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 5, 
        name: "Artisanal Sourdough Bread", 
        price: 3.25, 
        category: "Grocery", 
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800" 
    },
    { 
        id: 6, 
        name: "Smart Watch Series 9", 
        price: 399.00, 
        category: "Electronics", 
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" 
    },
   
   
];

// 2. STATE MANAGEMENT (LocalStorage persistence)
let cart = JSON.parse(localStorage.getItem('pixalara_cart')) || [];

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateCartCount();
    
    // Check which page we are on
    const productGrid = document.getElementById('product-container');
    const cartTable = document.getElementById('cart-items');

    if (productGrid) {
        // Show featured 4 on home, or all 8 on products page
        const isHomePage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
        renderProducts(isHomePage ? products.slice(0, 4) : products);
    }

    if (cartTable) {
        renderCart();
    }

    // Mobile Menu setup
    const menuBtn = document.getElementById('mobile-menu');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });
    }
}

// 4. RENDERING LOGIC
function renderProducts(items) {
    const container = document.getElementById('product-container');
    if (!container) return;

    container.innerHTML = items.map(p => `
        <article class="product-card">
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <span class="tag">${p.category}</span>
            <h3>${p.name}</h3>
            <span class="price">$${p.price.toFixed(2)}</span>
            <button class="btn" style="width:100%" onclick="addToCart(${p.id})">Add to Cart</button>
        </article>
    `).join('');
}

// 5. FILTERING LOGIC
function filterProducts(category, btnElement) {
    // UI Update: Button highlight
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const filtered = category === 'All' ? products : products.filter(p => p.category === category);
    renderProducts(filtered);
}

// 6. CART MANAGEMENT
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveAndSync();
    showToast(`${product.name} added to cart!`);
}

function renderCart() {
    const tableBody = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    let grandTotal = 0;

    if (!tableBody) return;

    if (cart.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-cart-message">Your cart is currently empty.</td></tr>`;
        totalDisplay.innerText = "0.00";
        return;
    }

    tableBody.innerHTML = cart.map(item => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px">
                        <button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td><button onclick="removeItem(${item.id})" style="color:red; background:none; border:none; cursor:pointer">Remove</button></td>
            </tr>
        `;
    }).join('');

    totalDisplay.innerText = grandTotal.toFixed(2);
}

function changeQty(id, amount) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += amount;
        if (item.qty <= 0) removeItem(id);
        else {
            saveAndSync();
            renderCart();
        }
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveAndSync();
    renderCart();
}

function saveAndSync() {
    localStorage.setItem('pixalara_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        countEl.innerText = total;
    }
}

// 7. UI FEEDBACK (Toast Notifications)
function showToast(message) {
    // Check if toast element exists, if not create it
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 8. AUTHENTICATION LOGIC
function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    showToast(`Logging in as ${email}...`);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function toggleAuth() {
    const login = document.getElementById('login-form');
    const register = document.getElementById('register-form');
    login.style.display = login.style.display === 'none' ? 'block' : 'none';
    register.style.display = register.style.display === 'none' ? 'block' : 'none';
}

// =========================================
// HERO SLIDER ADD-ON LOGIC
// =========================================
let currentSlide = 0;
// We select specific products (Headphones, Watch, Speaker) to feature in the slider
const sliderItems = products.filter(p => [2, 6, 8].includes(p.id));

function initSlider() {
    const container = document.getElementById('hero-slider');
    const dotsContainer = document.getElementById('slider-dots');
    if (!container) return;

    // Inject Slides
    container.innerHTML = sliderItems.map(p => `
        <div class="slide" style="background-image: url('${p.img}')">
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <span style="color:var(--accent-green); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Trending in ${p.category}</span>
                <h2>${p.name}</h2>
                <p>Smart Shopping. Delivered Simply..</p>
                <div style="margin-top: 20px;">
                    <button class="btn" onclick="addToCart(${p.id})">Buy Now — $${p.price}</button>
                </div>
            </div>
        </div>
    `).join('');

    // Inject Dots
    dotsContainer.innerHTML = sliderItems.map((_, i) => 
        `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`
    ).join('');

    // Auto-slide trigger
    setInterval(() => moveSlider(1), 5000);
}

function moveSlider(dir) {
    currentSlide = (currentSlide + dir + sliderItems.length) % sliderItems.length;
    updateSliderUI();
}

function goToSlide(index) {
    currentSlide = index;
    updateSliderUI();
}

function updateSliderUI() {
    const slider = document.getElementById('hero-slider');
    const dots = document.querySelectorAll('.dot');
    if(!slider) return;
    
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

// Modify your existing initApp to call the slider
const originalInit = initApp;
initApp = function() {
    originalInit();
    initSlider();
};