// API Endpoint
const apiEndpoint = 'https://fakestoreapi.com/products';

// Variables
let products = []; // All products fetched from the API
let filteredProducts = []; // Products after applying filters
let visibleProducts = []; // Currently displayed products
let currentIndex = 0; // Current pagination index
const pageSize = 10; // Number of products to show per page
let min; // Minimum price for filtering
let max; // Maximum price for filtering

// DOM Elements
const productList = document.getElementById('product-list');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search');
const mobileSearchInput = document.getElementById('mobileSearch');
const categoryFilters = document.getElementById('category-filters');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sortDropdown = document.getElementById('sort');
const mainContainer = document.querySelector('.main-container');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const thumb1 = document.getElementById('thumb1');
const thumb2 = document.getElementById('thumb2');
const range = document.getElementById('range');
const slider = document.querySelector('.slider');
const closeSidebarBtn = document.getElementById('close-sidebar');

// Loading spinner
const loadingSpinner = document.createElement('div');
loadingSpinner.className = 'loading-spinner';
document.body.appendChild(loadingSpinner); // Add spinner to the DOM

/**
 * Show loading spinner
 */
function showLoading() {
    loadingSpinner.style.display = 'block';
    mainContainer.classList.add('loading');
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    loadingSpinner.style.display = 'none';
    mainContainer.classList.remove('loading');
}

/**
 * Initialize price slider with product price range
 */
function initializePriceSlider() {
    min = 0;
    max = Math.max(...products.map(product => product.price));
    maxPriceInput.max = max;

    minPriceInput.value = 0;
    maxPriceInput.value = max;
    updateRange();
}

/**
 * Sort products based on dropdown selection
 */
function sortProducts() {
    const sortValue = sortDropdown.value;

    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    currentIndex = 0;
    productList.innerHTML = '';
    loadProducts();
}

// Attach event listener for sorting
sortDropdown.addEventListener('change', sortProducts);

/**
 * Fetch products from the API
 */
async function fetchProducts() {
    try {
        showLoading();
        const response = await fetch(apiEndpoint);
        products = await response.json();
        populateCategoryFilters();
        initializePriceSlider();
        filteredProducts = [...products];
		document.querySelector('footer').style.display = 'block';
    } catch (error) {
        productList.innerHTML = '<p class="disError">Error loading products. Please try again later.</p>';
    } finally {
        
        hideLoading();
    }
}

/**
 * Populate category filters dynamically
 */
function populateCategoryFilters() {
    const categories = [...new Set(products.map(product => product.category))];
    categories.forEach(category => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" value="${category}" class="category-checkbox">
            ${category}
        `;
        categoryFilters.appendChild(label);
    });

    // Attach event listener to category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', filterByCategory);
    });
}

/**
 * Filter products by selected categories
 */
function filterByCategory() {
    const selectedCategories = Array.from(
        document.querySelectorAll('.category-checkbox:checked')
    ).map(checkbox => checkbox.value);

    filteredProducts = selectedCategories.length
        ? products.filter(product => selectedCategories.includes(product.category))
        : [...products];

    currentIndex = 0;
    productList.innerHTML = '';
    loadProducts();
}

/**
 * Render a list of products on the page
 * @param {Array} productsToRender - Array of product objects to render
 */
function renderProducts(productsToRender) {
    const fragment = document.createDocumentFragment();
    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-img" src="${product.image}" alt="${product.title}" />
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <img id="wishlist" class="wishlist deactive" onclick="toggleWishlist(event)">
        `;
        fragment.appendChild(card);
    });
    productList.appendChild(fragment);
}

/**
 * Load more products on the page with pagination
 */
function loadProducts() {
	if(filteredProducts.length == 0){
		 productList.innerHTML = '<p class="disError">No Products to display</p>';
		 document.querySelector('footer').style.display = 'none';
		 return 0;
	}
    const nextProducts = filteredProducts.slice(currentIndex, currentIndex + pageSize);
    renderProducts(nextProducts);
    currentIndex += pageSize;

    loadMoreBtn.style.display =
        currentIndex >= filteredProducts.length ? 'none' : 'block';
	document.querySelector('footer').style.display = 'block';
}

/**
 * Search products by title
 */
function searchProducts() {
    const searchTerm = this.value.toLowerCase();
    filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );
    currentIndex = 0;
    productList.innerHTML = '';
    loadProducts();
}

// Sidebar toggle for mobile
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
    sidebar.classList.toggle('hidden');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('visible');
});

/**
 * Toggle wishlist active/deactive state
 * @param {Event} e - Click event
 */
function toggleWishlist(e) {
    const currItem = e.target;
    currItem.classList.toggle('deactive');
    currItem.classList.toggle('active');
}

/**
 * Update the price slider range and filtered products
 */
function updateRange() {
    const left = thumb1.offsetLeft;
    const right = thumb2.offsetLeft;

    range.style.left = `${(left / slider.offsetWidth) * 100}%`;
    range.style.width = `${((right - left) / slider.offsetWidth) * 100}%`;

    const minValue = Math.round((left / slider.offsetWidth) * (max - min) + min);
    const maxValue = Math.round((right / slider.offsetWidth) * (max - min) + min);

    minPriceInput.value = minValue || min;
    maxPriceInput.value = maxValue || max;

    updateProductsByPrice();
}

/**
 * Update displayed products based on price range
 */
function updateProductsByPrice() {
    const minPrice = parseFloat(minPriceInput.value);
    const maxPrice = parseFloat(maxPriceInput.value);

    filteredProducts = products.filter(
        product => product.price >= minPrice && product.price <= maxPrice
    );
    currentIndex = 0;
    productList.innerHTML = '';
    loadProducts();
}

// Event listeners
searchInput.addEventListener('input', searchProducts);
mobileSearchInput.addEventListener('input', searchProducts);
loadMoreBtn.addEventListener('click', loadProducts);
minPriceInput.addEventListener('change', updateRange);
maxPriceInput.addEventListener('change', updateRange);

// Initialize application
fetchProducts();
