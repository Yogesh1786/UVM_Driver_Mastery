import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowUp, BookOpen, Terminal, Send } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="relative mt-28 border-t border-slate-800/80 bg-[#020817] text-slate-400 selection:bg-violet-500/30">
      {/* Top Gradient Glow Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Radial background glow for a subtle depth effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Main Content Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-violet-600/10 rounded-xl border border-violet-500/20 text-violet-400">
                <Terminal size={22} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                UVM Academy
              </h2>
            </div>

            <p className="text-sm leading-6 text-slate-400 max-w-sm">
              A modern, interactive learning environment engineered to master
              Universal Verification Methodology (UVM) from basic simulation
              environments to advanced testbenches.
            </p>

            {/* Newsletter Subscription */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Stay Updated on New Modules
              </h4>
              <form
                onSubmit={handleSubscribe}
                className="flex max-w-sm items-center relative"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                  aria-label="Subscribe"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-5">
              Platform
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  Home Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/driver"
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  Driver Course
                </Link>
              </li>
              <li>
                <Link
                  to="/tracks"
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  Learning Tracks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Syllabus / Modules */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-5">
              UVM Modules
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/driver"
                  className="flex items-center gap-1.5 text-violet-400 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  UVM Driver Mastery
                </Link>
              </li>
              <li className="text-slate-500 flex items-center gap-2 cursor-not-allowed">
                Monitor{" "}
                <span className="text-[10px] bg-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                  Soon
                </span>
              </li>
              <li className="text-slate-500 flex items-center gap-2 cursor-not-allowed">
                Scoreboard{" "}
                <span className="text-[10px] bg-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                  Soon
                </span>
              </li>
              <li className="text-slate-500 flex items-center gap-2 cursor-not-allowed">
                RAL (Register Layer){" "}
                <span className="text-[10px] bg-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                  Soon
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Student Resources & Community */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-5">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#docs"
                  className="hover:text-violet-400 transition-colors duration-200 flex items-center gap-2"
                >
                  <BookOpen size={14} /> UVM Cheat Sheets
                </a>
              </li>
              <li>
                <a
                  href="#interviews"
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  Interview Questions
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="hover:text-violet-400 transition-colors duration-200"
                >
                  Discussion Forum
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider line before bottom metadata */}
        <div className="mt-16 border-t border-slate-800/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright & Core Social Handles */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-slate-500 text-center sm:text-left">
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

          {/* Social Icons & Back to Top Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4 mr-2">
              <a
                href="mailto:youremail@example.com"
                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded-xl transition"
                title="Email Support"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded-xl transition"
                title="GitHub Organization"
              >
                <FaGithub size={18} />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded-xl transition"
                title="LinkedIn Profile"
              >
                <FaLinkedin size={18} />
              </a>
            </div>

            <button
              onClick={scrollTop}
              className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-2.5 text-xs font-medium text-slate-300 backdrop-blur-sm hover:border-violet-500/50 hover:text-violet-400 transition-all duration-300"
            >
              Back to Top
              <ArrowUp
                size={14}
                className="group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
