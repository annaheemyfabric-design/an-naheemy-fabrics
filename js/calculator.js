/**
 * AN NAHEEMY FABRICS - Garment Yardage & Cost Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const genderRadioBtns = document.querySelectorAll('input[name="calc-gender"]');
  const styleSelect = document.getElementById('calc-garment-style');
  const buildSelect = document.getElementById('calc-body-build');
  const materialSelect = document.getElementById('calc-fabric-material');
  const calculatedYardsEl = document.getElementById('calc-result-yards');
  const calculatedCostEl = document.getElementById('calc-result-cost');
  const styleDescriptionEl = document.getElementById('calc-style-desc');
  const addToCartBtn = document.getElementById('calc-add-to-cart');

  if (!styleSelect || !calculatedYardsEl) return;

  // Populate Fabric Material Options
  function populateMaterialDropdown() {
    materialSelect.innerHTML = FABRICS_DATA.map(f => `
      <option value="${f.id}" data-price="${f.pricePerYard}">
        ${f.name} — ₦${f.pricePerYard.toLocaleString()}/yard (${f.badge})
      </option>
    `).join('');
  }

  // Populate Style Dropdown Based on Selected Gender
  function populateStyles(gender) {
    const styles = GARMENT_STYLES[gender] || GARMENT_STYLES.male;
    styleSelect.innerHTML = styles.map(s => `
      <option value="${s.id}" data-yards="${s.defaultYards}" data-desc="${s.description}">
        ${s.name} (Base: ${s.defaultYards} yards)
      </option>
    `).join('');
    updateCalculation();
  }

  // Calculate Yardage & Price
  function updateCalculation() {
    const selectedGender = document.querySelector('input[name="calc-gender"]:checked')?.value || 'male';
    const selectedStyleOpt = styleSelect.options[styleSelect.selectedIndex];
    const selectedMatOpt = materialSelect.options[materialSelect.selectedIndex];

    if (!selectedStyleOpt || !selectedMatOpt) return;

    const baseYards = parseFloat(selectedStyleOpt.getAttribute('data-yards')) || 4;
    const styleDesc = selectedStyleOpt.getAttribute('data-desc') || '';
    const buildMultiplier = parseFloat(buildSelect.value) || 1.0;
    const pricePerYard = parseFloat(selectedMatOpt.getAttribute('data-price')) || 12500;

    // Calculate final yards rounded to nearest 0.5 yards
    let totalYards = Math.ceil((baseYards * buildMultiplier) * 2) / 2;
    if (totalYards < 3) totalYards = 3;

    const totalCost = totalYards * pricePerYard;

    // UI Updates
    calculatedYardsEl.textContent = `${totalYards} Yards`;
    calculatedCostEl.textContent = `₦${totalCost.toLocaleString()}`;
    if (styleDescriptionEl) {
      styleDescriptionEl.textContent = `${styleDesc} • Recommended cut: ${totalYards} yards.`;
    }
  }

  // Event Listeners
  genderRadioBtns.forEach(radio => {
    radio.addEventListener('change', (e) => {
      populateStyles(e.target.value);
    });
  });

  styleSelect.addEventListener('change', updateCalculation);
  buildSelect.addEventListener('change', updateCalculation);
  materialSelect.addEventListener('change', updateCalculation);

  // Initialize
  populateMaterialDropdown();
  populateStyles('male');

  // Add Calculated Outfit to Order Cart
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const matId = materialSelect.value;
      const fabric = FABRICS_DATA.find(f => f.id === matId);
      const selectedStyleText = styleSelect.options[styleSelect.selectedIndex].text.split(' (')[0];
      const yardsText = calculatedYardsEl.textContent;
      const yardsVal = parseFloat(yardsText);

      if (fabric && window.AnNaheemyCart) {
        window.AnNaheemyCart.addItem(fabric, yardsVal, selectedStyleText);
        window.AnNaheemyCart.openDrawer();
      }
    });
  }
});
