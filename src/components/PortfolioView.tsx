import React, { useState, useEffect } from "react";
import { PortfolioData } from "../types";
import { getContainerSizeStyle, getImageStyleHelper } from "../imageStyleUtils";
import {
  Home,
  Palette,
  Star,
  FileText,
  ArrowUp,
  Twitter,
  Instagram,
  Twitch,
  Youtube,
  Mail,
  Globe,
  Facebook,
  Github,
  MessageSquare
} from "lucide-react";

export { getContainerSizeStyle, getImageStyleHelper };

interface PortfolioViewProps {
  data: PortfolioData | null;
  loading: boolean;
  onNavigateToAdmin: () => void;
}


export default function PortfolioView({ data, loading, onNavigateToAdmin }: PortfolioViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"home" | "cms" | "vtuber" | "tos" | "contact">("home");
  const [slideIdx, setSlideIdx] = useState<number>(0);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [selectedYchImage, setSelectedYchImage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollFab(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading || !data) {
    return (
      <div id="portfolio_loading_placeholder" className="min-h-[50vh] flex flex-col items-center justify-center text-white font-fredoka gap-4">
        <div className="w-12 h-12 border-4 border-white border-t-brand-red rounded-full animate-spin"></div>
        <p className="font-nunito text-lg tracking-wider font-bold">Loading Friedcat's Showcase...</p>
      </div>
    );
  }

  // Helper to format status tag classes
  const getStatusBadgeClass = (status?: "open" | "limited" | "closed" | string) => {
    const s = String(status || "").toLowerCase();
    if (s === "open") return "bg-[#d4f0d4] border-[#7bc97b] text-[#2a6a2a]";
    if (s === "closed" || s === "close") return "bg-[#f0d4d4] border-[#c97b7b] text-[#6a2a2a]";
    return "bg-[#fff3cd] border-[#f0b429] text-[#7a5000]";
  };

  const getStatusLabel = (status?: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "open") return "Open";
    if (s === "closed" || s === "close") return "Closed";
    return "Limited";
  };

  // Carousel controls for Illustration section (maximum 5 slides allowed)
  const slides = (data.illustSlides || []).slice(0, 5);

  const getSocialIcon = (title?: string) => {
    const t = String(title || "").toLowerCase();
    if (t.includes("bluesky") || t.includes("bsky") || t.includes("butterfly")) {
      return (
        <svg viewBox="0 0 16 16" className="w-5 h-5 text-white fill-current animate-fadeIn">
          <path d="M12.258 1.258c1.01-.718 2.368-.194 2.368 1.047 0 1.95-2.051 4.888-3.004 6.085-.24.3-.272.426-.04.752.124.176.77 1.054 1.275 1.74l1.353 1.83c.814 1.104.162 2.651-1.14 2.357-2.583-.584-5.61-3.037-7.07-5.071-1.46 2.034-4.487 4.487-7.07 5.071-1.302.294-1.954-1.253-1.14-2.357l1.353-1.83c.505-.686 1.151-1.564 1.275-1.74.232-.326.2-.453-.04-.752-.953-1.197-3.004-4.135-3.004-6.085 0-1.24 1.358-1.765 2.368-1.047 1.623 1.157 2.632 3.196 3.117 4.516.485-1.32 1.494-3.359 3.117-4.516z"/>
        </svg>
      );
    }
    if (t.includes("twitter") || t === "x") return <Twitter className="w-5 h-5 text-white" />;
    if (t.includes("instagram") || t.includes("ig")) return <Instagram className="w-5 h-5 text-white" />;
    if (t.includes("twitch") || t.includes("tw")) return <Twitch className="w-5 h-5 text-white" />;
    if (t.includes("youtube") || t.includes("yt")) return <Youtube className="w-5 h-5 text-white" />;
    if (t.includes("mail") || t.includes("email")) return <Mail className="w-5 h-5 text-white" />;
    if (t.includes("facebook") || t.includes("fb")) return <Facebook className="w-5 h-5 text-white" />;
    if (t.includes("github")) return <Github className="w-5 h-5 text-white" />;
    if (t.includes("discord")) return <MessageSquare className="w-5 h-5 text-white" />;
    return <Globe className="w-5 h-5 text-white" />;
  };
  const handlePrevSlide = () => {
    if (slides.length === 0) return;
    setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    if (slides.length === 0) return;
    setSlideIdx((prev) => (prev + 1) % slides.length);
  };

  const scrollToAnchor = (id: string) => {
    setActiveSubTab("cms");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div id="portfolio_showcase_surface" className="relative w-full max-w-[620px] mx-auto z-10">
      
      {/* Floating Scroll to Top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-6 md:right-10 z-50 w-11 h-11 rounded-full bg-brand-red-btn hover:bg-brand-red text-white flex items-center justify-center shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer ${
          showScrollFab ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        }`}
        title="Go to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Main card representation */}
      <div className="bg-brand-white border-[4px] border-brand-red rounded-[2.5rem] overflow-hidden shadow-[0_12px_45px_rgba(58,26,26,0.18)] relative">
        
        {/* TOP COMPONENT: SITE NAVIGATION HEADER  */}
        <div id="portfolio_site_nav_bar" className="flex flex-wrap items-center justify-center gap-2.5 p-4 bg-brand-white border-b-2 border-brand-border/40">
          <button
            onClick={() => setActiveSubTab("home")}
            className={`py-2 px-4.5 rounded-full font-fredoka font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeSubTab === "home"
                ? "bg-brand-red text-white shadow-md scale-102 border-2 border-white ring-2 ring-brand-red"
                : "bg-brand-red-btn hover:bg-brand-red text-white opacity-90 active:translate-y-0.5"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            HOME
          </button>
          
          <button
            onClick={() => setActiveSubTab("cms")}
            className={`py-2 px-4.5 rounded-full font-fredoka font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeSubTab === "cms"
                ? "bg-brand-red text-white shadow-md scale-102 border-2 border-white ring-2 ring-brand-red"
                : "bg-brand-red-btn hover:bg-brand-red text-white opacity-90 active:translate-y-0.5"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            CMS ART
          </button>
          
          <button
            onClick={() => setActiveSubTab("vtuber")}
            className={`py-2 px-4.5 rounded-full font-fredoka font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeSubTab === "vtuber"
                ? "bg-brand-red text-white shadow-md scale-102 border-2 border-white ring-2 ring-brand-red"
                : "bg-brand-red-btn hover:bg-brand-red text-white opacity-90 active:translate-y-0.5"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            VTUBER
          </button>
          
          <button
            onClick={() => setActiveSubTab("tos")}
            className={`py-2 px-4.5 rounded-full font-fredoka font-bold text-xs md:text-sm tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeSubTab === "tos"
                ? "bg-brand-red text-white shadow-md scale-102 border-2 border-white ring-2 ring-brand-red"
                : "bg-brand-red-btn hover:bg-brand-red text-white opacity-90 active:translate-y-0.5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            TOS
          </button>
        </div>

        {/* ==================== HOME PAGE SECTION ==================== */}
        {activeSubTab === "home" && (
          <div id="sub_page_home" className="animate-fadeIn">
            {/* Top portion (Cream header section) */}
            <div className="bg-[#f5ede0] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b-[3px] border-brand-red">
              
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left flex-1">
                {/* Profile Avatar wrap (Squirclish / soft corner of image) - Enlarged per user request */}
                <div
                  className={`shrink-0 bg-brand-red rounded-[2.2rem] overflow-hidden border-4 border-brand-red shadow-md flex items-center justify-center relative ${!data.imageStyles?.avatarImg?.width && !data.imageStyles?.avatarImg?.height ? "w-32 h-32 sm:w-40 sm:h-40" : ""}`}
                  style={getContainerSizeStyle(data.imageStyles?.avatarImg)}
                >
                  {data.avatarImg ? (
                    <img
                      src={data.avatarImg}
                      alt={data.name || "Friedcat"}
                      referrerPolicy="no-referrer"
                      className="w-full h-full animate-fadeInFast"
                      style={getImageStyleHelper(data.imageStyles?.avatarImg)}
                    />
                  ) : (
                    <span className="text-5xl text-white select-none">&#128049;</span>
                  )}
                </div>

                {/* Bio Details */}
                <div className="font-fredoka flex-1">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#9b2335] leading-none mb-3.5 flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                    <span>{data.name || "Friedcat"}</span>
                    {/* Hand-drawn scribble style Cat Paw button - transitions to "Contact" tab */}
                    <button
                      onClick={() => setActiveSubTab("contact")}
                      className="shrink-0 bg-[#9b2335] text-white p-2 sm:p-2 rounded-full hover:scale-110 hover:rotate-12 duration-300 transition-all shadow-md border-2 border-white flex items-center justify-center cursor-pointer"
                      title="Contact & Commission Me"
                    >
                      <svg viewBox="0 0 100 100" className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-none stroke-current" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
                        {/* Main Pad - hand scribbled bean shape */}
                        <path d="M34,68 C28,64 34,54 44,54 C54,54 58,58 64,54 C70,54 76,64 70,68 C64,72 66,74 54,74 C42,74 40,72 34,68 Z" />
                        {/* Scribbles inside pad */}
                        <path d="M42,64 C40,62 45,58 48,60 C51,62 46,67 42,64 Z" strokeWidth="3" />
                        <path d="M58,63 C56,61 61,58 62,60 C63,62 59,65 58,63 Z" strokeWidth="3" />
                        {/* Toes */}
                        {/* Toe 1 */}
                        <path d="M25,48 C22,42 28,34 32,38 C35,42 30,50 25,48 Z" />
                        <path d="M27,43 C26,42 29,39 30,41" strokeWidth="3" />
                        {/* Toe 2 */}
                        <path d="M42,32 C39,24 48,18 52,24 C55,28 48,36 42,32 Z" />
                        <path d="M44,27 C43,26 47,21 48,23" strokeWidth="3" />
                        {/* Toe 3 */}
                        <path d="M62,34 C59,26 68,22 71,28 C73,34 66,40 62,34 Z" />
                        <path d="M63,29 C62,28 66,23 67,25" strokeWidth="3" />
                        {/* Toe 4 */}
                        <path d="M78,52 C74,46 82,38 85,42 C88,46 82,54 78,52 Z" />
                        <path d="M79,47 C78,46 81,41 82,43" strokeWidth="3" />
                      </svg>
                    </button>
                  </h1>
                  
                  <h2 className="text-[10px] font-black text-[#9b2335] tracking-wider uppercase mb-2 block">
                    ★ STATUS
                  </h2>
                  
                  <div className="space-y-1.5 text-xs text-brand-text font-bold">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span>Illustration Status:</span>
                      <span className={`px-3.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border uppercase tracking-wider ${getStatusBadgeClass(data.statusIllust)}`}>
                        {getStatusLabel(data.statusIllust)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span>Live2D status:</span>
                      <span className={`px-3.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border uppercase tracking-wider ${getStatusBadgeClass(data.statusLive2d)}`}>
                        {getStatusLabel(data.statusLive2d)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom portion (Pill buttons in White container) - social row and admin gateway removed per request */}
            <div className="bg-white p-6 sm:p-8 space-y-4 flex flex-col items-center justify-center">
              <button
                onClick={() => scrollToAnchor("illust-anchor")}
                className="w-full max-w-lg py-3.5 border-[3px] md:border-[3.5px] border-brand-red bg-white hover:bg-brand-red hover:text-white text-brand-red font-fredoka text-sm tracking-widest uppercase font-black rounded-full cursor-pointer transition-all duration-200 active:translate-y-0.5"
              >
                ILLUSTRATION SERVICES
              </button>
              
              <button
                onClick={() => setActiveSubTab("vtuber")}
                className="w-full max-w-lg py-3.5 border-[3px] md:border-[3.5px] border-brand-red bg-white hover:bg-brand-red hover:text-white text-brand-red font-fredoka text-sm tracking-widest uppercase font-black rounded-full cursor-pointer transition-all duration-200 active:translate-y-0.5"
              >
                LIVE2D VTUBER BLUEPRINTS
              </button>
              
              <button
                onClick={() => setActiveSubTab("tos")}
                className="w-full max-w-lg py-3.5 border-[3px] md:border-[3.5px] border-brand-red bg-white hover:bg-brand-red hover:text-white text-brand-red font-fredoka text-sm tracking-widest uppercase font-black rounded-full cursor-pointer transition-all duration-200 active:translate-y-0.5"
              >
                TERMS OF SERVICE
              </button>
            </div>
          </div>
        )}

        {/* ==================== CMS ART PAGE SECTION ==================== */}
        {activeSubTab === "cms" && (
          <div id="sub_page_cms" className="animate-fadeIn">
            
            {/* Gallery Cards and anchor gates */}
            <div className="bg-brand-cream p-5 md:p-6 border-b-2 border-brand-border">
              <h2 className="font-fredoka text-3xl font-black text-brand-red text-center tracking-wider mb-2">
                CMS SERVICES
              </h2>
              <p className="text-[10px] text-brand-red-soft text-center italic font-semibold mb-4 tracking-wider uppercase">
                * Click on any card thumbnail to scroll down to view specifications *
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => scrollToAnchor("illust-anchor")}
                  className="bg-white rounded-xl p-2.5 border-2 border-brand-border hover:border-brand-red cursor-pointer transition-all flex flex-col items-center shadow-sm"
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-brand-border/40 bg-brand-cream flex items-center justify-center mb-2">
                    {data.svcIllustThumb ? (
                      <img 
                        src={data.svcIllustThumb} 
                        alt="Illust Card" 
                        className="w-full h-full" 
                        style={getImageStyleHelper(data.imageStyles?.svcIllustThumb)}
                      />
                    ) : (
                      <span className="text-3xl">&#127912;</span>
                    )}
                  </div>
                  <span className="font-fredoka text-xs text-brand-red uppercase tracking-wider">ILLUSTRATION</span>
                </div>

                <div
                  onClick={() => scrollToAnchor("ych-anchor")}
                  className="bg-white rounded-xl p-2.5 border-2 border-brand-border hover:border-brand-red cursor-pointer transition-all flex flex-col items-center shadow-sm"
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-brand-border/40 bg-brand-cream flex items-center justify-center mb-2">
                    {data.svcYchThumb ? (
                      <img 
                        src={data.svcYchThumb} 
                        alt="YCH Card" 
                        className="w-full h-full" 
                        style={getImageStyleHelper(data.imageStyles?.svcYchThumb)}
                      />
                    ) : (
                      <span className="text-3xl">&#127912;</span>
                    )}
                  </div>
                  <span className="font-fredoka text-xs text-brand-red uppercase tracking-wider">YCH</span>
                </div>
              </div>
            </div>

            {/* DO's & DONT's list row */}
            <div className="p-5 md:p-6 space-y-4">
              <h2 className="font-fredoka text-2xl font-black text-brand-red text-center tracking-widest uppercase mb-2">
                DO & DON'T GUIDELINES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* DO Panel */}
                <div className="bg-[#f2f9ed] border-2 border-[#8fc46a] rounded-xl p-4 text-[#2a6a2a] shadow-sm">
                  <h3 className="font-fredoka text-xs uppercase tracking-wider text-[#1a4a1a] mb-2 flex items-center gap-1.5 border-b border-[#8fc46a]/30 pb-1">
                    <span className="font-bold text-sm">&#10003;</span> What I Can Draw:
                  </h3>
                  <ul className="space-y-2 text-xs font-semibold leading-relaxed">
                    {data.doList && data.doList.map((item, id) => (
                      <li key={id} className="flex items-start gap-1">
                        <span className="text-[#6fac4e]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONT Panel */}
                <div className="bg-[#fdf3f3] border-2 border-[#e66a75]/40 rounded-xl p-4 text-[#6a2a2a] shadow-sm">
                  <h3 className="font-fredoka text-xs uppercase tracking-wider text-[#4a1a1a] mb-2 flex items-center gap-1.5 border-b border-[#e66a75]/20 pb-1">
                    <span className="font-bold text-sm">&#10007;</span> What I Will NOT Draw:
                  </h3>
                  <ul className="space-y-2 text-xs font-semibold leading-relaxed">
                    {data.dontList && data.dontList.map((item, id) => (
                      <li key={id} className="flex items-start gap-1">
                        <span className="text-brand-red-soft">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            <div className="h-[2px] bg-brand-border/40 my-1"></div>

            {/* ILLUSTRATION ANCHOR AREA */}
            <div id="illust-anchor" className="p-5 md:p-6 space-y-5 bg-white scroll-mt-6">
              <div className="flex flex-col items-center">
                <h2 className="font-fredoka text-3xl font-black text-brand-red uppercase tracking-wider mb-2">
                  ILLUSTRATION
                </h2>
                {data.illustNote && (
                  <p className="text-[11px] text-[#7C6D6D] text-center max-w-sm font-semibold mb-3 leading-relaxed leading-normal">
                    {data.illustNote}
                  </p>
                )}
                <div className="bg-[#fde8e8] border border-brand-red-soft/30 text-brand-red text-[11px] font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider text-center">
                  ⚡ Commercial Fee is (X2 of the total invoice)
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-text mb-4">
                  <span>SECTION STATUS:</span>
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-black border ${getStatusBadgeClass(data.illustStatus)}`}>
                    {getStatusLabel(data.illustStatus)}
                  </span>
                </div>
              </div>

              {/* Responsive Slideshow Carousel */}
              {slides.length > 0 && (
                <div className="space-y-2">
                  <div className="relative aspect-[16/8] bg-brand-cream/40 border-2 border-brand-border rounded-xl overflow-hidden shadow-sm group">
                    <img
                      src={slides[slideIdx]}
                      alt="Slideshow"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover animate-fadeFast"
                    />
                    
                    {/* Slide arrows */}
                    {slides.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevSlide}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-red-btn/80 hover:bg-brand-red text-white flex items-center justify-center select-none active:scale-95 transition-all text-sm font-bold shadow-md cursor-pointer"
                        >
                          &#8592;
                        </button>
                        <button
                          onClick={handleNextSlide}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-red-btn/80 hover:bg-brand-red text-white flex items-center justify-center select-none active:scale-95 transition-all text-sm font-bold shadow-md cursor-pointer"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Indicators */}
                  {slides.length > 1 && (
                    <div className="flex justify-center gap-1.5">
                      {slides.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSlideIdx(idx)}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                            idx === slideIdx ? "bg-brand-red scale-110" : "bg-brand-border"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Rate Matrix Table */}
              <div className="border border-brand-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse bg-brand-cream/10 text-xs">
                  <thead>
                    <tr className="bg-brand-cream border-b border-brand-border font-fredoka text-brand-red text-[13px] tracking-wider uppercase">
                      <th className="p-3">Type Sizing</th>
                      <th className="p-3">Rough Sketch</th>
                      <th className="p-3">Full Rendering</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30 text-brand-text font-bold">
                    {data.illustRows && data.illustRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-brand-cream/15 transition-colors">
                        <td className="p-3 font-fredoka text-brand-red-soft">{row.type}</td>
                        <td className="p-3">{row.rough}</td>
                        <td className="p-3 text-brand-red-btn">{row.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Examples Grid Area */}
              {data.illustExamples && data.illustExamples.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="font-fredoka text-sm text-brand-red text-center tracking-widest uppercase mb-1">
                    ILLUSTRATION SHOWCASE GALLERY
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {data.illustExamples.map((src, id) => (
                      <div key={id} className="aspect-square rounded-xl overflow-hidden border-2 border-brand-border bg-brand-cream flex items-center justify-center shadow-xs">
                        {src ? (
                          <img src={src} alt="Showcase Example" referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-105 duration-300 transition-all" />
                        ) : (
                          <span className="text-xl">&#127912;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="h-[2px] bg-brand-border/40 my-1"></div>

            {/* YCH SECTION */}
            <div id="ych-anchor" className="p-5 md:p-6 space-y-6 bg-white scroll-mt-6">
              <div className="flex flex-col items-center">
                <h2 className="font-fredoka text-3xl font-black text-brand-red uppercase tracking-wider mb-2">
                  Your Character Here (YCH)
                </h2>
                {data.ychNote && (
                  <p className="text-[11px] text-[#7C6D6D] text-center max-w-sm font-semibold mb-3 leading-relaxed">
                    {data.ychNote}
                  </p>
                )}
                <div className="bg-[#fde8e8] border border-brand-red-soft/30 text-brand-red text-[11px] font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider text-center">
                  ⚡ Commercial Fee is (X2 of the total invoice)
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-text mb-4">
                  <span>SECTION STATUS:</span>
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-black border ${getStatusBadgeClass(data.ychStatus)}`}>
                    {getStatusLabel(data.ychStatus)}
                  </span>
                </div>
              </div>

              {/* Interactive YCH listing nodes */}
              <div className="space-y-4 divide-y divide-brand-border/20">
                {data.ychItems && data.ychItems.map((ych, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-5 pt-6 first:pt-0 items-center sm:items-start">
                    <div
                      onClick={() => ych.image && setSelectedYchImage(ych.image)}
                      className={`shrink-0 bg-brand-cream border-[3px] border-brand-border rounded-2xl overflow-hidden shadow-md flex items-center justify-center relative hover:scale-[1.03] transition-transform duration-300 group/ychimg ${ych.image ? 'cursor-zoom-in' : ''}`}
                      style={{ width: "220px", height: "220px", ...getContainerSizeStyle(data.imageStyles?.[`ych_${idx}`]) }}
                    >
                      {ych.image ? (
                        <>
                          <img
                            src={ych.image}
                            alt={ych.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full"
                            style={getImageStyleHelper(data.imageStyles?.[`ych_${idx}`])}
                          />
                          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover/ychimg:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <span className="text-white text-[10px] font-fredoka tracking-widest uppercase font-bold bg-[#9b2335] border border-white px-2.5 py-1.5 rounded-full shadow-lg">
                              🔍 CLICK TO ZOOM
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-5xl text-brand-red-soft/40">&#127912;</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="font-fredoka text-[22px] text-brand-red leading-tight uppercase font-black">
                        {ych.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#5C4D4D] font-bold leading-relaxed whitespace-pre-wrap">
                        {ych.desc}
                      </p>
                      <span className="font-fredoka text-xs sm:text-sm text-brand-red-soft tracking-widest block pt-1 font-black">
                        BASE RATE: {ych.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* YCH Examples Grid */}
              {data.ychExamples && data.ychExamples.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-brand-border/30">
                  <h3 className="font-fredoka text-sm text-brand-red text-center tracking-widest uppercase mb-1">
                    YCH FINISHED EXAMPLES
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {data.ychExamples.map((src, id) => (
                      <div key={id} className="aspect-square rounded-xl overflow-hidden border-2 border-brand-border bg-brand-cream flex items-center justify-center shadow-xs">
                        {src ? (
                          <img src={src} alt="YCH Example" referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-105 duration-300 transition-all" />
                        ) : (
                          <span className="text-xl">&#127912;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VTUBER PAGE SECTION ==================== */}
        {activeSubTab === "vtuber" && (
          <div id="sub_page_vtuber" className="animate-fadeIn">
            <div className="p-4 md:p-6 space-y-6">
              
              {/* Layout Header Title Banner */}
              <div className="text-center font-fredoka py-2">
                {/* TOP DOUBLE BORDER */}
                <div className="border-t-4 border-double border-brand-red w-full mb-3" />

                <h2 className="text-brand-red text-3xl md:text-4xl font-black tracking-wider uppercase mb-1 leading-none">
                  LIVE2D COMMISSION
                </h2>
                <p className="text-[10px] md:text-xs text-brand-red-soft font-bold leading-relaxed px-4 max-w-lg mx-auto">
                  The prices listed here are not the final quote and might shift slightly because of the currency exchange rate changes.
                </p>
                
                <div className="mt-3 inline-block px-5 py-1.5 bg-white border border-brand-red text-[#9b2335] text-[10px] md:text-xs font-black tracking-wider uppercase shadow-xs">
                  {data.vtuberDesignNote || "I don't do the design"}
                </div>

                {/* BOTTOM DOUBLE BORDER */}
                <div className="border-b-4 border-double border-brand-red w-full mt-4" />
              </div>

              {/* Dynamic Status Display */}
              <div className="flex items-center gap-2.5 font-fredoka uppercase mb-4 px-1">
                <span className="text-xs text-brand-red font-black tracking-widest">STATUS :</span>
                <span className={`px-3.5 py-0.5 rounded-full text-[10px] md:text-xs font-black border uppercase tracking-wider ${getStatusBadgeClass(data.statusLive2d || "open")}`}>
                  {getStatusLabel(data.statusLive2d || "open")}
                </span>
              </div>

              {/* Responsive Columns Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* LEFT SIDEBAR COLUMN: Major Avatar image with striped hand-drawn dividers */}
                <div className="space-y-3">
                  <div
                    className={`border-[3px] border-brand-red rounded-2xl bg-brand-cream overflow-hidden shadow-sm relative flex items-center justify-center transition-all hover:shadow-md ${!data.imageStyles?.vtuberMainImg?.width && !data.imageStyles?.vtuberMainImg?.height ? "w-full h-[400px] md:h-[530px]" : "w-full"}`}
                    style={getContainerSizeStyle(data.imageStyles?.vtuberMainImg)}
                  >
                    {data.vtuberMainImg ? (
                      <img
                        src={data.vtuberMainImg}
                        alt="Live2D Commission Show"
                        className="w-full h-full"
                        style={getImageStyleHelper(data.imageStyles?.vtuberMainImg)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-red-soft/40 italic font-fredoka font-semibold text-xs">
                        No custom image uploaded
                      </div>
                    )}
                  </div>

                  {/* Top Hand-drawn striped margin border */}
                  <div 
                    className="h-3.5 w-full opacity-90 rounded" 
                    style={{ backgroundImage: "repeating-linear-gradient(-45deg, #9b2335, #9b2335 8px, #f5ede0 8px, #f5ede0 16px)" }}
                  />
                  
                  {/* Artist Username Accent */}
                  <div className="text-center font-fredoka text-2xl font-black text-brand-red tracking-wide py-1 leading-none uppercase">
                    {data.name || "Friedcat"}
                  </div>

                  {/* Bottom Hand-drawn striped margin border */}
                  <div 
                    className="h-3.5 w-full opacity-90 rounded" 
                    style={{ backgroundImage: "repeating-linear-gradient(-45deg, #9b2335, #9b2335 8px, #f5ede0 8px, #f5ede0 16px)" }}
                  />
                </div>

                {/* RIGHT SYSTEM COLUMN: Fully configured structural tables */}
                <div className="space-y-6">
                  
                  {/* BLOCK 1: FULLBODY TABLE */}
                  <div className="space-y-3">
                    <h3 className="font-fredoka text-xl font-black text-brand-red tracking-wide uppercase">
                      FULLBODY
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-fredoka text-xs md:text-sm border-collapse select-none">
                        <thead>
                          <tr className="border-b border-brand-red/20">
                            <th className="text-brand-red/50 uppercase tracking-widest pb-2 font-black text-[10px]">Type</th>
                            <th className="text-brand-red/50 uppercase tracking-widest pb-2 text-right font-black text-[10px]">Starting Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-red/10 text-brand-text font-bold">
                          {data.vtuberFullbodyRows && data.vtuberFullbodyRows.length > 0 ? (
                            data.vtuberFullbodyRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2.5">{row.type}</td>
                                <td className="py-2.5 text-right text-brand-red font-black">{row.price}</td>
                              </tr>
                            ))
                          ) : (
                            <>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2.5">Art + Rigging</td>
                                <td className="py-2.5 text-right text-brand-red font-black">$716+ / ฿23,000+</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2.5">Art only</td>
                                <td className="py-2.5 text-right text-brand-red font-black">$592+ / ฿19,000+</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2.5">Rigging only</td>
                                <td className="py-2.5 text-right text-brand-red font-black">$405+ / ฿13,000+</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="py-2 border-y border-brand-red/15 text-center text-brand-red-soft font-black text-[11px] tracking-wider uppercase">
                      {data.vtuberPrivacyFee || "Privacy fee 15% of the base price"}
                    </div>
                  </div>

                  {/* BLOCK 2: EXTRA PART TABLE */}
                  <div className="space-y-3 font-fredoka">
                    <h3 className="text-xl font-black text-brand-red tracking-wide uppercase">
                      EXTRA PART
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse select-none">
                        <thead>
                          <tr className="border-b border-brand-red/20">
                            <th className="text-brand-red/50 uppercase tracking-widest pb-2 font-black text-[9px] w-[40%]">Type</th>
                            <th className="text-brand-red/50 uppercase tracking-widest pb-2 text-center font-black text-[9px] w-[30%] font-black uppercase">Art</th>
                            <th className="text-brand-red/50 uppercase tracking-widest pb-2 text-right font-black text-[9px] w-[30%] font-black uppercase">Rigging</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-red/10 text-brand-text font-bold">
                          {data.vtuberExtraParts && data.vtuberExtraParts.length > 0 ? (
                            data.vtuberExtraParts.map((part, idx) => (
                              <tr key={idx} className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">{part.type}</td>
                                <td className="py-2 text-center text-brand-red">{part.art}</td>
                                <td className="py-2 text-right text-brand-red">{part.rigging}</td>
                              </tr>
                            ))
                          ) : (
                            <>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Animal ears</td>
                                <td className="py-2 text-center text-brand-red">$5 / ฿150</td>
                                <td className="py-2 text-right text-brand-red">$9 / ฿300</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Animal tail</td>
                                <td className="py-2 text-center text-brand-red">$6+ / ฿200+</td>
                                <td className="py-2 text-right text-brand-red">$12 / ฿400</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Expression</td>
                                <td className="py-2 text-center text-brand-red">$2 / ฿50</td>
                                <td className="py-2 text-right text-brand-red">$3 / ฿100</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Animated expression</td>
                                <td className="py-2 text-center text-brand-red">$5 / ฿150</td>
                                <td className="py-2 text-right text-brand-red">$9 / ฿300</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Tongue out</td>
                                <td className="py-2 text-center text-brand-red">$9 / ฿300</td>
                                <td className="py-2 text-right text-brand-red">$19 / ฿600</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Cheek puff</td>
                                <td className="py-2 text-center text-brand-text/50">-</td>
                                <td className="py-2 text-right text-brand-red">$3 / ฿100</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Second outfit</td>
                                <td className="py-2 text-center text-brand-red">$62+ / ฿2,000+</td>
                                <td className="py-2 text-right text-brand-red">$78+ / ฿2,500+</td>
                              </tr>
                              <tr className="hover:bg-brand-red/5 transition-colors">
                                <td className="py-2">Extra hairstyle</td>
                                <td className="py-2 text-center text-brand-red">$31 / ฿1,000</td>
                                <td className="py-2 text-right text-brand-red">$31 / ฿1,000</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

              {/* EXAMPLE WORK SECTION: Centered with decorative dashed design */}
              {(data.vtuberExample1 || data.vtuberExample2) && (
                <div className="space-y-4 pt-6 border-t border-brand-red/10">
                  <div className="text-center font-fredoka">
                    <span className="text-2xl font-black text-brand-red uppercase tracking-widest inline-block mx-auto mb-1">
                      EXAMPLE
                    </span>
                    <div className="border-t-2 border-dashed border-brand-red/40 w-24 mx-auto" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {data.vtuberExample1 && (
                      <div className="border-2 border-brand-red rounded-[2rem] bg-brand-cream overflow-hidden shadow-xs aspect-[2/3] sm:aspect-[3/5] relative flex items-center justify-center transition-all hover:shadow-md">
                        <img 
                          src={data.vtuberExample1} 
                          alt="Vtuber Example Left" 
                          className="w-full h-full"
                          style={getImageStyleHelper(data.imageStyles?.vtuberExample1)}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {data.vtuberExample2 && (
                      <div className="border-2 border-brand-red rounded-[2rem] bg-brand-cream overflow-hidden shadow-xs aspect-[2/3] sm:aspect-[3/5] relative flex items-center justify-center transition-all hover:shadow-md">
                        <img 
                          src={data.vtuberExample2} 
                          alt="Vtuber Example Right" 
                          className="w-full h-full"
                          style={getImageStyleHelper(data.imageStyles?.vtuberExample2)}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================== TERMS OF SERVICE PAGE SECTION ==================== */}
        {activeSubTab === "tos" && (
          <div id="sub_page_tos" className="animate-fadeIn">
            
            {/* Top portion (Cream header section matching the image) */}
            <div className="bg-[#fdf3df] p-6 md:p-10 text-center font-fredoka border-b-2 border-brand-border/40">
              <h2 className="text-brand-red text-3xl md:text-5xl font-black tracking-wider uppercase mb-3 leading-none">
                TERMS OF SERVICE
              </h2>
              <p className="text-base md:text-lg text-brand-text font-black mb-3">
                Welcome!
              </p>
              <p className="text-xs md:text-sm text-brand-text font-bold leading-relaxed px-2 md:px-8 max-w-xl mx-auto">
                Before placing an order, please carefully read the terms below.
                They were created to ensure a smooth and transparent experience for
                both sides. By hiring my services, you are agreeing to the conditions
                outlined here. All prices mentioned are in USD.
              </p>
              
              {/* Three orange/red dots */}
              <div className="flex justify-center gap-3 mt-6">
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                <span className="w-2 h-2 rounded-full bg-brand-red" />
              </div>
            </div>

            {/* Bottom portion (White list section matching the image with hollow lead bullet indicators) */}
            <div className="bg-white p-6 md:p-10 space-y-6">
              {data.tos && data.tos.map((term, id) => (
                <div key={id} className="flex gap-4 items-start font-fredoka group">
                  {/* Dynamic brand red circle token, hollow center */}
                  <div className="w-3.5 h-3.5 shrink-0 rounded-full border-2 border-brand-red bg-white mt-1 group-hover:scale-110 transition-transform duration-200" />
                  
                  <p className="text-xs sm:text-[14px] text-brand-text font-bold leading-relaxed">
                    {term}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== CONTACT ME SECTION ==================== */}
        {activeSubTab === "contact" && (
          <div id="sub_page_contact" className="animate-fadeIn font-fredoka max-w-2xl mx-auto space-y-6">
            
            {/* Top portion (Cream header section matching the image) */}
            <div className="bg-[#fdf3df] p-6 text-center rounded-2xl border-2 border-brand-border/40 select-text">
              <h2 className="text-[#9b2335] text-3xl md:text-4.5xl font-black tracking-widest uppercase mb-1 leading-none flex items-center justify-center gap-2">
                🐾 CONTACT ME
              </h2>
              <p className="text-xs md:text-sm text-brand-text/80 font-bold tracking-widest uppercase">
                Let's bring your creative ideas to life!
              </p>
              
              {/* Three orange/red dots */}
              <div className="flex justify-center gap-2 mt-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              </div>
            </div>

            {/* Bottom portion (Conversational "yap yap" description with credentials gateway) */}
            <div className="bg-white p-6 md:p-8 space-y-6 rounded-2xl border-2 border-brand-border/40">
              
              {/* "HOW TO GET IN TOUCH" Panel matching requested layout */}
              <div className="bg-[#fbf4eb] border-[2.5px] border-[#9b2335]/15 rounded-3xl p-6 space-y-3.5 shadow-xs select-text">
                <h3 className="text-lg md:text-xl font-extrabold text-brand-red flex items-center gap-2 leading-none uppercase tracking-wider">
                  <span>💌</span> HOW TO GET IN TOUCH:
                </h3>
                <div className="h-[2px] bg-[#9b2335]/10 w-full rounded" />
                <p className="text-sm text-brand-text font-bold leading-relaxed whitespace-pre-wrap">
                  {(() => {
                    const text = data.contactText || "For commissions, booking requests, or direct business inquiries, the best way to connect is to shoot me a friendly DM on my social platforms! I am active regularly and will respond as fast as possible to verify schedule openings. Please make sure you read my Terms of Service before finalizing your plan! 🐾";
                    const parts = text.split(/(Terms of Service)/gi);
                    return parts.map((part, index) => {
                      if (part.toLowerCase() === "terms of service") {
                        return (
                          <span
                            key={index}
                            onClick={() => setActiveSubTab("tos")}
                            className="underline decoration-dashed decoration-2 font-extrabold text-brand-red cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {part}
                          </span>
                        );
                      }
                      return part;
                    });
                  })()}
                </p>
              </div>

              {/* White Social Channels Card with complete custom layout & Red Border outline */}
              <div className="border-[3px] border-[#9b2335] rounded-[2rem] p-6 bg-white w-full max-w-md mx-auto text-center space-y-4 shadow-sm">
                <h3 className="font-fredoka text-sm text-[#9b2335] tracking-widest uppercase font-black">
                  SOCIAL CHANNELS
                </h3>
                <div className="flex justify-center gap-3.5 flex-wrap">
                  {data.socials && data.socials.map((soc, idx) => (
                    <a
                      key={idx}
                      href={soc.u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-[#9b2335] hover:bg-brand-red text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:translate-y-0.5 shadow-md border-2 border-white cursor-pointer"
                      title={soc.t}
                    >
                      {getSocialIcon(soc.t)}
                    </a>
                  ))}
                </div>
              </div>

              {/* Beautiful centered credentials portal entrance only */}
              <div className="pt-6 border-t-2 border-dashed border-[#f5ede0] flex flex-col items-center justify-center gap-2.5">
                <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest block">
                  SYSTEM ENTRANCE PORTAL ONLY
                </span>
                
                <button
                  onClick={onNavigateToAdmin}
                  className="px-6 py-2.5 bg-[#9b2335] hover:bg-brand-red text-white text-xs font-black font-fredoka rounded-full border-2 border-white cursor-pointer transition-all hover:scale-105 active:scale-95 duration-200 flex items-center gap-2 shadow-md uppercase tracking-wider"
                >
                  <svg viewBox="0 0 100 100" className="w-[1rem] h-[1rem] text-white fill-current">
                    <path d="M34,68 C28,64 34,54 44,54 C54,54 58,58 64,54 C70,54 76,64 70,68 C64,72 66,74 54,74 C42,74 40,72 34,68 Z" />
                    <circle cx="28" cy="41" r="7" />
                    <circle cx="48" cy="27" r="7.5" />
                    <circle cx="67" cy="29" r="7.5" />
                    <circle cx="81" cy="43" r="7" />
                  </svg>
                  <span>for friedcat</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* SHARED SITE FOOTER WITH BEAUTIFUL RESPONSIVE VECTOR DESIGN */}
        <div className="site-footer bg-white border-t-2 border-brand-border/40 p-5 flex justify-center gap-4 flex-wrap">
          {data.socials && data.socials.map((soc, idx) => (
            <a
              key={idx}
              href={soc.u}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-brand-red-btn hover:bg-brand-red hover:text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 active:translate-y-0.5 shadow-sm cursor-pointer"
              title={soc.t}
            >
              {getSocialIcon(soc.t)}
            </a>
          ))}
        </div>

      </div>

      {/* Pristine High-Detail Image Lightbox Dialog */}
      {selectedYchImage && (
        <div 
          onClick={() => setSelectedYchImage(null)}
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fadeIn select-text"
        >
          <div className="relative max-w-full max-h-[85vh] select-text" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedYchImage} 
              alt="YCH Detail Specimen" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] rounded-2xl border-4 border-white shadow-2xl object-contain select-all" 
            />
            <button 
              onClick={() => setSelectedYchImage(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-brand-red hover:bg-[#9b2335] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95"
              title="Close image"
            >
              ✕
            </button>
            <p className="text-center font-fredoka text-[#fbf4eb] text-xs uppercase tracking-widest mt-3.5 select-none opacity-80 font-bold">
              🐾 Click anywhere outside to close zoom view 🐾
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
