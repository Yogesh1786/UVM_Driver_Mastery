import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, BookOpen, Terminal, Send, CheckCircle2 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative border-t border-slate-900 bg-[#020817] text-slate-400 selection:bg-violet-500/30">
      {/* Laser Gradient Accent Border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Atmospheric Ambient Depth Light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-violet-600/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        {/* FIXED: Changed to lg:grid-cols-4 so content spreads fully across the layout width */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 items-start mb-16">
          {/* Column 1: Brand & Form (Takes up 2 columns for premium layout balance) */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <Terminal size={18} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                UVM Academy
              </h2>
            </div>

            {/* FIXED: Increased max-w-md for better textual rendering */}
            <p className="text-sm leading-relaxed text-slate-400 max-w-md font-light">
              A modern, interactive learning environment engineered to master
              Universal Verification Methodology (UVM) from basic simulation
              environments to advanced testbenches.
            </p>

            {/* Newsletter Input Shell */}
            <div className="space-y-3 pt-2 max-w-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Stay updated on new modules
              </h4>

              <form
                onSubmit={handleSubscribe}
                className="relative flex items-center"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your system email"
                  value={email}
                  disabled={subscribed}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={subscribed}
                  className={`absolute right-1.5 p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    subscribed
                      ? "bg-emerald-500 text-white"
                      : "bg-violet-600 text-white hover:bg-violet-500"
                  }`}
                  aria-label="Subscribe"
                >
                  {subscribed ? <CheckCircle2 size={14} /> : <Send size={14} />}
                </button>
              </form>

              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-400 flex items-center gap-1 font-medium"
                >
                  System synced! You have been added to the registry logs.
                </motion.p>
              )}
            </div>
          </div>

          {/* Column 2: Modules Link List */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-300 mb-5">
              UVM Modules
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link
                  to="/driver-mastery"
                  className="group flex items-center gap-2 text-violet-400 font-medium hover:text-violet-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
                  <span className="underline decoration-transparent group-hover:decoration-violet-400/30 transition-all">
                    UVM Driver Mastery
                  </span>
                </Link>
              </li>
              {["Monitor", "Scoreboard", "RAL (Register Layer)"].map(
                (title) => (
                  <li
                    key={title}
                    className="text-slate-600 flex items-center justify-between group cursor-not-allowed select-none"
                  >
                    <span className="font-light text-slate-500">{title}</span>
                    <span className="text-[9px] bg-slate-900/80 text-slate-600 px-1.5 py-0.5 rounded border border-slate-800/60 font-semibold uppercase tracking-wider scale-95 opacity-80">
                      Soon
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Column 3: Global Resources Mapping */}
          <div className="lg:pl-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-300 mb-5">
              Resources
            </h3>
            <ul className="space-y-3.5 text-sm font-light">
              {[
                { label: "UVM Cheat Sheets", icon: BookOpen, href: "#docs" },
                { label: "Interview Questions", href: "#interviews" },
                { label: "Discussion Forum", href: "#community" },
              ].map((link, i) => {
                const Icon = link.icon;
                return (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="hover:text-violet-400 text-slate-400 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      {Icon && (
                        <Icon
                          size={14}
                          className="text-slate-500 group-hover:text-violet-400 transition-colors"
                        />
                      )}
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Platform Metadata Layer */}
        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-slate-500 font-light text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} Verification Academy. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#privacy"
                className="hover:text-slate-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="hover:text-slate-400 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* Platform Communication Channels */}
          <div className="flex items-center gap-2">
            {[
              {
                icon: Mail,
                href: "mailto:youremail@example.com",
                label: "Email Support",
              },
              {
                icon: FaGithub,
                href: "https://github.com/",
                label: "GitHub Organization",
              },
              {
                icon: FaLinkedin,
                href: "https://linkedin.com/",
                label: "LinkedIn Profile",
              },
            ].map((social, idx) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={idx}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-violet-400 bg-slate-900/30 border border-slate-800/40 hover:border-violet-500/20 rounded-xl transition-colors duration-200"
                  title={social.label}
                >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
