import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ModuleSidebar = ({ moduleNumber, title, sections }) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto py-8 px-4 border-r border-slate-800/60">
      <Link
        to="/"
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-violet-400 transition-colors mb-6"
      >
        <FaArrowLeft size={10} />
        Back to Home
      </Link>

      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
        Module {moduleNumber}
      </div>

      <p className="text-xs font-semibold text-slate-300 mb-4 leading-snug">
        {title}
      </p>

      <nav className="space-y-0.5">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block text-xs text-slate-400 hover:text-violet-400 hover:bg-violet-500/5 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            {section.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default ModuleSidebar;
