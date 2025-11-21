import { LayoutDashboard, FolderTree, MapPin, Tag, Truck, Box } from "lucide-react";
import SidebarItem from "./SidebarItem";

export default function Sidebar({ isOpen }) {
  const userName = sessionStorage.getItem("user_name");
  const userRole = sessionStorage.getItem("user_role");

  // Menu List
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Assets", path:"/assets", icon: <Box size={20} /> },
    { name: "Category", path: "/categories", icon: <FolderTree size={20} /> },
    { name: "Location", path: "/locations", icon: <MapPin size={20} /> },
    { name: "Status", path: "/statuses", icon: <Tag size={20} /> },
    { name: "Supplier", path: "/suppliers", icon: <Truck size={20} /> }
  ];

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-20"} 
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
            transition-all duration-300 flex flex-col fixed h-full z-10 left-0 top-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="font-bold text-blue-600 text-xl flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            A
          </div>
          <span
            className={`transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            }`}
          >
            AssetApp
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.name}
            text={item.name}
            path={item.path}
            icon={item.icon}
            isOpen={isOpen}
          />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
            {userName?.charAt(0)}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-gray-700 dark:text-gray-200">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate uppercase">
                {userRole}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
