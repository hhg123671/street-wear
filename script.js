// حالة السلة والمنتج المحدد
let cart = [];
let currentProduct = null;

// فتح وإغلاق Modal المنتج
function openProductModalFromElement(btn) {
  const title = btn.getAttribute('data-title') || '';
  const price = parseFloat(btn.getAttribute('data-price')) || 0;
  const image = btn.getAttribute('data-image') || '';
  
  // تنظيف المصفوفات وإزالة المسافات الزائدة
  const colors = btn.getAttribute('data-colors') 
    ? btn.getAttribute('data-colors').split(',').map(v => v.trim()).filter(Boolean)
    : [];
  const images = btn.getAttribute('data-images') 
    ? btn.getAttribute('data-images').split(',').map(v => v.trim()).filter(Boolean)
    : [];
  const sizes = btn.getAttribute('data-sizes') 
    ? btn.getAttribute('data-sizes').split(',').map(v => v.trim()).filter(Boolean)
    : [];

  currentProduct = {
    title,
    price,
    image,
    images,
    colors,
    selectedColor: colors[0] || '',
    selectedSize: sizes[0] || '',
    qty: 1
  };

  document.getElementById('modalProductTitle').innerText = title;
  document.getElementById('modalProductPrice').innerText = `${price} ج.م`;
  document.getElementById('modalProductImg').src = image;
  document.getElementById('modalQty').innerText = '1';

  // إنشاء أزرار الألوان بأمان عبر DOM Element لمنع مشاكل النصوص
  const colorsContainer = document.getElementById('modalColors');
  colorsContainer.innerHTML = '';
  colors.forEach((c, index) => {
    const button = document.createElement('button');
    button.className = `opt-btn ${index === 0 ? 'active' : ''}`;
    button.innerText = c;
    button.onclick = function() { selectOption('color', c, index, this); };
    colorsContainer.appendChild(button);
  });

  // إنشاء أزرار المقاسات
  const sizesContainer = document.getElementById('modalSizes');
  sizesContainer.innerHTML = '';
  sizes.forEach((s, index) => {
    const button = document.createElement('button');
    button.className = `opt-btn ${index === 0 ? 'active' : ''}`;
    button.innerText = s;
    button.onclick = function() { selectOption('size', s, index, this); };
    sizesContainer.appendChild(button);
  });

  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('productModalOverlay');

  if (modal) modal.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('productModalOverlay');

  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function selectOption(type, value, index, btn) {
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');

  if (type === 'color') {
    currentProduct.selectedColor = value;
    
    // التبديل للصورة المقابلة للون مباشرة حسب الـ Index
    const selectedImage = currentProduct.images[index] || currentProduct.images[0] || currentProduct.image;
    const productImage = document.getElementById('modalProductImg');

    if (selectedImage && productImage) {
      currentProduct.image = selectedImage;
      productImage.src = selectedImage;
    }
  }

  if (type === 'size') {
    currentProduct.selectedSize = value;
  }
}

function changeQty(amount) {
  if (!currentProduct) return;
  currentProduct.qty = Math.max(1, currentProduct.qty + amount);
  document.getElementById('modalQty').innerText = currentProduct.qty;
}

// التحكم بالسلة
function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');

  if (!cartSidebar || !cartOverlay) return;

  cartSidebar.classList.toggle('active');
  cartOverlay.classList.toggle('active');
}

function confirmAddToCart() {
  if (!currentProduct) return;

  const existingIndex = cart.findIndex(item =>
    item.title === currentProduct.title &&
    item.selectedColor === currentProduct.selectedColor &&
    item.selectedSize === currentProduct.selectedSize
  );

  if (existingIndex > -1) {
    cart[existingIndex].qty += currentProduct.qty;
  } else {
    cart.push({ ...currentProduct });
  }

  updateCartUI();
  closeProductModal();
  toggleCart();
  showToast(`تمت إضافة ${currentProduct.title} إلى السلة`);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add('show');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function updateCartUI() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cartTotal');

  if (!cartItems || !cartCount || !cartTotal) return;

  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">السلة فارغة الآن.</div>';
    cartCount.innerText = '0';
    cartTotal.innerText = '0 ج.م';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => {
    total += item.price * item.qty;
    count += item.qty;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" width="50">
        <div>
          <h4>${item.title}</h4>
          <p>${item.selectedColor} | ${item.selectedSize}</p>
          <p>${item.qty} × ${item.price} ج.م</p>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${index})">&times;</button>
      </div>
    `;
  }).join('');

  cartCount.innerText = count;
  cartTotal.innerText = `${total} ج.م`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function checkout() {
  if (cart.length === 0) return alert('السلة فارغة!');

  let message = 'مرحباً، أريد إتمام الطلب التالي:\n';
  cart.forEach(item => {
    message += `- ${item.title} (${item.selectedColor} / ${item.selectedSize}) × ${item.qty} = ${item.price * item.qty} ج.م\n`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  message += `\nالإجمالي: ${total} ج.م`;

  window.open(`https://wa.me/201064392329?text=${encodeURIComponent(message)}`, '_blank');
}

