
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { SUPPORTED_LANGUAGES, WORD_LIMIT, IMAGE_STYLES, ASPECT_RATIOS, BACKGROUND_OPTIONS } from './constants';
import { TranslationStatus, TranslationHistoryItem, AppTab, AspectRatio } from './types';
import LanguageDropdown from './components/LanguageDropdown';
import BannerAd from './components/BannerAd';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('translate');
  
  // Translation States
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('Auto-detect');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>(TranslationStatus.IDLE);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  
  // Image Generation States
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Shared States
  const [isLive, setIsLive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const handleTranslate = async (textOverride?: string, forceSource?: string, forceTarget?: string) => {
    const text = textOverride || sourceText;
    if (!text.trim()) { setTranslatedText(''); setStatus(TranslationStatus.IDLE); return; }
    
    setStatus(TranslationStatus.LOADING);
    const s = forceSource || (sourceLang === 'Auto-detect' ? (detectedLang || 'English') : sourceLang);
    const t = forceTarget || targetLang;

    try {
      let full = '';
      const stream = geminiService.translateStream(text, s, t);
      for await (const chunk of stream) {
        full += chunk;
        setTranslatedText(full);
        setStatus(TranslationStatus.SUCCESS);
      }
    } catch { setStatus(TranslationStatus.ERROR); }
  };

  const debouncedTranslate = useCallback((text: string) => {
    if (!isLive) return;
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => handleTranslate(text), 800);
  }, [sourceLang, targetLang, detectedLang, isLive]);

  const detectLanguage = async (text: string) => {
    if (sourceLang !== 'Auto-detect' || text.length < 5) return;
    const lang = await geminiService.detectLanguage(text);
    if (lang && lang !== detectedLang) {
      setDetectedLang(lang);
      if (lang === 'Hindi' && targetLang === 'Hindi') setTargetLang('English');
      if (lang === 'English' && targetLang === 'English') setTargetLang('Hindi');
      if (isLive) handleTranslate(text, lang);
    }
  };

  const clearTranslator = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang(null);
    setStatus(TranslationStatus.IDLE);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    const result = await geminiService.generateImage(
      imagePrompt, 
      selectedStyle.promptSuffix, 
      selectedBg.suffix, 
      aspectRatio
    );
    if (result) setGeneratedImage(result);
    setIsGeneratingImage(false);
  };

  const swapLanguages = () => {
    const curSource = sourceLang === 'Auto-detect' ? (detectedLang || 'English') : sourceLang;
    const curTarget = targetLang;
    setSourceLang(curTarget);
    setTargetLang(curSource);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setDetectedLang(null);
    if (isLive && translatedText) handleTranslate(translatedText, curTarget, curSource);
  };

  const playAudio = async (text: string, lang: string) => {
    if (isPlaying || !text) return;
    setIsPlaying(true);
    const playLang = lang === 'Auto-detect' ? (detectedLang || 'English') : lang;
    const base64 = await geminiService.generateSpeech(text, playLang);
    if (base64) {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      buffer.getChannelData(0).set(Array.from(dataInt16).map(v => v / 32768.0));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } else setIsPlaying(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 relative min-h-screen">
      <BannerAd className="mb-8" />

      {/* Header & Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">PolyGlot <span className="text-indigo-600">Pro</span></h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Multi-Tool AI Suite</p>
          </div>
        </div>

        <nav className="flex p-1 bg-slate-200/50 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('translate')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'translate' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            Translator
          </button>
          <button 
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'image' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002-2z" /></svg>
            Image Studio
          </button>
        </nav>
      </header>

      {activeTab === 'translate' ? (
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Translation UI */}
            <div className="space-y-4">
              <div className="flex items-center justify-between min-h-[3.5rem]">
                <LanguageDropdown label="From" value={sourceLang} onChange={(v) => { setSourceLang(v); setDetectedLang(null); }} />
                <div className="mt-5 flex items-center gap-2">
                  {sourceLang === 'Auto-detect' && detectedLang && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-in zoom-in">{detectedLang}</span>
                  )}
                  {sourceText && (
                    <button 
                      onClick={clearTranslator}
                      className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={sourceText}
                  onChange={(e) => { setSourceText(e.target.value); debouncedTranslate(e.target.value); detectLanguage(e.target.value); }}
                  placeholder="Paste or type text here..."
                  className="w-full h-64 md:h-80 p-6 bg-white border border-slate-200 rounded-3xl text-lg shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                />
                <div className="absolute bottom-4 left-6 text-slate-400 text-[10px] font-bold uppercase">
                  {sourceText.length} characters
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-2 min-h-[3.5rem]">
                <LanguageDropdown label="To" value={targetLang} onChange={setTargetLang} />
                <button 
                  onClick={swapLanguages} 
                  className="p-3 mb-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                  title="Swap Languages"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </button>
              </div>
              <div className="relative group">
                <div className={`w-full h-64 md:h-80 p-6 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-lg text-slate-800 shadow-inner overflow-y-auto leading-relaxed transition-opacity ${status === TranslationStatus.LOADING ? 'opacity-50' : 'opacity-100'}`}>
                  {translatedText || (status === TranslationStatus.LOADING ? 'Generating translation...' : 'Result will appear here...')}
                </div>
                
                {/* ACTIONS BAR - VERY VISIBLE NOW */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  {copyStatus && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-in fade-in slide-in-from-right-2">
                      {copyStatus}
                    </span>
                  )}
                  <button 
                    onClick={() => copyToClipboard(translatedText)}
                    disabled={!translatedText}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-600 shadow-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:shadow-none border border-indigo-50 font-bold text-xs"
                    title="Copy to Clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    COPY
                  </button>
                  <button 
                    onClick={() => playAudio(translatedText, targetLang)} 
                    disabled={!translatedText || isPlaying}
                    className="p-3 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 shadow-xl border border-slate-50 transition-all disabled:opacity-30 disabled:shadow-none"
                    title="Listen"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <BannerAd type="leaderboard" className="mt-8" />
        </main>
      ) : (
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Describe your image</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="E.g., A cute robot holding a mango in a futuristic market..."
                    className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 shadow-inner focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-6">
                  {/* STYLE & BG GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Artistic Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {IMAGE_STYLES.map(style => (
                          <button 
                            key={style.id}
                            onClick={() => setSelectedStyle(style)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${selectedStyle.id === style.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Environment / Background</label>
                      <div className="grid grid-cols-2 gap-2">
                        {BACKGROUND_OPTIONS.map(bg => (
                          <button 
                            key={bg.id}
                            onClick={() => setSelectedBg(bg)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${selectedBg.id === bg.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                      {ASPECT_RATIOS.map(ratio => (
                        <button 
                          key={ratio}
                          onClick={() => setAspectRatio(ratio as AspectRatio)}
                          className={`w-14 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                  {isGeneratingImage ? (
                    <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> CREATING ART...</>
                  ) : (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>GENERATE IMAGE</>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center min-h-[450px] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden relative group shadow-inner">
                {generatedImage ? (
                  <img src={generatedImage} alt="AI Generated" className="w-full h-full object-contain animate-in zoom-in-95 duration-1000" />
                ) : isGeneratingImage ? (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Mixing pixels...</p>
                  </div>
                ) : (
                  <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002-2z" /></svg>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Your masterpiece here</p>
                  </div>
                )}
                
                {generatedImage && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <button 
                      onClick={() => copyToClipboard(generatedImage)}
                      className="px-6 py-2.5 bg-white/90 backdrop-blur text-indigo-600 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      COPY URL
                    </button>
                    <a 
                      href={generatedImage} 
                      download="polyglot-ai-art.png" 
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      DOWNLOAD
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* STICKY BOTTOM AD FOR MOBILE EARNINGS - HIGH VISIBILITY */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-slate-200 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
           <BannerAd type="mobile" />
        </div>
      </div>

      <footer className="pt-12 border-t border-slate-200 text-center pb-12">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-40">
           <div className="h-px w-8 bg-slate-300"></div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">End of Workspace</span>
           <div className="h-px w-8 bg-slate-300"></div>
        </div>
        <p className="text-slate-400 text-xs mb-8 font-medium">
          Professional AI Workspace &bull; Sponsored by Community Ads &bull; Powered by Gemini
        </p>
        <div className="flex justify-center gap-12">
          <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Ad-Free Pro</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
