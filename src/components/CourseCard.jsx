import { Link } from "react-router-dom";

export default function CourseCard({
  title,
  description,
  icon: Icon,
  path,
  available,
}) {
  if (!available) {
    return (
      <div className="group rounded-3xl border border-slate-800 bg-[#081323] p-8 opacity-60 cursor-not-allowed">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-violet-400" />
        </div>

        <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>

        <p className="mt-3 text-slate-400">{description}</p>

        <span className="inline-block mt-6 px-4 py-2 rounded-full bg-slate-700 text-sm text-slate-300">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <Link to={path}>
      <div className="group rounded-3xl border border-slate-800 bg-[#081323] p-8 transition duration-300 hover:-translate-y-2 hover:border-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.35)]">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-violet-400" />
        </div>

        <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>

        <p className="mt-3 text-slate-400">{description}</p>

        <button className="mt-8 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500">
          Start Learning →
        </button>
      </div>
    </Link>
  );
}
