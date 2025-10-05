export async function getProducts() {
  return {
    data: [
      { product_id: 1, product_name: "Sản phẩm A", price: 10000 },
      { product_id: 2, product_name: "Sản phẩm B", price: 20000 },
      { product_id: 3, product_name: "Sản phẩm C", price: 30000 }
    ]
  };
}

export async function deleteProduct(id) {
  console.log("Xóa sản phẩm", id);
  return true;
}
