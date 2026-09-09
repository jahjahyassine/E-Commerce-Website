import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../hooks/CurrentUser";

function AdminRoute({ children }) {
    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    if (isLoading) {
        return null;
    }

    if (isError || !currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;