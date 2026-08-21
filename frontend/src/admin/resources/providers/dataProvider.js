const BASE_URL = import.meta.env.VITE_BASE_URL;

export const dataProvider = {
    getList: async ({ resource, filters, pagination, sorters }) => {
        const token = localStorage.getItem("access_token");
        const params = new URLSearchParams();

        filters?.forEach((filter) => {
            if ("field" in filter && "value" in filter) {
                if (
                    filter.value !== undefined &&
                    filter.value !== null &&
                    filter.value !== ""
                ) {
                    params.append(
                        filter.field,
                        String(filter.value)
                    );
                }
            }
        });

        if (pagination) {
            const current = pagination.current ?? 1;
            const pageSize = pagination.pageSize ?? 20;

            params.append("page", String(current));
            params.append("page_size", String(pageSize));
        }

        const queryString = params.toString();

        const url = queryString
            ? `${BASE_URL}/admin/${resource}?${queryString}`
            : `${BASE_URL}/admin/${resource}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch resource");
        }

        const result = await response.json();

        return {
            data: result.data ?? result,
            total: result.total ?? result.length,
        };
    },

    getOne: async ({ resource, id }) => {
        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            `${BASE_URL}/admin/${resource}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch resource"
            );
        }

        const data = await response.json();

        return {
            data,
        };
    },

    create: async ({ resource, variables }) => {
        const token = localStorage.getItem("access_token");

        const isMultipart = variables instanceof FormData;

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const options = {
            method: "POST",
            headers,
        };

        if (isMultipart) {
            options.body = variables;
        } else {
            headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(variables);
        }

        const response = await fetch(
            `${BASE_URL}/admin/${resource}`,
            options
        );

        if (!response.ok) {
            const errorBody = await response.text();

            throw new Error(
                `Create failed (${response.status}): ${errorBody}`
            );
        }

        const data = await response.json();

        return {
            data,
        };
    },

    update: async ({
        resource,
        id,
        variables,
    }) => {
        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            `${BASE_URL}/admin/${resource}/${id}`,
            {
                method: "PATCH",

                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(variables),
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to update resource"
            );
        }

        const data = await response.json();

        return {
            data,
        };
    },

    deleteOne: async ({
        resource,
        id,
    }) => {
        const token =
            localStorage.getItem("access_token");

        const response = await fetch(
            `${BASE_URL}/admin/${resource}/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to delete resource"
            );
        }

        const data = await response.json();

        return {
            data,
        };
    },


    deleteMany: async ({ resource, ids }) => {
        const token = localStorage.getItem("access_token");

        const responses = await Promise.all(
            ids.map((id) =>
                fetch(`${BASE_URL}/admin/${resource}/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            )
        );

        const failed = responses.find(
            (response) => !response.ok
        );

        if (failed) {
            throw new Error("Failed to delete some resources");
        }

        const data = await Promise.all(
            responses.map((response) => response.json())
        );

        return {
            data,
        };
    },

    getApiUrl: () => BASE_URL,
};