function openOrderModal() {
  const modal = document.getElementById('orderModal');
  const overlay = document.getElementById('orderModalOverlay');

  if (cart.length === 0) {
    alert('السلة فارغة، أضف منتجات أولاً.');
    return;
  }

  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.getElementById('customerName').focus();
  } else {
    checkout();
  }
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  const overlay = document.getElementById('orderModalOverlay');

  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function getOrdersStorage() {
  try {
    const localData = localStorage.getItem('streetwear_orders');
    if (localData) return JSON.parse(localData);
  } catch (error) {
    console.warn('localStorage unavailable, using sessionStorage', error);
  }

  try {
    const sessionData = sessionStorage.getItem('streetwear_orders');
    if (sessionData) return JSON.parse(sessionData);
  } catch (error) {
    console.warn('sessionStorage unavailable', error);
  }

  return [];
}

function saveOrdersStorage(orders) {
  try {
    localStorage.setItem('streetwear_orders', JSON.stringify(orders));
  } catch (error) {
    console.warn('Could not save to localStorage, trying sessionStorage', error);
  }

  try {
    sessionStorage.setItem('streetwear_orders', JSON.stringify(orders));
  } catch (error) {
    console.warn('Could not save to sessionStorage', error);
  }
}

function saveOrderToLocalStorage(order) {
  const existingOrders = getOrdersStorage();
  existingOrders.push(order);
  saveOrdersStorage(existingOrders);
}

function buildOrderMessage(name, phone, notes, total) {
  let message = `مرحباً، أريد إتمام الطلب التالي:\n`;
  cart.forEach(item => {
    message += `- ${item.title} (${item.selectedColor} / ${item.selectedSize}) × ${item.qty} = ${item.price * item.qty} ج.م\n`;
  });

  message += `\nاسم العميل: ${name}\nرقم الهاتف: ${phone}`;

  if (notes) {
    message += `\nملاحظات: ${notes}`;
  }

  message += `\n\nالإجمالي: ${total} ج.م`;
  return message;
}

function submitOrderForm(event) {
  event.preventDefault();

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const notes = document.getElementById('customerNotes').value.trim();
  const submitter = event.submitter || document.querySelector('#orderSubmit');
  const mode = submitter && submitter.dataset.mode ? submitter.dataset.mode : 'whatsapp';

  if (!name || !phone) {
    alert('يرجى إدخال الاسم ورقم الهاتف.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const createdAt = new Date().toISOString();

  const order = {
    id: Date.now(),
    name,
    phone,
    notes,
    items: cart.map(item => ({ ...item })),
    total,
    createdAt,
    mode
  };

  saveOrderToLocalStorage(order);

  if (mode === 'site') {
    closeOrderModal();
    cart = [];
    updateCartUI();
    showToast('تم حفظ الطلب في صفحة الطلبات');
    return;
  }

  const message = buildOrderMessage(name, phone, notes, total);
  closeOrderModal();
  window.open(`https://wa.me/201064392329?text=${encodeURIComponent(message)}`, '_blank');
  cart = [];
  updateCartUI();
  showToast('تم تجهيز طلبك بنجاح');
}

window.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', submitOrderForm);
  }

  const orderCancel = document.getElementById('orderCancel');
  if (orderCancel) {
    orderCancel.addEventListener('click', closeOrderModal);
  }

  const orderOverlay = document.getElementById('orderModalOverlay');
  if (orderOverlay) {
    orderOverlay.addEventListener('click', closeOrderModal);
  }
});
