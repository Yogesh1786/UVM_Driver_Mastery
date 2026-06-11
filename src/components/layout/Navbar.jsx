import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Cpu, Monitor, ShieldCheck, Database } from "lucide-react";

const navItems = [
  {
    title: "Driver",
    path: "/driver",
    icon: Cpu,
    available: true,
  },
  {
    title: "Monitor",
    path: "/monitor",
    icon: Monitor,
    available: false,
  },
  {
    title: "Scoreboard",
    path: "/scoreboard",
    icon: ShieldCheck,
    available: false,
  },
  {
    title: "RAL",
    path: "/ral",
    icon: Database,
    available: false,
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-[#020817]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}

            <Link
              to="/"
              className="text-2xl font-bold text-white tracking-wide"
            >
              UVM Academy
            </Link>

            {/* Desktop */}

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;

                return item.available ? (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 transition ${
                        isActive
                          ? "text-violet-400"
                          : "text-slate-300 hover:text-violet-400"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.title}
                  </NavLink>
                ) : (
                  <div
                    key={item.title}
                    className="flex items-center gap-2 text-slate-600 cursor-not-allowed"
                  >
                    <Icon size={18} />
                    {item.title}
                  </div>
                );
              })}
            </div>

            {/* Mobile Button */}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}

      <div
        className={`fixed top-20 left-0 w-full bg-[#020817] border-t border-slate-800 z-40 transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-6 gap-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return item.available ? (
              <NavLink
                key={item.title}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-white hover:text-violet-400"
              >
                <Icon size={20} />
                {item.title}
              </NavLink>
            ) : (
              <div
                key={item.title}
                className="flex items-center justify-between text-slate-500"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  {item.title}
                </div>

                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                  Soon
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
