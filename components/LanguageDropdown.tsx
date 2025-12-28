
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const LanguageDropdown: React.FC<Props> = ({ value, onChange, label }) => {
  return (
    <div className="relative w-full group">
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 px-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-indigo-500">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageDropdown;
