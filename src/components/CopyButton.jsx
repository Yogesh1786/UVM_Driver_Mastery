import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className="flex cursor-pointer items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-slate-600 bg-slate-700/60 text-slate-300 hover:bg-slate-600 transition-colors"
    >
      {copied ? (
        <FaCheck size={10} className="text-emerald-400" />
      ) : (
        <FaCopy size={10} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default CopyButton;
