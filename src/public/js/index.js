document.addEventListener("DOMContentLoaded", async () => {
    const productsContainer = document.querySelector(".styled-table tbody");
    const paginationContainer = document.querySelector(".pagination");
    const limitSelector = document.querySelector("#limitSelector");
    const showCartProductsButton = document.getElementById('show-cart-products');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.modal .close');
    const cartProductsList = document.getElementById('cart-products-list');

    let currentPage = 1;
    let limit = 10; // Valor por defecto actualizado a 10
    let cartId = null; // Variable para almacenar el ID del carrito

    // Establecer el valor del selector de límite a 10
    limitSelector.value = limit;

    // Función para obtener el ID del carrito
    const fetchCartId = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/carts/');
            const data = await response.json();
            if (data.payload) {
                cartId = data.payload._id;
            }
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
        }
    };

    // Función para obtener los productos
    const fetchProducts = async (page = 1, limit = 10) => {
        try {
            const response = await fetch(`http://localhost:8080/api/products?page=${page}&limit=${limit}`);
            const data = await response.json();

            // Renderiza los productos en la tabla
            renderProducts(data.payload);

            // Renderiza los controles de paginación
            renderPagination(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Función para renderizar los productos en la tabla
    const renderProducts = (products) => {
        productsContainer.innerHTML = products
            .map(
                (product) => `
                <tr>
                    <td>${product.title}</td>
                    <td>${product.description}</td>
                    <td>${product.code}</td>
                    <td>${product.price}</td>
                    <td>${product.status}</td>
                    <td>${product.stock}</td>
                    <td>${product.category}</td>
                    <td>${product._id}</td>
                    <td><button class="add-to-cart" data-product-id="${product._id}">Add to Cart</button></td>
                </tr>`
            )
            .join("");

        // Asignar eventos a los botones "Agregar al carrito"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.getAttribute('data-product-id');

                if (cartId) {
                    try {
                        await fetch(`http://localhost:8080/api/carts/${cartId}/product/${productId}`, {
                            method: 'POST',
                        });
                        alert('Producto agregado al carrito');
                    } catch (error) {
                        console.error('Error al agregar el producto al carrito:', error);
                    }
                } else {
                    alert('Por favor, selecciona un carrito primero.');
                }
            });
        });
    };

    // Función para renderizar los controles de paginación
    const renderPagination = (paginationData) => {
        const { hasPrevPage, hasNextPage, prevPage, nextPage, page, totalPages } = paginationData;
        let paginationHTML = "";

        if (hasPrevPage) {
            paginationHTML += `<button class="pagination-button" data-page="${prevPage}">Previous</button>`;
        }

        paginationHTML += `<span>Page ${page} of ${totalPages}</span>`;

        if (hasNextPage) {
            paginationHTML += `<button class="pagination-button" data-page="${nextPage}">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;

        document.querySelectorAll(".pagination-button").forEach((button) => {
            button.addEventListener("click", (event) => {
                const page = event.target.getAttribute("data-page");
                fetchProducts(page, limit);
            });
        });
    };

    // Maneja el cambio de límite
    limitSelector.addEventListener("change", (event) => {
        limit = event.target.value;
        fetchProducts(currentPage, limit);
    });

    // Mostrar productos del carrito en el modal
    showCartProductsButton.addEventListener('click', async () => {
        if (cartId) {
            try {
                const response = await fetch(`http://localhost:8080/api/carts/${cartId}`);
                const data = await response.json();
                const products = data.payload.products;

                cartProductsList.innerHTML = '';
                products.forEach(product => {
                    const li = document.createElement('li');
                    li.textContent = `ID: ${product.product._id}, Title: ${product.product.title}, Quantity: ${product.quantity}`;
                    cartProductsList.appendChild(li);
                });

                cartModal.style.display = 'block';
            } catch (error) {
                console.error('Error al obtener los productos del carrito:', error);
            }
        } else {
            alert('No se ha cargado ningún carrito.');
        }
    });

    // Cerrar el modal
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Cargar el ID del carrito y productos al iniciar
    await fetchCartId();
    fetchProducts(currentPage, limit);
});
