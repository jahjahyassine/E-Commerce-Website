import { Refine } from "@refinedev/core";

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
            {/* routes/components */}
        </Refine>
    );
}

export default AdminApp;