import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const CollapsibleCard = ({
  title,
  accent = "violet",
  defaultOpen = true,
  icon,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const accentMap = {
    violet: "border-l-violet-500",
    blue: "border-l-blue-400",
    emerald: "border-l-emerald-400",
    rose: "border-l-rose-400",
    amber: "border-l-amber-400",
  };

  return (
    <div
      className={`border border-slate-700/60 border-l-4 ${accentMap[accent]} rounded-xl bg-slate-900/60 backdrop-blur-sm overflow-hidden my-4`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className="flex items-center gap-2.5 text-slate-200 font-semibold text-sm">
          {icon && <span className="text-slate-400">{icon}</span>}
          {title}
        </span>

        {open ? (
          <FaChevronUp size={12} className="text-slate-500" />
        ) : (
          <FaChevronDown size={12} className="text-slate-500" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-slate-300 text-sm leading-relaxed space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleCard;