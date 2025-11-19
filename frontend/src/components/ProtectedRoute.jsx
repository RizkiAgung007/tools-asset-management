import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    // Check if there is any user data in session storage
    const isAuthenticated = sessionStorage.getItem("user_name");

    // If NOTHING, force-kick to Login page
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If EXISTS, allow entry to child route (Outlet)
    return <Outlet />;
}