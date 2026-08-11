/**
 * AN NAHEEMY FABRICS - Main Interactive Script
 * Features: Catalog Render, Filters, Visualizer Modal, WhatsApp Cart System
 * Phone / WhatsApp: 09120273899
 */

window.AnNaheemyCart = {
  items: [],

  addItem(fabric, yards = 4, garmentStyle = '') {
    const existingIndex = this.items.findIndex(item => item.fabric.id === fabric.id && item.garmentStyle === garmentStyle);
    if (existingIndex > -1) {
      this.items[existingIndex].yards += yards;
    } else {
      this.items.push({
        fabric: fabric,
        yards: yards,
        garmentStyle: garmentStyle || 'Custom Yard Cut'
      });
    }
    this.updateUI();
  },

  removeItem(index) {
    this.items.splice(index, 1);
    this.updateUI();
  },

  updateYards(index, delta) {
    if (this.items[index]) {
      this.items[index].yards = Math.max(1, this.items[index].yards + delta);
      this.updateUI();
    }
  },

  getTotalCost() {
    return this.items.reduce((sum, item) => sum + (item.fabric.pricePerYard * item.yards), 0);
  },

  updateUI() {
    const cartCountBadge = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total-price');

    const totalItemCount = this.items.reduce((sum, item) => sum + 1, 0);

    if (cartCountBadge) {
      cartCountBadge.textContent = totalItemCount;
      cartCountBadge.style.display = totalItemCount > 0 ? 'inline-flex' : 'none';
    }

    if (cartTotalEl) {
      cartTotalEl.textContent = `₦${this.getTotalCost().toLocaleString()}`;
    }

    if (cartItemsContainer) {
      if (this.items.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart-msg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <p>Your order bag is empty.</p>
            <small>Explore our Cashmere, Wool & Star Materials and select your desired yards!</small>
          </div>
        `;
      } else {
        cartItemsContainer.innerHTML = this.items.map((item, index) => `
          <div class="cart-item-card">
            <img src="${item.fabric.image}" alt="${item.fabric.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h4>${item.fabric.name}</h4>
              <span class="cart-item-tag">${item.garmentStyle}</span>
              <p class="cart-item-price">₦${item.fabric.pricePerYard.toLocaleString()} / yard</p>
              
              <div class="cart-yard-controls">
                <button onclick="AnNaheemyCart.updateYards(${index}, -0.5)">-</button>
                <span>${item.yards} Yards</span>
                <button onclick="AnNaheemyCart.updateYards(${index}, 0.5)">+</button>
              </div>
            </div>
            <div class="cart-item-subtotal">
              <p>₦${(item.fabric.pricePerYard * item.yards).toLocaleString()}</p>
              <button class="cart-remove-btn" onclick="AnNaheemyCart.removeItem(${index})" title="Remove item">&times;</button>
            </div>
          </div>
        `).join('');
      }
    }
  },

  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  sendWhatsAppOrder() {
    if (this.items.length === 0) {
      alert("Please add at least one fabric to your order bag first!");
      return;
    }

    let message = `*NEW FABRIC ORDER & INQUIRY - AN NAHEEMY FABRICS*\n`;
    message += `-------------------------------------------\n`;
    
    this.items.forEach((item, idx) => {
      message += `*${idx + 1}. ${item.fabric.name}*\n`;
      message += `   • Material Type: ${item.fabric.category.toUpperCase()}\n`;
      message += `   • Quantity: ${item.yards} Yards\n`;
      message += `   • Outfit Style: ${item.garmentStyle}\n`;
      message += `   • Price: ₦${(item.fabric.pricePerYard * item.yards).toLocaleString()} (₦${item.fabric.pricePerYard.toLocaleString()}/yard)\n\n`;
    });

    message += `-------------------------------------------\n`;
    message += `*ESTIMATED TOTAL:* ₦${this.getTotalCost().toLocaleString()}\n\n`;
    message += `Hello AN NAHEEMY FABRICS, I would like to check availability and confirm payment/delivery for the fabric yards listed above. Quality Guaranteed!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/2349120273899?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const catalogGrid = document.getElementById('catalog-grid');
  const searchInput = document.getElementById('catalog-search');
  const categoryTabs = document.querySelectorAll('.category-tab');
  const genderFilter = document.getElementById('gender-filter');
  const sortFilter = document.getElementById('sort-filter');
  const cartToggleBtn = document.getElementById('cart-toggle');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const checkoutBtn = document.getElementById('whatsapp-checkout-btn');

  // Modal References
  const visualizerModal = document.getElementById('visualizer-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  let currentCategory = 'all';

  // Render Catalog Cards
  function renderCatalog() {
    if (!catalogGrid) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedGender = genderFilter ? genderFilter.value : 'all';
    const selectedSort = sortFilter ? sortFilter.value : 'recommended';

    let filtered = FABRICS_DATA.filter(fabric => {
      // Category filter
      if (currentCategory !== 'all' && fabric.category !== currentCategory) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all' && fabric.gender !== 'unisex' && fabric.gender !== selectedGender) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const matchesName = fabric.name.toLowerCase().includes(searchTerm);
        const matchesCategory = fabric.category.toLowerCase().includes(searchTerm);
        const matchesDesc = fabric.description.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }
      return true;
    });

    // Sorting
    if (selectedSort === 'price-low') {
      filtered.sort((a, b) => a.pricePerYard - b.pricePerYard);
    } else if (selectedSort === 'price-high') {
      filtered.sort((a, b) => b.pricePerYard - a.pricePerYard);
    }

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div class="no-results">
          <h3>No matching fabrics found</h3>
          <p>Try searching for Cashmere, Wool, 7 Stars, or Irish Linen.</p>
        </div>
      `;
      return;
    }

    catalogGrid.innerHTML = filtered.map(fabric => `
      <div class="fabric-card" data-id="${fabric.id}">
        <div class="fabric-card-badge">${fabric.badge}</div>
        <div class="fabric-img-wrap">
          <img src="${fabric.image}" alt="${fabric.name}" loading="lazy">
          <div class="fabric-overlay-actions">
            <button class="action-btn inspect-btn" onclick="openVisualizerModal('${fabric.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              Inspect Fabric Texture
            </button>
          </div>
        </div>

        <div class="fabric-card-content">
          <div class="fabric-stars">
            ${'★'.repeat(fabric.stars)}
            <span class="fabric-gender-tag">${fabric.gender.toUpperCase()}</span>
          </div>

          <h3 class="fabric-name">${fabric.name}</h3>
          <p class="fabric-desc">${fabric.description}</p>

          <div class="fabric-specs">
            <span><strong>Weight:</strong> ${fabric.weight}</span>
            <span><strong>Drape:</strong> ${fabric.drape}</span>
          </div>

          <div class="fabric-swatches">
            <span class="swatch-label">Tones:</span>
            ${fabric.colors.map(c => `<span class="color-dot" style="background-color: ${c};" title="${c}"></span>`).join('')}
          </div>

          <div class="fabric-card-footer">
            <div class="price-box">
              <span class="price-amount">₦${fabric.pricePerYard.toLocaleString()}</span>
              <span class="price-unit">/ ${fabric.unit}</span>
            </div>

            <div class="quick-yard-selector">
              <select id="yard-select-${fabric.id}">
                <option value="4" selected>4 Yards (Senator / Kaftan)</option>
                <option value="3.5">3.5 Yards (Suit / Blazer)</option>
                <option value="7">7 Yards (Grand Agbada)</option>
                <option value="5">5 Yards (Female Set)</option>
                <option value="1">1 Yard Cut</option>
              </select>
              <button class="add-cart-btn" onclick="quickAddToCart('${fabric.id}')">
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Quick Add To Cart
  window.quickAddToCart = function(fabricId) {
    const fabric = FABRICS_DATA.find(f => f.id === fabricId);
    const selectEl = document.getElementById(`yard-select-${fabricId}`);
    const yards = selectEl ? parseFloat(selectEl.value) : 4;

    if (fabric) {
      window.AnNaheemyCart.addItem(fabric, yards, `${yards} Yards Cut`);
      window.AnNaheemyCart.openDrawer();
    }
  };

  // Inspect Visualizer Modal
  window.openVisualizerModal = function(fabricId) {
    const fabric = FABRICS_DATA.find(f => f.id === fabricId);
    if (!fabric || !visualizerModal) return;

    document.getElementById('modal-fabric-title').textContent = fabric.name;
    document.getElementById('modal-fabric-badge').textContent = fabric.badge;
    document.getElementById('modal-fabric-img').src = fabric.image;
    document.getElementById('modal-fabric-price').textContent = `₦${fabric.pricePerYard.toLocaleString()} / Yard`;
    document.getElementById('modal-fabric-comp').textContent = fabric.composition;
    document.getElementById('modal-fabric-weight').textContent = fabric.weight;
    document.getElementById('modal-fabric-drape').textContent = fabric.drape;
    document.getElementById('modal-fabric-breath').textContent = fabric.breathability;
    document.getElementById('modal-fabric-desc').textContent = fabric.description;

    const stylesList = document.getElementById('modal-recommended-styles');
    if (stylesList) {
      stylesList.innerHTML = fabric.recommendedFor.map(s => `<li>✔ ${s}</li>`).join('');
    }

    const modalAddBtn = document.getElementById('modal-add-to-cart');
    if (modalAddBtn) {
      modalAddBtn.onclick = () => {
        const modalYards = parseFloat(document.getElementById('modal-yard-input').value) || 4;
        window.AnNaheemyCart.addItem(fabric, modalYards, 'Inspected Custom Cut');
        visualizerModal.classList.remove('active');
        window.AnNaheemyCart.openDrawer();
      };
    }

    visualizerModal.classList.add('active');
  };

  // Tab switching
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      renderCatalog();
    });
  });

  // Search & Filter Listeners
  if (searchInput) searchInput.addEventListener('input', renderCatalog);
  if (genderFilter) genderFilter.addEventListener('change', renderCatalog);
  if (sortFilter) sortFilter.addEventListener('change', renderCatalog);

  // Cart Drawer Events
  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => window.AnNaheemyCart.openDrawer());
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => window.AnNaheemyCart.closeDrawer());
  if (cartOverlay) cartOverlay.addEventListener('click', () => window.AnNaheemyCart.closeDrawer());
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => window.AnNaheemyCart.sendWhatsAppOrder());

  // Modal Close Events
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => visualizerModal.classList.remove('active'));

  // Testimonials Render
  const testimonialSlider = document.getElementById('testimonial-slider');
  if (testimonialSlider && typeof TESTIMONIALS !== 'undefined') {
    testimonialSlider.innerHTML = TESTIMONIALS.map(t => `
      <div class="testimonial-card">
        <div class="stars">${'★'.repeat(t.rating)}</div>
        <p class="quote">"${t.text}"</p>
        <div class="author-info">
          <strong>${t.name}</strong>
          <span>${t.role} • ${t.location}</span>
        </div>
      </div>
    `).join('');
  }

  // Initial catalog render
  renderCatalog();
  window.AnNaheemyCart.updateUI();
});
