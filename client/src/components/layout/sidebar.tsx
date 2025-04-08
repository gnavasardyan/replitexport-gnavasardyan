import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Users, 
  BarChart3, 
  FolderClosed, 
  Settings, 
  Building2, 
  Key, 
  Cpu, 
  FileUp,
  UserCircle
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <li className="px-2">
      <a
        href={href}
        className={cn(
          "flex items-center px-4 py-3 rounded-lg font-medium transition duration-150",
          active
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
        onClick={(e) => {
          e.preventDefault();
          window.history.pushState(null, "", href);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
};

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="bg-white border-r border-gray-200 md:w-64 w-full md:sticky md:top-0 md:h-screen transition-all duration-300 z-30">
      <div className="flex flex-col h-full">
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-primary-600"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5 2H8.5C7.11929 2 6 3.11929 6 4.5V19.5C6 20.8807 7.11929 22 8.5 22H15.5C16.8807 22 18 20.8807 18 19.5V4.5C18 3.11929 16.8807 2 15.5 2Z"
                fill="currentColor"
              />
              <path
                d="M12 18C12.5523 18 13 17.5523 13 17C13 16.4477 12.5523 16 12 16C11.4477 16 11 16.4477 11 17C11 17.5523 11.4477 18 12 18Z"
                fill="white"
              />
            </svg>
            <span className="ml-2 text-lg font-semibold">Partner Hub</span>
          </div>
          <button className="md:hidden text-gray-500 focus:outline-none" id="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-4 flex-grow">
          <ul className="space-y-4">
            {/* Main Group */}
            <li>
              <div className="px-4 mb-1 text-xs font-semibold text-gray-500 uppercase">
                Управление Партнерами
              </div>
              <ul className="mt-1 space-y-1">
                <SidebarItem
                  icon={<Users className="w-5 h-5 mr-3" />}
                  label="Партнеры"
                  href="/partners"
                  active={isActive("/partners")}
                />
                <SidebarItem
                  icon={<Building2 className="w-5 h-5 mr-3" />}
                  label="Клиенты"
                  href="/clients"
                  active={isActive("/clients")}
                />
              </ul>
            </li>

            {/* Licensing Group */}
            <li>
              <div className="px-4 mb-1 text-xs font-semibold text-gray-500 uppercase">
                Лицензирование
              </div>
              <ul className="mt-1 space-y-1">
                <SidebarItem
                  icon={<Key className="w-5 h-5 mr-3" />}
                  label="Лицензии"
                  href="/licenses"
                  active={isActive("/licenses")}
                />
                <SidebarItem
                  icon={<Cpu className="w-5 h-5 mr-3" />}
                  label="Устройства"
                  href="/devices"
                  active={isActive("/devices")}
                />
                <SidebarItem
                  icon={<FileUp className="w-5 h-5 mr-3" />}
                  label="Обновления"
                  href="/updates"
                  active={isActive("/updates")}
                />
              </ul>
            </li>

            {/* Admin Group */}
            <li>
              <div className="px-4 mb-1 text-xs font-semibold text-gray-500 uppercase">
                Администрирование
              </div>
              <ul className="mt-1 space-y-1">
                <SidebarItem
                  icon={<UserCircle className="w-5 h-5 mr-3" />}
                  label="Пользователи"
                  href="/users"
                  active={isActive("/users")}
                />
                <SidebarItem
                  icon={<BarChart3 className="w-5 h-5 mr-3" />}
                  label="Аналитика"
                  href="/analytics"
                  active={isActive("/analytics")}
                />
                <SidebarItem
                  icon={<FolderClosed className="w-5 h-5 mr-3" />}
                  label="Отчеты"
                  href="/reports"
                  active={isActive("/reports")}
                />
                <SidebarItem
                  icon={<Settings className="w-5 h-5 mr-3" />}
                  label="Настройки"
                  href="/settings"
                  active={isActive("/settings")}
                />
              </ul>
            </li>
          </ul>
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
