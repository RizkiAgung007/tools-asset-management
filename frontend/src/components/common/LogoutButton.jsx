import { LogOut } from "lucide-react";
import api from "../../lib/axios"; 

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            console.log("Button logout diklik.");
            await api.post("/api/logout").catch(err => {
                console.warn("Server logout error (diabaikan):", err.response?.status);
            });
            
        } finally {
            sessionStorage.clear(); 
            localStorage.clear(); 
            window.location.href = "/";
        }
    };

    return (
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
        >
            <LogOut size={18} />
            <span>Logout</span>
        </button>
    );
}