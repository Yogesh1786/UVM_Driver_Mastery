import { Link } from "react-router-dom";

const ModuleNavigation = ({ nextPath, nextTitle }) => {
  return (
    <div className="mt-16 flex items-center justify-between border-t border-slate-800/60 pt-8">
      <Link
        to={nextPath}
        className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 hover:border-violet-500/50 px-4 py-2 rounded-xl transition-all"
      >
        {nextTitle}
      </Link>
    </div>
  );
};

export default ModuleNavigation;
