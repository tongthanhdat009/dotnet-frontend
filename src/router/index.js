import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Customers from "../views/Customers.vue";
import Orders from "../views/Orders.vue";
import Products from "../views/Products.vue";
import Users from "../views/Users.vue";
import Categories from "../views/Categories.vue";  
import Suppliers from "../views/Suppliers.vue";
import Inventory from "../views/Inventory.vue";
import Promotions from "../views/Promotions.vue";
import OrderItems from "../views/Order_items.vue";
import Payments from "../views/Payments.vue";
import RolePermission from "../views/RolePermission.vue";
const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/customers", component: Customers },
  { path: "/orders", component: Orders },
  {path: "/products",component:Products},
  {path:"/users",component:Users},
  {path:"/categories",component:Categories},
  {path:"/suppliers",component:Suppliers},
  {path:"/inventory",component:Inventory},
  {path:"/promotions",component:Promotions},
  {path:"/order-items",component:OrderItems},
  {path:"/payments",component:Payments},
  {path:"/role-permission",component:RolePermission}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
