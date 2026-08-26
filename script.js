let cart = [];
let selectedProduct = { title: "", price: 0, image: "", colors: [], sizes: [], colorImages: {} };
let selectedColor = "";
let selectedSize = "";
let selectedQty = 1;

// قراءة بيانات المنتج عند الضغط على زر "شراء"
function openProductModalFromElement(btnElement) {
    const btn = btnElement.closest('.btn-buy');
    if (!btn) return;

    const title = btn.getAttribute('data-title') || '';
    const price = parseFloat(btn.getAttribute('data-price')) || 0;
    const defaultImage = btn.getAttribute('data-image') || '';
    
    const colorsAttr = btn.getAttribute('data-colors');
    const imagesAttr = btn.getAttribute('data-images');
    const sizesAttr = btn.getAttribute('data-sizes');
    
    const colors = colorsAttr ? colorsAttr.split(',') : ['افتراضي'];
    const images = imagesAttr ? imagesAttr.split(',') : [defaultImage];
    const sizes = sizesAttr ? sizesAttr.split(',') : ['Standard'];

    // ربط كل لون بالصورة الخاصة به
    const colorImages = {};
    colors.forEach((color, index) => {
        colorImages[color] = images[index] || defaultImage;
    });

    selectedProduct = { title, price, image: defaultImage, colors, sizes, colorImages };
    selectedQty = 1;
    selectedColor = colors[0];
    selectedSize = sizes[0];

    const modalImg = document.getElementById('modalProductImg');
    modalImg.src = selectedProduct.colorImages[selectedColor] || selectedProduct.image;
    
    // ضبط التحجيم المبدئي للصورة
    updateImageSizeClass(selectedSize);

    document.getElementById('modalProductTitle').innerText = selectedProduct.title;
    document.getElementById('modalProductPrice').innerText = `${selectedProduct.price} ج.م`;
    document.getElementById('modalQty').innerText = selectedQty;

    // رندر خيارات الألوان
    document.getElementById('modalColors').innerHTML = colors.map(c => 
        `<button class="color-btn ${c === selectedColor ? 'active' : ''}" onclick="selectColor('${c}', this)">${c}</button>`
    ).join('');

    // رندر خيارات المقاسات
    document.getElementById('modalSizes').innerHTML = sizes.map(s => 
        `<button class="size-btn ${s === selectedSize ? 'active' : ''}" onclick="selectSize('${s}', this)">${s}</button>`
    ).join('');

    document.getElementById('productModal').classList.add('open');
    document.getElementById('productModalOverlay').classList.add('open');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.getElementById('productModalOverlay').classList.remove('open');
}

// دالة تغيير اللون وتحديث صورة المنتج
function selectColor(color, btn) {
    selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const modalImg = document.getElementById('modalProductImg');
    if (selectedProduct.colorImages && selectedProduct.colorImages[color]) {
        modalImg.src = selectedProduct.colorImages[color];
    }
}

// دالة تغيير المقاس وتطبيق تأثير التكبير/التصغير على الصورة
function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updateImageSizeClass(size);
}

// تغيير حجم الصورة في النافذة طبقاً للمقاس المختار
function updateImageSizeClass(size) {
    const modalImg = document.getElementById('modalProductImg');
    modalImg.classList.remove('size-m', 'size-l', 'size-xl', 'size-xxl');
    
    const lowerSize = size.toLowerCase();
    if (lowerSize.includes('m') || lowerSize === '30') {
        modalImg.classList.add('size-m');
    } else if (lowerSize.includes('xl')) {
        modalImg.classList.add('size-xl');
    } else if (lowerSize.includes('xxl')) {
        modalImg.classList.add('size-xxl');
    } else {
        modalImg.classList.add('size-l');
    }
}

function changeQty(amount) {
    if (selectedQty + amount >= 1) {
        selectedQty += amount;
        document.getElementById('modalQty').innerText = selectedQty;
    }
}

function confirmAddToCart() {
    if (!selectedProduct || !selectedProduct.title) return;

    const itemPrice = selectedProduct.price;
    const cartItem = {
        title: `${selectedProduct.title} (${selectedColor} - ${selectedSize})`,
        price: itemPrice * selectedQty,
        qty: selectedQty
    };
    
    cart.push(cartItem);
    updateCartUI();
    closeProductModal();
    toggleCart();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cartTotal');

    cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: #777; text-align: center; margin-top: 20px;">السلة فارغة حالياً</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div>
                    <div style="font-weight: bold;">${item.title}</div>
                    <small style="color: #ff5500;">${item.price} ج.م (العدد: ${item.qty})</small>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">حذف</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    cartTotal.innerText = `${total} ج.م`;
}

function checkout() {
    if (cart.length === 0) {
        alert('السلة فارغة حالياً!');
        return;
    }
    alert('تم تنفيذ طلبك بنجاح!');
    cart = [];
    updateCartUI();
    toggleCart();
}