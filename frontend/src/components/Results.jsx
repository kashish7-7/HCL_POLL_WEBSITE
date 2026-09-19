import React from 'react';

export const Results = ({ results }) => {
  if (!results || !results.options) return null;

  const totalVotes = results.total_votes || 0;

  return (
    <div className="space-y-4 font-sans">
      {results.options.map((opt) => {
        const percentage = opt.percentage || 0;
        const votes = opt.votes || 0;

        return (
          <div key={opt.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm font-medium text-slate-800">
              <span className="font-semibold text-slate-900">{opt.text}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                <span className="font-bold text-indigo-600 font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <span>Total Votes Recorded: <strong className="text-slate-800">{totalVotes}</strong></span>
        <span className="text-emerald-600 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Results update automatically
        </span>
      </div>
    </div>
  );
};
