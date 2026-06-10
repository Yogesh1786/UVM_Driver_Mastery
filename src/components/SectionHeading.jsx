const SectionHeading = ({ num, title }) => (
  <div className="flex items-center gap-3 mt-12 mb-5">
    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-md">
      §{num}
    </span>

    <h2 className="text-xl font-bold text-slate-100">{title}</h2>

    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
  </div>
);

export default SectionHeading;
