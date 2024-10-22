const socket = io();

const addProductBtn = document.getElementById('add-product-btn');
const modal = document.getElementById('product-modal');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('product-form');

addProductBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const product = {
    title: event.target.title.value,
    description: event.target.description.value,
    code: event.target.code.value,
    price: event.target.price.value,
    status: event.target.status.checked,
    stock: event.target.stock.value,
    category: event.target.category.value,
  };
  socket.emit('addProduct', product);
  event.target.reset();
  modal.style.display = 'none';
});

socket.on('updateProducts', (products) => {
  const productsTable = document.getElementById('products-table');
  productsTable.innerHTML = ''; 
  products.forEach(product => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${product.title}</td>
      <td>${product.description}</td>
      <td>${product.code}</td>
      <td>${product.price}</td>
      <td>${product.status}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      <td>${product.id}</td>
      <td><button class="delete-btn" data-id="${product.id}">🗑️</button></td>
    `;

    productsTable.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      socket.emit('deleteProduct', id);
    });
  });
});


