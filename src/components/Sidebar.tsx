import { NavLink } from "react-router-dom";
import { LayoutDashboard, BrainCircuit, ListTodo, LucideIcon } from "lucide-react";
import { ShowUpLogo } from "../assets";

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const Sidebar: React.FC = () => {
  const navItems: NavItem[] = [
    {
      name: "Painel",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Predição",
      path: "/prediction",
      icon: BrainCircuit,
    },
    {
      name: "Consultas",
      path: "/appointments",
      icon: ListTodo,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <img
            src={ShowUpLogo}
            alt="Show-Up Logo"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">
              Show-Up
            </h1>
            <p className="text-xs text-slate-500">Preditor IA de Ausências</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-brand-gradient text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="px-4 py-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-600 font-medium">
            Plataforma HealthTech
          </p>
          <p className="text-xs text-slate-400 mt-1">v1.0.0 - 2026</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
