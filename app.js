// Načtení dat z localStorage nebo vytvoření prázdného pole
let inventory = JSON.parse(localStorage.getItem('inventory_data')) || [];

const addItemForm = document.getElementById('add-item-form');
const itemNameInput = document.getElementById('item-name');
const itemQtyInput = document.getElementById('item-qty');
const itemsList = document.getElementById('items-list');
const searchInput = document.getElementById('search-input');

// Uložení do localStorage
function saveData() {
    localStorage.setItem('inventory_data', JSON.stringify(inventory));
}

// Vykreslení seznamu položek
function renderItems(filterText = '') {
    itemsList.innerHTML = '';

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredInventory.length === 0) {
        itemsList.innerHTML = '<p class="empty-msg">Žádné položky k zobrazení.</p>';
        return;
    }

    filteredInventory.forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-row';

        row.innerHTML = `
            <span class="item-name">${escapeHtml(item.name)}</span>
            <div class="item-controls">
                <button class="btn-step" onclick="changeQty(${item.id}, -1)">-</button>
                <input type="number" class="qty-input" value="${item.qty}" min="0" onchange="setQty(${item.id}, this.value)">
                <button class="btn-step" onclick="changeQty(${item.id}, 1)">+</button>
                <button class="btn-delete" onclick="deleteItem(${item.id})" title="Smazat">✕</button>
            </div>
        `;

        itemsList.appendChild(row);
    });
}

// Přidání nové položky
addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const qty = parseInt(itemQtyInput.value) || 0;

    if (!name) return;

    const newItem = {
        id: Date.now(),
        name: name,
        qty: qty < 0 ? 0 : qty
    };

    inventory.push(newItem);
    saveData();
    renderItems(searchInput.value);

    itemNameInput.value = '';
    itemQtyInput.value = '0';
    itemNameInput.focus();
});

// Změna o +1 nebo -1
window.changeQty = function(id, delta) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        item.qty = Math.max(0, item.qty + delta);
        saveData();
        renderItems(searchInput.value);
    }
};

// Přímé zadání přesné hodnoty
window.setQty = function(id, value) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        const parsedValue = parseInt(value);
        item.qty = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
        saveData();
        renderItems(searchInput.value);
    }
};

// Smazání položky
window.deleteItem = function(id) {
    if (confirm('Opravdu chcete tuto položku smazat?')) {
        inventory = inventory.filter(i => i.id !== id);
        saveData();
        renderItems(searchInput.value);
    }
};

// Vyhledávání
searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
});

// Pomocná funkce proti XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Registrace Service Workeru pro offline fungování
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.log('Service Worker registration failed: ', err);
        });
    });
}

// První vykreslení při načtení
renderItems();
