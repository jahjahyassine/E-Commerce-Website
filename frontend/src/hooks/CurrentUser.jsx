const getCurrentUser = async (token) => {
    const BASE_URL = import.meta.env.VITE_BASE_URL
    const response = await fetch(
        `${BASE_URL}/me`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    )

    const data = response.json()

    if (!response.ok) throw new Error(data.detail || "Failed to retrieve user")

    return data.user
}


export default getCurrentUser;