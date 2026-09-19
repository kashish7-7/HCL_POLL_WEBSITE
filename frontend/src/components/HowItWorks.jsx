import React from 'react';
import { Pencil, Paintbrush, Share2 } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Title matching Image 2 */}
        <h2 className="text-3xl sm:text-4xl font-normal text-center text-slate-800 mb-12 font-sans">
          How to Make a Poll
        </h2>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 Card */}
          <div className="bg-white border border-slate-200/90 rounded-none p-6 relative flex flex-col justify-between shadow-xs">
            <div className="relative">
              {/* Top-left gray badge */}
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-slate-300 text-white font-bold text-sm flex items-center justify-center font-mono">
                1
              </div>

              {/* Blue Icon */}
              <div className="flex justify-center my-4 text-blue-500">
                <Pencil className="w-9 h-9" />
              </div>

              <p className="text-sm leading-relaxed text-slate-700 text-left font-sans">
                <strong className="text-slate-900 font-bold">Type your question</strong> then add answers. Hit 'Create Poll', the next steps are optional. Want a poll with multiple questions? <span className="underline cursor-pointer text-slate-800">try our free survey maker.</span>
              </p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="bg-white border border-slate-200/90 rounded-none p-6 relative flex flex-col justify-between shadow-xs">
            <div className="relative">
              {/* Top-left gray badge */}
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-slate-300 text-white font-bold text-sm flex items-center justify-center font-mono">
                2
              </div>

              {/* Blue Icon */}
              <div className="flex justify-center my-4 text-blue-500">
                <Paintbrush className="w-9 h-9" />
              </div>

              <p className="text-sm leading-relaxed text-slate-700 text-left font-sans">
                <strong className="text-slate-900 font-bold">Hit 'Theme'</strong> and select a style or create your own. Hit 'Settings' and set options like allowing multiple votes, multiple answers and more.
              </p>
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="bg-white border border-slate-200/90 rounded-none p-6 relative flex flex-col justify-between shadow-xs">
            <div className="relative">
              {/* Top-left gray badge */}
              <div className="absolute -top-3 -left-3 w-7 h-7 bg-slate-300 text-white font-bold text-sm flex items-center justify-center font-mono">
                3
              </div>

              {/* Blue Icon */}
              <div className="flex justify-center my-4 text-blue-500">
                <Share2 className="w-9 h-9" />
              </div>

              <p className="text-sm leading-relaxed text-slate-700 text-left font-sans">
                <strong className="text-slate-900 font-bold">Click Share</strong> and copy your poll url. You can also hit Embed to place the poll on your website or blog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
