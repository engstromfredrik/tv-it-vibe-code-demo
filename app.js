const API = "https://fakestoreapi.com";

let products = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// DOM elements
const productsEl = document.getElementById("products");
const categoriesEl = document.getElementById("categories");
const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const modal = document.getElementById("product-modal");
const modalClose = document.getElementById("modal-close");
const modalBody = document.getElementById("modal-body");

// Fetch and render products
async function loadProducts() {
  productsEl.innerHTML = '<div class="loading">Loading products...</div>';
  try {
    const res = await fetch(`${API}/products`);
    products = await res.json();
    renderProducts(products);
  } catch (err) {
    productsEl.innerHTML = '<div class="loading">Failed to load products.</div>';
  }
}

// Fetch and render categories
async function loadCategories() {
  try {
    const res = await fetch(`${API}/products/categories`);
    const categories = await res.json();
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "cat-btn";
      btn.dataset.category = cat;
      btn.textContent = cat;
      btn.addEventListener("click", () => filterByCategory(cat));
      categoriesEl.appendChild(btn);
    });
  } catch (err) {
    // categories are optional, fail silently
  }
}

function filterByCategory(category) {
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });

  if (category === "all") {
    renderProducts(products);
  } else {
    renderProducts(products.filter((p) => p.category === category));
  }
}

// Set up the "All" button listener
document.querySelector('[data-category="all"]').addEventListener("click", () => {
  filterByCategory("all");
});

function renderProducts(list) {
  productsEl.innerHTML = "";
  if (list.length === 0) {
    productsEl.innerHTML = '<div class="loading">No products found.</div>';
    return;
  }
  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <div class="price">$${product.price.toFixed(2)}</div>
      <button class="add-btn">Add to Cart</button>
    `;
    card.querySelector("img").addEventListener("click", () => showDetail(product));
    card.querySelector("h3").addEventListener("click", () => showDetail(product));
    card.querySelector(".add-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product);
    });
    productsEl.appendChild(card);
  });
}

// Product detail modal
function showDetail(product) {
  modalBody.innerHTML = `
    <div class="modal-detail">
      <img src="${product.image}" alt="${product.title}">
      <span class="category">${product.category}</span>
      <h2>${product.title}</h2>
      <div class="price">$${product.price.toFixed(2)}</div>
      <p>${product.description}</p>
      <button class="add-btn">Add to Cart</button>
    </div>
  `;
  modalBody.querySelector(".add-btn").addEventListener("click", () => {
    addToCart(product);
    modal.classList.add("hidden");
  });
  modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// Cart logic
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  }
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
}

function updateQty(productId, delta) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCountEl.textContent = totalItems;
  cartTotalEl.textContent = totalPrice.toFixed(2);

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <div>$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button data-id="${item.id}" data-action="minus">-</button>
          <span>${item.qty}</span>
          <button data-id="${item.id}" data-action="plus">+</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  cartItemsEl.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const delta = btn.dataset.action === "plus" ? 1 : -1;
      updateQty(id, delta);
    });
  });
}

// Cart open/close
cartToggle.addEventListener("click", () => cartOverlay.classList.remove("hidden"));
cartClose.addEventListener("click", () => cartOverlay.classList.add("hidden"));
cartOverlay.addEventListener("click", (e) => {
  if (e.target === cartOverlay) cartOverlay.classList.add("hidden");
});

// Init
renderCart();
loadCategories();
loadProducts();
