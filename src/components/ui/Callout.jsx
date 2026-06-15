const variants = {
  hook: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    text: "text-violet-300",
  },

  concept: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    text: "text-blue-300",
  },

  trap: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    text: "text-rose-300",
  },

  interview: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-300",
  },

  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-300",
  },

  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-300",
  },

  danger: {
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    text: "text-red-300",
  },

  info: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    text: "text-cyan-300",
  },
};

const Callout = ({ type = "hook", children, className = "" }) => {
  const style = variants[type] || variants.concept;

  return (
    <div
      className={`rounded-lg px-4 py-2.5 border text-sm ${style.bg} ${style.border} ${style.text} ${className}`}
    >
      {children}
    </div>
  );
};

export default Callout;
