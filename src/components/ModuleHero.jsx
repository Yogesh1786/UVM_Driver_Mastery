import { motion } from "framer-motion";

const ModuleHero = ({ moduleNumber, title, description, metadata = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="rounded-2xl bg-gradient-to-br from-violet-600/10 via-slate-900/60 to-indigo-600/10 border border-slate-700/60 p-8 mb-10"
    >
      <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        Module {moduleNumber}
      </span>

      <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400">
        {title}
      </h1>

      <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-xl">
        {description}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
        {metadata.map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col gap-0.5 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/40"
          >
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {k}
            </span>

            <span className="text-slate-200 font-mono">{v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ModuleHero;
