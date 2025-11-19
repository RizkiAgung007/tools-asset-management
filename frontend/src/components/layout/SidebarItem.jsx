import { useLocation, useNavigate } from "react-router-dom";

export default function SidebarItem({ icon, text, path, isOpen }) {
    
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === path;

    return (
        <button
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                ${isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-medium" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}
            `}
        >
            <div>{icon}</div>
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                {text}
            </span>
        </button>
    );
}