import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Cpu,
  Monitor,
  ShieldCheck,
  Database,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "../../theme.jsx";

const navItems = [
  { title: "Driver", path: "/driver-mastery", icon: Cpu, available: true },
  { title: "Monitor", path: "/monitor", icon: Monitor, available: false },
  {
    title: "Scoreboard",
    path: "/scoreboard",
    icon: ShieldCheck,
    available: false,
  },
  { title: "RAL", path: "/ral", icon: Database, available: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-900 bg-[#020817]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Elegant Brand Architecture */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                <Cpu size={18} className="animate-pulse" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                UVM
                <span className="text-violet-400 font-light ml-1">Academy</span>
              </span>
            </Link>

            {/* Desktop Navigation Links with Slidable Elastic Hover Pills */}
            <div className="hidden lg:flex items-center gap-2 relative">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return item.available ? (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    onMouseEnter={() => setHoveredTab(item.title)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={({ isActive }) =>
                      `relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors duration-300 rounded-xl z-10 ${
                        isActive
                          ? "text-violet-400"
                          : "text-slate-400 hover:text-slate-200"
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.title}</span>

                    {/* Shared Morphing Layer for Elastic Hover Trailing */}
                    {hoveredTab === item.title && (
                      <motion.div
                        layoutId="navHoverPill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 25,
                        }}
                        className="absolute inset-0 bg-slate-900/60 border border-slate-800/40 rounded-xl -z-10"
                      />
                    )}

                    {/* Bottom Indicator Dot for Active Routes */}
                    {isActive && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute -bottom-5.25 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-violet-400 rounded-full"
                      />
                    )}
                  </NavLink>
                ) : (
                  <div
                    key={item.title}
                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 cursor-not-allowed select-none relative group/lock"
                  >
                    <Icon size={16} />
                    <span>{item.title}</span>
                    <Lock
                      size={12}
                      className="opacity-0 group-hover/lock:opacity-100 transition-opacity duration-200 text-slate-500"
                    />
                  </div>
                );
              })}

              {/* Theme Toggle Button right after RAL */}
              <div className="ml-2 pl-3 border-l border-slate-800">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Actions (Theme toggle + Hamburger) */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern AnimatePresence Mobile Side-Drawer Drawer Expansion */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="fixed top-20 left-0 w-full bg-[#020817]/95 border-b border-slate-900 z-40 backdrop-blur-xl overflow-hidden shadow-2xl lg:hidden"
          >
            <div className="flex flex-col p-6 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return item.available ? (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                        : "bg-slate-900/30 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </NavLink>
                ) : (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900/50 text-slate-600 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Soon
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

