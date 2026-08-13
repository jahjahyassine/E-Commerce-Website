import type { DataProvider } from "@refinedev/core";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const dataProvider: DataProvider = {
    getList: async ({ resource }) => {
        const response = await fetch(`${BASE_URL}/${resource}`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        return {
            data: data,
            total: data.length,
        };
    },

    getOne: async ({ resource, id }) => {
        const response = await fetch(
            `${BASE_URL}/${resource}/${id}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch resource");
        }

        const data = await response.json();

        return {
            data: data,
        };
    },

    create: async ({ resource, variables }) => {
        const response = await fetch(
            `${BASE_URL}/${resource}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(variables),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create resource");
        }

        const data = await response.json();

        return {
            data: data,
        };
    },

    update: async ({ resource, id, variables }) => {
        const response = await fetch(
            `${BASE_URL}/${resource}/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(variables),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update resource");
        }

        const data = await response.json();

        return {
            data: data,
        };
    },

    deleteOne: async ({ resource, id }) => {
        const response = await fetch(
            `${BASE_URL}/${resource}/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete resource");
        }

        const data = await response.json();

        return {
            data: data,
        };
    },

    getApiUrl: () => BASE_URL,
};