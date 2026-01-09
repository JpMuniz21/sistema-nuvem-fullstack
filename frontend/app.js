const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductPrice = document.querySelector('#update-price');

// Helper to parse responses that might be JSON or plain text
async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (err) {
      console.warn('Failed to parse JSON response, falling back to text:', err);
    }
  }

  try {
    return await response.text();
  } catch (err) {
    console.error('Failed to read response as text:', err);
    return null;
  }
}

// Function to fetch all products from the server
async function fetchProducts() {
  const response = await fetch('http://3.238.238.180:3000/products');
  const products = await response.json();

  // Clear product list
  productList.innerHTML = '';

  // Add each product to the list
  products.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `${product.name} - $${product.price}`;

    // Add delete button for each product
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts();
    });
    li.appendChild(deleteButton);

    // Add update button for each product
    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Update';
    updateButton.addEventListener('click', () => {
      updateProductId.value = product.id;
      updateProductName.value = product.name;
      updateProductPrice.value = product.price;
      // show the update form so the user can submit changes
      if (updateProductForm) updateProductForm.style.display = 'block';
    });
    li.appendChild(updateButton);

    productList.appendChild(li);
  });
}


// Event listener for Add Product form submit button
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value;
  const price = addProductForm.elements['price'].value;
  await addProduct(name, price);
  addProductForm.reset();
  await fetchProducts();
});

// Function to add a new product
async function addProduct(name, price) {
  const response = await fetch('http://3.238.238.180:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, price })
  });
  return parseResponse(response);
}

// Function to delete a new product
async function deleteProduct(id) {
  const response = await fetch('http://3.238.238.180:3000/products/' + id, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    //body: JSON.stringify({id})
  });
  return parseResponse(response);
}

// Function to update an existing product with better error handling and fallback
async function updateProduct(id, name, price) {
  const url = 'http://3.238.238.180:3000/products/' + id;
  // ensure price is a number (server may validate type)
  const payload = { name, price: Number(price) };

  console.debug('Updating product', id, payload);

  // Try PUT first
  let response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // If PUT worked, parse and return
  if (response.ok) {
    console.debug('PUT succeeded', response.status);
    return parseResponse(response);
  }

  // read response body for diagnostics
  let bodyText;
  try { bodyText = await response.text(); } catch (e) { bodyText = '<could not read body>'; }
  console.warn(`PUT failed ${response.status} ${response.statusText}:`, bodyText);

  // Try a PATCH fallback in case the API expects PATCH instead of PUT
  try {
    console.debug('Trying PATCH fallback');
    response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.debug('PATCH succeeded', response.status);
      return parseResponse(response);
    }

    // read response body for diagnostics
    let patchText;
    try { patchText = await response.text(); } catch (e) { patchText = '<could not read body>'; }
    console.error(`PATCH failed ${response.status} ${response.statusText}:`, patchText);
    throw new Error(`Update failed. PUT returned ${response.status} and PATCH returned ${response.status}. See console for details.`);
  } catch (err) {
    // rethrow so caller can show an error
    throw err;
  }
}

// Handle update form submission
if (updateProductForm) {
  updateProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = updateProductId.value;
    const name = updateProductName.value;
    const price = updateProductPrice.value;
    if (!id) return;

    try {
      // validate price is a number
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice)) {
        throw new Error('Preço inválido — use apenas números.');
      }

      await updateProduct(id, name, numericPrice);
      // hide and reset the form after successful update
      updateProductForm.reset();
      updateProductForm.style.display = 'none';
      await fetchProducts();
    } catch (err) {
      console.error('Failed to update product', err);
      // show a helpful error from the update function if available
      alert('Erro ao atualizar o produto: ' + (err && err.message ? err.message : 'verifique o console'));
    }
  });

  // Cancel button - hide the update form and reset
  const cancelUpdateBtn = document.querySelector('#cancel-update');
  if (cancelUpdateBtn) {
    cancelUpdateBtn.addEventListener('click', () => {
      updateProductForm.reset();
      updateProductForm.style.display = 'none';
    });
  }
}

// Fetch all products on page load
fetchProducts();
