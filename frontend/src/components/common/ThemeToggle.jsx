import  { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem("theme") === "dark";
        if (isDark) document.documentElement.classList.add("dark");
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");

        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

  return (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-500 dark:text-yellow-400 transition-colors"
        title="Change Theme"
    >
        { darkMode ? <Sun size={20} /> : <Moon size={20} /> }
    </button>
  )
}
