const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-700/60 my-3">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-800/80">
          {headers.map((h, i) => (
            <th
              key={i}
              className="text-left px-4 py-2.5 text-slate-300 font-semibold text-xs uppercase tracking-wide border-b border-slate-700/60"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className={i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"}
          >
            {row.map((cell, j) => (
              <td
                key={j}
                className="px-4 py-2.5 text-slate-300 border-b border-slate-700/30 text-xs font-mono"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
