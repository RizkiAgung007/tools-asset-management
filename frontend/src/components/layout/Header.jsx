import { Menu } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import LogoutButton from "../common/LogoutButton";

export default function Header({ sidebarOpen, setSidebarOpen }) {
    return (
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-300">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center gap-4">
                <ThemeToggle /> 
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div> 
                <LogoutButton /> 
            </div>
        </header>
    );
}