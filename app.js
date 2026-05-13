const dinners = [
  { id: 1,  name: "Spaghetti Bolognese",       category: "Pasta",          effort: "Medium", emoji: "🍝" },
  { id: 2,  name: "Chicken Stir Fry",           category: "Asian",          effort: "Easy",   emoji: "🥢" },
  { id: 3,  name: "Tacos",                      category: "Mexican",        effort: "Easy",   emoji: "🌮" },
  { id: 4,  name: "Grilled Salmon",             category: "Fish",           effort: "Medium", emoji: "🐟" },
  { id: 5,  name: "Homemade Pizza",             category: "Italian",        effort: "Medium", emoji: "🍕" },
  { id: 6,  name: "Thai Green Curry",           category: "Asian",          effort: "Medium", emoji: "🍛" },
  { id: 7,  name: "Cheeseburgers",              category: "American",       effort: "Easy",   emoji: "🍔" },
  { id: 8,  name: "Caesar Salad",               category: "Salad",          effort: "Easy",   emoji: "🥗" },
  { id: 9,  name: "Beef Stew",                  category: "Comfort",        effort: "Hard",   emoji: "🥘" },
  { id: 10, name: "Pesto Pasta",                category: "Pasta",          effort: "Easy",   emoji: "🍃" },
  { id: 11, name: "Shrimp Tacos",               category: "Mexican",        effort: "Easy",   emoji: "🦐" },
  { id: 12, name: "Chicken Tikka Masala",       category: "Indian",         effort: "Medium", emoji: "🍗" },
  { id: 13, name: "Veggie Fried Rice",          category: "Asian",          effort: "Easy",   emoji: "🍚" },
  { id: 14, name: "BBQ Ribs",                   category: "American",       effort: "Hard",   emoji: "🍖" },
  { id: 15, name: "Shakshuka",                  category: "Middle Eastern", effort: "Easy",   emoji: "🍳" },
  { id: 16, name: "Falafel Bowl",               category: "Middle Eastern", effort: "Medium", emoji: "🧆" },
  { id: 17, name: "Fish and Chips",             category: "British",        effort: "Medium", emoji: "🐠" },
  { id: 18, name: "Lamb Kofta",                 category: "Middle Eastern", effort: "Medium", emoji: "🫙" },
  { id: 19, name: "Ramen",                      category: "Japanese",       effort: "Medium", emoji: "🍜" },
  { id: 20, name: "Pad Thai",                   category: "Asian",          effort: "Medium", emoji: "🥡" },
  { id: 21, name: "Mushroom Risotto",           category: "Italian",        effort: "Hard",   emoji: "🍄" },
  { id: 22, name: "BLT Sandwich",              category: "Quick",          effort: "Easy",   emoji: "🥪" },
  { id: 23, name: "Grilled Veggie Wrap",        category: "Vegetarian",     effort: "Easy",   emoji: "🌯" },
  { id: 24, name: "Stuffed Bell Peppers",       category: "Comfort",        effort: "Medium", emoji: "🫑" },
  { id: 25, name: "Pulled Pork Sandwich",       category: "American",       effort: "Hard",   emoji: "🥩" },
  { id: 26, name: "Lentil Soup",               category: "Vegetarian",     effort: "Easy",   emoji: "🫘" },
  { id: 27, name: "Nachos",                     category: "Mexican",        effort: "Easy",   emoji: "🧀" },
  { id: 28, name: "Greek Salad with Souvlaki", category: "Greek",          effort: "Easy",   emoji: "🫒" },
  { id: 29, name: "Butter Chicken",             category: "Indian",         effort: "Medium", emoji: "🍲" },
  { id: 30, name: "Carbonara",                  category: "Pasta",          effort: "Medium", emoji: "🥚" },
];

const categories = ["All", ...new Set(dinners.map(d => d.category))];
const efforts    = ["All", "Easy", "Medium", "Hard"];

let favorites      = JSON.parse(localStorage.getItem("dinnerFavorites") || "[]");
let activeCategory = "All";
let activeEffort   = "All";
let showFavOnly    = false;

function saveFavorites() {
  localStorage.setItem("dinnerFavorites", JSON.stringify(favorites));
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
  renderCards();
}

function filteredDinners() {
  return dinners.filter(d => {
    if (activeCategory !== "All" && d.category !== activeCategory) return false;
    if (activeEffort   !== "All" && d.effort   !== activeEffort)   return false;
    if (showFavOnly && !favorites.includes(d.id))                  return false;
    return true;
  });
}

function renderFilters() {
  const catWrap = document.getElementById("category-filters");
  const effWrap = document.getElementById("effort-filters");

  catWrap.innerHTML = categories.map(c => `
    <button class="filter-btn ${activeCategory === c ? "active" : ""}" data-cat="${c}">${c}</button>
  `).join("");

  effWrap.innerHTML = efforts.map(e => `
    <button class="filter-btn effort-${e.toLowerCase()} ${activeEffort === e ? "active" : ""}" data-eff="${e}">${e}</button>
  `).join("");

  catWrap.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderCards();
    });
  });

  effWrap.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeEffort = btn.dataset.eff;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const grid  = document.getElementById("dinner-grid");
  const count = document.getElementById("result-count");
  const list  = filteredDinners();

  count.textContent = `${list.length} dinner${list.length !== 1 ? "s" : ""}`;

  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">No dinners match your filters.</p>`;
    return;
  }

  grid.innerHTML = list.map(d => {
    const isFav = favorites.includes(d.id);
    return `
      <div class="card">
        <div class="card-emoji">${d.emoji}</div>
        <div class="card-body">
          <h3 class="card-title">${d.name}</h3>
          <div class="card-tags">
            <span class="tag tag-category">${d.category}</span>
            <span class="tag tag-effort ${d.effort.toLowerCase()}">${d.effort}</span>
          </div>
        </div>
        <button class="fav-btn ${isFav ? "active" : ""}" data-id="${d.id}" title="${isFav ? "Remove favorite" : "Add to favorites"}">
          ${isFav ? "♥" : "♡"}
        </button>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleFavorite(Number(btn.dataset.id)));
  });
}

function surpriseMe() {
  const list = filteredDinners();
  if (list.length === 0) return;

  const picked = list[Math.floor(Math.random() * list.length)];
  const modal  = document.getElementById("modal");
  const box    = document.getElementById("modal-content");

  box.innerHTML = `
    <div class="modal-emoji">${picked.emoji}</div>
    <h2>${picked.name}</h2>
    <div class="card-tags" style="justify-content:center;margin-top:0.5rem">
      <span class="tag tag-category">${picked.category}</span>
      <span class="tag tag-effort ${picked.effort.toLowerCase()}">${picked.effort}</span>
    </div>
    <p class="modal-sub">Tonight's dinner is decided!</p>
    <button id="modal-close" class="close-btn">Got it!</button>
  `;

  modal.classList.remove("hidden");
  document.getElementById("modal-close").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderCards();

  document.getElementById("surprise-btn").addEventListener("click", surpriseMe);

  document.getElementById("modal").addEventListener("click", e => {
    if (e.target === document.getElementById("modal")) {
      document.getElementById("modal").classList.add("hidden");
    }
  });

  document.getElementById("fav-toggle").addEventListener("change", e => {
    showFavOnly = e.target.checked;
    renderCards();
  });
});
