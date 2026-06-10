import CopyButton from "../common/CopyButton";
const CodeBlock = ({ lang = "systemverilog", children }) => (
  <div className="my-4 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg">
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60">
      <span className="text-xs font-mono text-slate-400">{lang}</span>
      <CopyButton code={children} />
    </div>

    <pre className="overflow-x-auto p-4 bg-slate-900/80 text-slate-200 text-[13px] leading-relaxed font-mono whitespace-pre">
      {children}
    </pre>
  </div>
);

export default CodeBlock;
