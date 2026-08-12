const getCurrentUser = async () => {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${BASE_URL}/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (response.status === 401) {
        localStorage.removeItem("access_token");
        throw new Error("Session expired");
    }

    if (!response.ok) {
        throw new Error(data.detail || "Failed to retrieve user");
    }

    return data;
};


export default getCurrentUser;