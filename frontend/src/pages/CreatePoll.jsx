import React, { useState } from 'react';
import { api } from '../utils/api';
import { soundFx } from '../utils/sound';
import { PenTool, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

export const CreatePoll = ({ onCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [expirationMinutes, setExpirationMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, `Option ${options.length + 1}`]);
      soundFx.playMechanicalClick();
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      soundFx.playMechanicalClick();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation
    if (!title.trim()) {
      setError('Title is mandatory for publication');
      setLoading(false);
      return;
    }

    const cleanOptions = options.map(o => o.trim()).filter(o => o.length > 0);
    if (cleanOptions.length < 2) {
      setError('A minimum of 2 distinct options is required');
      setLoading(false);
      return;
    }

    try {
      soundFx.playMechanicalClick();
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        options: cleanOptions,
        expiration_minutes: expirationMinutes > 0 ? parseInt(expirationMinutes, 10) : null,
      };

      const res = await api.createPoll(payload);
      soundFx.playFanfare();
      if (onCreated) {
        onCreated(res.poll.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="newspaper-container border-2 border-[#2c251e] p-6 sm:p-8">
        <div className="border-b-4 border-double border-[#2c251e] pb-4 mb-6 text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#8b5e34] font-bold">
            ★ EDITOR'S PRESS ROOM ★
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase text-[#1f1b18] mt-1">
            PUBLISH A NEW POLL DISPATCH
          </h2>
          <p className="font-serif italic text-xs text-[#4a423a] mt-1">
            Draft your question below. Once published, your share link will broadcast live to all readers.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-100 border-l-4 border-red-800 text-red-900 font-serif text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-serif">
          {/* Poll Title */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1">
              Poll Headline / Question <span className="text-amber-800">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Which programming language will dominate the next decade?"
              className="w-full p-3 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] focus:bg-[#f6ebd6] focus:outline-none font-serif text-base"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1">
              Context / Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add background context for your readers..."
              rows={3}
              className="w-full p-3 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] focus:bg-[#f6ebd6] focus:outline-none font-serif text-sm"
              maxLength={1000}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1">
              Gazette Category Section
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border-2 border-[#2c251e] bg-[#eedfc5] font-serif text-xs font-bold uppercase cursor-pointer"
            >
              <option value="General">General Dispatch</option>
              <option value="Technology">Technology & Engineering</option>
              <option value="Politics">Politics & Governance</option>
              <option value="Culture">Culture & Arts</option>
              <option value="Philosophy">Philosophy & Ethics</option>
            </select>
          </div>

          {/* Options */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase text-[#1f1b18]">
                Poll Options (Minimum 2, Maximum 10) <span className="text-amber-800">*</span>
              </label>
              <span className="text-xs text-[#4a423a]">{options.length} / 10 Options</span>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#8b5e34] w-6">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 p-2.5 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] text-sm focus:outline-none"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-2 border border-red-800 text-red-900 bg-red-100 hover:bg-red-200 cursor-pointer"
                      title="Remove Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-[#2c251e] bg-[#eedfc5] hover:bg-[#e2d0b0] text-xs font-bold uppercase cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Another Option
              </button>
            )}
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#1f1b18] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
              Optional Poll Expiration (Minutes)
            </label>
            <input
              type="number"
              value={expirationMinutes}
              onChange={(e) => setExpirationMinutes(e.target.value)}
              placeholder="0 for unlimited duration"
              min="0"
              max="10080"
              className="w-full p-2.5 border-2 border-[#2c251e] bg-[#fdf8ee] text-[#1f1b18] text-sm"
            />
            <p className="text-[11px] italic text-[#4a423a] mt-1">
              Leave at 0 for an open-ended poll that remains active indefinitely.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t-2 border-[#2c251e] flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 border-2 border-[#2c251e] bg-[#1f1b18] text-[#f6ebd6] uppercase font-bold text-sm hover:bg-[#3d342c] cursor-pointer transition flex justify-center items-center gap-2"
            >
              <PenTool className="w-4 h-4 text-amber-500" />
              {loading ? 'Publishing to Gazette...' : 'Publish Poll Dispatch'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-5 border-2 border-[#2c251e] bg-[#eedfc5] hover:bg-[#e4d4b8] uppercase font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
