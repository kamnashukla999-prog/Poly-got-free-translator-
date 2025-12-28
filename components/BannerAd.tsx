
import React, { useState, useEffect } from 'react';

interface BannerAdProps {
  type?: 'leaderboard' | 'mobile' | 'rectangle';
  className?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ type = 'leaderboard', className = '' }) => {
  const [adIndex, setAdIndex] = useState(0);

  const ads = [
    {
      title: "Get Gemini Advanced",
      desc: "Unlock the full power of AI with Gemini Pro and Flash.",
      cta: "Try Now",
      color: "from-indigo-600 to-violet-700"
    },
    {
      title: "Fastest VPN 2025",
      desc: "Protect your data globally with military grade encryption.",
      cta: "Get Offer",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Learn Hindi in 30 Days",
      desc: "Join 5M+ students learning Hindi with our daily AI lessons.",
      cta: "Sign Up",
      color: "from-orange-500 to-amber-600"
    }
  ];

  useEffect(() => {
    setAdIndex(Math.floor(Math.random() * ads.length));
  }, []);

  const currentAd = ads[adIndex];

  const baseStyles = "relative overflow-hidden rounded-[1.5rem] flex items-center justify-between shadow-xl transition-all hover:scale-[1.01] cursor-pointer group";
  
  const sizeStyles = {
    leaderboard: "w-full min-h-[90px] px-8 py-4",
    mobile: "w-full min-h-[60px] py-3 px-5",
    rectangle: "w-full h-full min-h-[250px] flex-col justify-center gap-4 text-center"
  };

  return (
    <div className={`${className} w-full`}>
      <div className="flex justify-between items-center mb-1.5 px-2">
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded uppercase">AD</span>
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sponsored</span>
        </div>
        <button className="text-[9px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-tighter">Report</button>
      </div>
      
      <div className={`${baseStyles} ${sizeStyles[type]} bg-gradient-to-r ${currentAd.color} text-white`}>
        {/* Animated Background effects */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-1000"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-1 items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <h4 className="font-black text-sm md:text-base leading-tight uppercase tracking-tight">{currentAd.title}</h4>
            <p className="text-white/80 text-[11px] md:text-xs line-clamp-1 font-medium">{currentAd.desc}</p>
          </div>
        </div>

        <div className="relative z-10 ml-4">
          <button className="px-5 py-2 bg-white text-slate-900 rounded-xl text-[11px] font-black uppercase shadow-lg group-hover:bg-slate-100 transition-colors whitespace-nowrap">
            {currentAd.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
