import { Refine } from "@refinedev/core";
import { Routes, Route } from "react-router-dom";
import { ProductShow } from "./resources/pages/products/ProductShow";
import { ProductList } from "./resources/pages/products/ProductList";
import { dataProvider } from "./resources/providers/dataProvider";
import { ProductCreate } from "./resources/pages/products/ProductCreate";
import AdminProfile from "./resources/pages/Profile/AdminProfile";
import { CategoryList } from "./resources/pages/categories/CategoryList";
import { CategoryShow } from "./resources/pages/categories/CategoryShow";
import { BrandList } from "./resources/pages/brands/BrandList";
import { BrandShow } from "./resources/pages/brands/BrandShow";
import { InventoryList } from "./resources/pages/inventory products/InventoryList";
import { ProductVariantShow } from "./resources/pages/inventory products/ProductShow";

function AdminApp() {
    return (
        <Refine
            dataProvider={dataProvider}
            resources={[
                {
                    name: "products",
                    list: "/admin/products",
                    create: "/admin/products/create",
                    edit: "/admin/products/edit/:id",
                    show: "/admin/products/show/:id",
                },
                {
                    name: "categories",
                    list: "/admin/categories",
                    create: "/admin/categories/create",
                    edit: "/admin/categories/edit/:id",
                },
                {
                    name: "brands",
                    list: "/admin/brands",
                    create: "/admin/brands/create",
                    edit: "/admin/brands/edit/:id",
                },
                {
                    name: "orders",
                    list: "/admin/orders",
                    show: "/admin/orders/show/:id",
                },
                {
                    name: "users",
                    list: "/admin/users",
                    show: "/admin/users/show/:id",
                },
                {
                    name: "inventory",
                    list: "/admin/inventory",
                },
            ]}
        >
            <Routes>
                <Route path="products" element={<ProductList />} />
                <Route path="products/:id" element={<ProductShow />} />
                <Route path="products/create" element={<ProductCreate />} />


                <Route path="categories" element={<CategoryList />} />
                <Route path="categories/:id" element={<CategoryShow />} />


                <Route path="brands" element={<BrandList />} />
                <Route path="brands/:id" element={<BrandShow />} />


                <Route path="inventory" element={<InventoryList />} />
                <Route path="products/:id/variants/:variantId" element={<ProductVariantShow />} />

                <Route index element={<AdminProfile />} />
            </Routes>
        </Refine>
    );
}

export default AdminApp;