import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  MapPin,
  Tag,
  Truck,
  Box,
  FileText,
  Wrench,
  ClipboardCheck,
  Building2,
  Briefcase,
  User,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

export default function Sidebar({ isOpen }) {
  const userName = sessionStorage.getItem("user_name");
  const userRole = sessionStorage.getItem("user_role");

  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (menuName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Menu List
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Assets", path: "/assets", icon: <Box size={20} /> },
    { name: "Loans", path: "/loans", icon: <FileText size={20} /> },
    { name: "Category", path: "/categories", icon: <FolderTree size={20} /> },
    { name: "Location", path: "/locations", icon: <MapPin size={20} /> },
    { name: "Status", path: "/statuses", icon: <Tag size={20} /> },
    { name: "Supplier", path: "/suppliers", icon: <Truck size={20} /> },
    { name: "Maintenance", path: "/maintenances", icon: <Wrench size={20} /> },
    {
      name: "Stock Opname",
      path: "/audit",
      icon: <ClipboardCheck size={20} />,
    },
    {
      name: "User Management",
      icon: <Users size={20} />,
      isDropdown: true,
      subItems: [
        {
          name: "Departement",
          path: "/departements",
          icon: <Building2 size={18} />,
        },
        { name: "Unit", path: "/units", icon: <Briefcase size={18} /> },
        { name: "User", path: "/users", icon: <User size={18} /> },
      ],
    },
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
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.isDropdown) {
            const isDropdownOpen = openDropdowns[item.name];
            return (
              <div key={item.name} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleDropdown(item.name)}
                  title={!isOpen ? item.name : ""}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium transition-colors
                    ${
                      isDropdownOpen
                        ? "bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span
                      className={`transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
                    >
                      {item.name}
                    </span>
                  </div>
                  {isOpen &&
                    (isDropdownOpen ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    ))}
                </button>

                {isDropdownOpen && isOpen && (
                  <div className="pl-6 space-y-1 mt-1 border-l-2 border-gray-100 dark:border-gray-700 ml-4">
                    {item.subItems.map((subItem) => (
                      <SidebarItem
                        key={subItem.name}
                        text={subItem.name}
                        path={subItem.path}
                        icon={subItem.icon}
                        isOpen={isOpen}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <SidebarItem
              key={item.name}
              text={item.name}
              path={item.path}
              icon={item.icon}
              isOpen={isOpen}
            />
          );
        })}
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
