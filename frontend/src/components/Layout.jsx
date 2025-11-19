import { useState } from "react";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
            
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} />

            {/* Wrapper Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                
                {/* Header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Page Render Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}