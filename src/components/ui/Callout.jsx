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
};

const Callout = ({ type = "hook", children }) => {
  const style = variants[type];

  return (
    <div
      className={`rounded-lg px-4 py-2.5 border text-sm ${style.bg} ${style.border} ${style.text}`}
    >
      {children}
    </div>
  );
};

export default Callout;
