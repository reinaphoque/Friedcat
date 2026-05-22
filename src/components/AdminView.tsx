import React, { useState, useEffect } from "react";
import { PortfolioData, SocialItem, IllustRow, YchItem, ImageStyleConfig } from "../types";
import { getContainerSizeStyle, getImageStyleHelper } from "../imageStyleUtils";
import {
  User,
  Settings,
  Heart,
  Trash2,
  Plus,
  Globe,
  Sparkles,
  Save,
  HelpCircle,
  Check,
  FileText,
  ArrowLeft,
  Image,
  AlertCircle,
  Lock,
  LogIn,
  LogOut,
  ShieldAlert,
  MessageSquare
} from "lucide-react";

export { getContainerSizeStyle, getImageStyleHelper };

function DimensionInput({ label, field, value, imageKey, onChange }: {
  label: string;
  field: "width" | "height";
  value: number | undefined;
  imageKey: string;
  onChange: (imageKey: string, field: keyof ImageStyleConfig, value: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[9px] text-[#9b7060]/70 uppercase font-bold">{label}</label>
      <input
        type="number"
        min="50"
        max="800"
        placeholder="auto"
        value={value ?? ""}
        onChange={(e) => onChange(imageKey, field, e.target.value ? parseInt(e.target.value) : undefined)}
        className="w-16 bg-[#23140e] border border-[#3d2018] text-[#f5ede0] text-[10px] font-mono px-2 py-1 rounded focus:outline-none focus:border-[#d4704a]"
      />
      <span className="text-[9px] text-[#9b7060]/50">px</span>
    </div>
  );
}

/** URL input + live preview + Clear button — replaces file-upload inputs. */
function ImageUrlInput({ value, onChange, placeholder = "Paste Cloudinary URL…" }: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2 items-center">
        <input
          type="url"
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] text-[11px] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-[#d4704a] placeholder:text-[#9b7060]/40"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 px-2.5 py-2 text-[9px] font-black uppercase text-[#9b7060]/70 hover:text-[#f5ede0] border border-[#3d2018] hover:border-[#d4704a] rounded cursor-pointer transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          referrerPolicy="no-referrer"
          className="w-full max-h-36 object-cover rounded-lg border border-[#3d2018]"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.25"; }}
        />
      )}
    </div>
  );
}

function ImageStyleSliders({ imageKey, draft, onChange }: { 
  imageKey: string; 
  draft: PortfolioData; 
  onChange: (imageKey: string, field: keyof ImageStyleConfig, value: any) => void;
}) {
  const styles = draft.imageStyles?.[imageKey] || { scale: 100, posX: 50, posY: 50, fit: "cover" };
  const scale = styles.scale !== undefined ? styles.scale : 100;
  const posX = styles.posX !== undefined ? styles.posX : 50;
  const posY = styles.posY !== undefined ? styles.posY : 50;
  const fit = styles.fit || "cover";

  return (
    <div className="bg-[#180e0a] border border-[#3d2018] rounded-xl p-3.5 mt-2.5 space-y-3.5 w-full select-none text-left">
      <div className="flex h-4 items-center justify-between">
        <span className="text-[10px] text-[#d4704a] font-black uppercase tracking-wider flex items-center gap-1.5">
          ⚙️ Live Positioning & Crop
        </span>
        <span className="text-[9px] text-[#9b7060]/90 font-mono uppercase bg-[#1c1008] px-1.5 py-0.5 rounded border border-[#3d2018]">
          {fit === "cover" ? `Zoom: ${scale}% | Pos: ${posX}%, ${posY}%` : "Fit: Contain"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SCALE/ZOOM SLIDER */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] text-[#9b7060]/90 uppercase font-bold tracking-wider">Scale / Zoom</label>
            <span className="text-[9px] text-[#d4704a]/90 font-mono font-bold">{scale}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="300"
            value={scale}
            onChange={(e) => onChange(imageKey, "scale", parseInt(e.target.value))}
            className="w-full accent-[#d4704a] h-1 bg-[#23140e] rounded cursor-pointer"
          />
        </div>

        {/* HORIZONTAL POSITION SLIDER */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] text-[#9b7060]/90 uppercase font-bold tracking-wider">Horizontal (X)</label>
            <span className="text-[9px] text-[#d4704a]/80 font-mono font-bold">{posX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={posX}
            onChange={(e) => onChange(imageKey, "posX", parseInt(e.target.value))}
            className="w-full accent-[#d4704a] h-1 bg-[#23140e] rounded cursor-pointer"
            disabled={fit === "contain"}
          />
        </div>

        {/* VERTICAL POSITION SLIDER */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] text-[#9b7060]/90 uppercase font-bold tracking-wider">Vertical (Y)</label>
            <span className="text-[9px] text-[#d4704a]/80 font-mono font-bold">{posY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={posY}
            onChange={(e) => onChange(imageKey, "posY", parseInt(e.target.value))}
            className="w-full accent-[#d4704a] h-1 bg-[#23140e] rounded cursor-pointer"
            disabled={fit === "contain"}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-0.5 flex-wrap sm:flex-nowrap">
        <label className="text-[9px] text-[#9b7060]/90 uppercase font-bold tracking-wider">Fitting Mode:</label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange(imageKey, "fit", "cover")}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all cursor-pointer ${
              fit === "cover"
                ? "bg-[#d4704a] border-[#d4704a] text-white font-extrabold"
                : "bg-transparent border-[#3d2018] text-[#9b7060] hover:text-[#f5ede0]"
            }`}
          >
            Cover (Fill)
          </button>
          <button
            type="button"
            onClick={() => onChange(imageKey, "fit", "contain")}
            className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all cursor-pointer ${
              fit === "contain"
                ? "bg-[#d4704a] border-[#d4704a] text-white font-extrabold"
                : "bg-transparent border-[#3d2018] text-[#9b7060] hover:text-[#f5ede0]"
            }`}
          >
            Contain (Fit Inside)
          </button>
        </div>
        <p className="text-[8px] text-[#9b7060]/50 italic leading-none ml-auto">
          * Drag sliders to crop & center in real time.
        </p>
      </div>

      {/* CUSTOM FRAME SIZE */}
      <div className="pt-2.5 border-t border-[#3d2018]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] text-[#9b7060]/90 uppercase font-bold tracking-wider">Custom Frame Size</span>
          {(styles.width != null || styles.height != null) && (
            <button
              type="button"
              onClick={() => { onChange(imageKey, "width", undefined); onChange(imageKey, "height", undefined); }}
              className="text-[8px] text-[#9b7060]/60 hover:text-[#d4704a] uppercase font-bold tracking-wider border border-[#3d2018] px-1.5 py-0.5 rounded cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <DimensionInput label="W" field="width" value={styles.width} imageKey={imageKey} onChange={onChange} />
          <DimensionInput label="H" field="height" value={styles.height} imageKey={imageKey} onChange={onChange} />
          <p className="text-[8px] text-[#9b7060]/50 italic">Leave blank for default size.</p>
        </div>
      </div>
    </div>
  );
}

interface AdminViewProps {
  data: PortfolioData | null;
  onSave: (newData: PortfolioData) => Promise<void>;
  onNavigateToPortfolio: () => void;
  saving: boolean;
}


export default function AdminView({ data, onSave, onNavigateToPortfolio, saving }: AdminViewProps) {
  const [activeMenuSec, setActiveMenuSec] = useState<"profile" | "status" | "socials" | "dodont" | "illust" | "ych" | "vtuber" | "tos" | "contact">("profile");
  
  // Create local draft copy of data so changes are safe until save is clicked
  const [draft, setDraft] = useState<PortfolioData | null>(data);
  const [localSaving, setLocalSaving] = useState(false);

  // Authentication configuration and session state variables
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("friedcat_admin_token"));
  const [adminUser, setAdminUser] = useState<any>(() => {
    const cached = localStorage.getItem("friedcat_admin_user");
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [discordConfig, setDiscordConfig] = useState<{ isConfigured: boolean; allowedUsers: string[]; authCallbackOrigin?: string }>({
    isConfigured: false,
    allowedUsers: []
  });

  // Query configuration and validate current cached token on mount
  useEffect(() => {
    const checkSessionAndConfig = async () => {
      try {
        const configRes = await fetch("/api/auth/config");
        if (configRes.ok) {
          const configJson = await configRes.json();
          setDiscordConfig(configJson);
        }

        if (adminToken) {
          const sessionRes = await fetch("/api/auth/session", {
            headers: { "X-Admin-Token": adminToken }
          });
          if (sessionRes.ok) {
            const sessionJson = await sessionRes.json();
            if (!sessionJson.valid) {
              // Token expired or server restarted
              localStorage.removeItem("friedcat_admin_token");
              localStorage.removeItem("friedcat_admin_user");
              setAdminToken(null);
              setAdminUser(null);
            }
          } else {
            localStorage.removeItem("friedcat_admin_token");
            localStorage.removeItem("friedcat_admin_user");
            setAdminToken(null);
            setAdminUser(null);
          }
        }
      } catch (err) {
        console.error("Administrative session check failed:", err);
      } finally {
        setAuthChecking(false);
      }
    };

    checkSessionAndConfig();
  }, [adminToken]);

  // Listen for OAuth callback result via postMessage or localStorage storage event.
  // Discord sets COOP headers that sever window.opener, so postMessage alone is unreliable.
  // The callback page writes to localStorage first, which fires 'storage' in all same-origin
  // windows regardless of browsing context group boundaries.
  useEffect(() => {
    const applyAuthResult = (data: { type: string; token?: string; user?: { id: string; username: string; avatar: string }; error?: string }) => {
      if (data?.type === "OAUTH_AUTH_SUCCESS" && data.token && data.user) {
        localStorage.setItem("friedcat_admin_token", data.token);
        localStorage.setItem("friedcat_admin_user", JSON.stringify(data.user));
        setAdminToken(data.token);
        setAdminUser(data.user);
        setAuthError(null);
      } else if (data?.type === "OAUTH_AUTH_FAILURE") {
        setAuthError(data.error || "Authentication denied.");
      }
    };

    // Primary: postMessage (works when opener is not severed)
    const handleAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        origin !== window.location.origin &&
        !origin.endsWith(".run.app") &&
        !origin.endsWith(".netlify.app") &&
        !origin.includes("localhost") &&
        !origin.includes("127.0.0.1")
      ) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" || event.data?.type === "OAUTH_AUTH_FAILURE") {
        applyAuthResult(event.data);
      }
    };

    // Fallback: localStorage storage event (fires even when COOP severs window.opener)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== "friedcat_oauth_result" || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        applyAuthResult(data);
      } catch (_) {}
      // Consume the keys so stale results don't re-trigger on future page loads
      localStorage.removeItem("friedcat_oauth_result");
      localStorage.removeItem("friedcat_oauth_ts");
    };

    window.addEventListener("message", handleAuthMessage);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const handleDiscordLogin = async () => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/discord/url");
      if (!res.ok) throw new Error("Could not construct authorization URL on express backend server.");
      const { url } = await res.json();

      // Clear any stale result before opening popup
      localStorage.removeItem("friedcat_oauth_result");
      localStorage.removeItem("friedcat_oauth_ts");

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const authWindow = window.open(
        url,
        "oauth_popup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );

      if (!authWindow) {
        alert("Authentication popup blocked! Please allow popups for this site to access authorization flow.");
        return;
      }

      // Poll localStorage every 500ms — reliable fallback when storage event doesn't fire
      const poll = setInterval(() => {
        const raw = localStorage.getItem("friedcat_oauth_result");
        if (!raw) {
          if (authWindow.closed) clearInterval(poll);
          return;
        }
        clearInterval(poll);
        localStorage.removeItem("friedcat_oauth_result");
        localStorage.removeItem("friedcat_oauth_ts");
        try {
          const data = JSON.parse(raw);
          if (data?.type === "OAUTH_AUTH_SUCCESS" && data.token && data.user) {
            localStorage.setItem("friedcat_admin_token", data.token);
            localStorage.setItem("friedcat_admin_user", JSON.stringify(data.user));
            setAdminToken(data.token);
            setAdminUser(data.user);
            setAuthError(null);
          } else if (data?.type === "OAUTH_AUTH_FAILURE") {
            setAuthError(data.error || "Authentication denied.");
          }
        } catch (_) {}
      }, 500);

      // Auto-cleanup after 10 minutes
      setTimeout(() => clearInterval(poll), 10 * 60 * 1000);
    } catch (err: any) {
      setAuthError(err.message || "Failed to initiate Discord handshake flow.");
    }
  };

  const handleBypassLogin = async () => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/bypass", { method: "POST" });
      const sessionData = await res.json();
      if (!res.ok) {
        throw new Error(sessionData?.error || "Bypass validation rejected on server.");
      }
      localStorage.setItem("friedcat_admin_token", sessionData.token);
      localStorage.setItem("friedcat_admin_user", JSON.stringify(sessionData.user));
      setAdminToken(sessionData.token);
      setAdminUser(sessionData.user);
    } catch (err: any) {
      setAuthError(err.message || "Dev bypass failed.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "X-Admin-Token": adminToken || "" }
      });
    } catch (err) {
      console.error("Sign-out request failed:", err);
    } finally {
      localStorage.removeItem("friedcat_admin_token");
      localStorage.removeItem("friedcat_admin_user");
      setAdminToken(null);
      setAdminUser(null);
    }
  };

  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white font-fredoka p-10 gap-3">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-base font-bold tracking-wider">Securing gate connection...</p>
      </div>
    );
  }

  // Gate view: if adminToken is absent, show beautiful Discord sign-in panel
  if (!adminToken) {
    return (
      <div className="max-w-md mx-auto my-8 bg-brand-white border-[3px] border-brand-red rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 font-fredoka relative z-10 animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center mx-auto shadow-md border-2 border-brand-red">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-brand-red uppercase tracking-wider">
              ADMIN CONTROL LOG IN
            </h1>
            <p className="text-[10px] text-brand-red-soft italic uppercase tracking-widest font-semibold">
              Authorized personnel credentials active query
            </p>
          </div>

          <div className="h-0.5 bg-brand-border/40 w-full my-3"></div>

          {authError && (
            <div className="p-3 bg-red-50 border-2 border-brand-red/30 text-brand-red rounded-xl text-xs font-bold leading-relaxed text-left flex gap-2 items-start animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {discordConfig.isConfigured ? (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500/20 text-emerald-800 rounded-xl text-xs font-bold leading-relaxed flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full col bg-emerald-500 animate-ping"></span>
                <span>Discord secure authentication environment active!</span>
              </div>
              
              <div className="p-3 bg-brand-cream/40 rounded-xl border border-brand-border/60 text-xs text-brand-text font-bold space-y-2">
                <span className="text-brand-red uppercase tracking-widest">Allowed Accounts:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {discordConfig.allowedUsers && discordConfig.allowedUsers.length > 0 ? (
                    discordConfig.allowedUsers.map((user) => (
                      <span key={user} className="px-2.5 py-1 bg-brand-red/15 text-brand-red rounded-full hover:scale-105 transition-all text-[11px] font-black">
                        @{user}
                      </span>
                    ))
                  ) : (
                    <span className="text-brand-red-soft italic">No individuals registered yet. Every account allowed.</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleDiscordLogin}
                className="w-full h-12 bg-[#52525b] hover:bg-[#3f3f46] text-white flex items-center justify-center gap-2.5 font-bold tracking-wider rounded-xl cursor-pointer transition-all active:translate-y-0.5 border-2 border-[#18181b] shadow-xs hover:shadow-none"
              >
                <LogIn className="w-5 h-5 text-white" />
                SIGN IN WITH DISCORD
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-amber-50 border-2 border-[#ea580c]/30 text-amber-900 rounded-xl text-xs leading-relaxed space-y-1.5 font-bold">
                <div className="flex items-center gap-2 text-brand-red">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wider">DEV ENVIRONMENT SYSTEM BYPASS</span>
                </div>
                <p className="text-brand-text font-semibold text-[11px]">
                  Configured discord client identification was not detected. Local app runs in bypass mode securely.
                </p>
              </div>

              <button
                onClick={handleBypassLogin}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 font-bold tracking-wider rounded-xl cursor-pointer transition-all active:translate-y-0.5 border-2 border-emerald-800 shadow-xs hover:shadow-none"
              >
                <Sparkles className="w-5 h-5 text-emerald-100" />
                PROCEED (DEV AUTO-BYPASS)
              </button>
            </div>
          )}

          <div className="pt-3">
            <button
              onClick={onNavigateToPortfolio}
              className="px-4 py-1.5 text-xs text-brand-text hover:text-brand-red hover:underline cursor-pointer flex items-center gap-1.5 mx-auto font-black"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO RESUME PORTFOLIO
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <p className="font-fredoka text-lg">Initializing administrative database schema...</p>
      </div>
    );
  }

  // Set updates inside draft state helper
  const updateDraft = (key: keyof PortfolioData, value: any) => {
    setDraft((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };

  const updateImageStyle = (imageKey: string, field: keyof ImageStyleConfig, value: any) => {
    setDraft((prev) => {
      if (!prev) return null;
      const currentStyles = prev.imageStyles || {};
      const targetStyle = currentStyles[imageKey] || { scale: 100, posX: 50, posY: 50, fit: "cover" };
      const updatedStyle = { ...targetStyle, [field]: value };
      return {
        ...prev,
        imageStyles: {
          ...currentStyles,
          [imageKey]: updatedStyle
        }
      };
    });
  };


  const addVtuberFullbodyRow = () => {
    if (!draft) return;
    const current = [...(draft.vtuberFullbodyRows || [])];
    current.push({ type: "New Item", price: "$0" });
    updateDraft("vtuberFullbodyRows", current);
  };

  const deleteVtuberFullbodyRow = (idx: number) => {
    if (!draft) return;
    const current = [...(draft.vtuberFullbodyRows || [])];
    current.splice(idx, 1);
    updateDraft("vtuberFullbodyRows", current);
  };

  const handleVtuberFullbodyChange = (idx: number, field: "type" | "price", value: string) => {
    if (!draft) return;
    const current = [...(draft.vtuberFullbodyRows || [])];
    if (current[idx]) {
      current[idx] = { ...current[idx], [field]: value };
      updateDraft("vtuberFullbodyRows", current);
    }
  };

  const addVtuberExtraPart = () => {
    if (!draft) return;
    const current = [...(draft.vtuberExtraParts || [])];
    current.push({ type: "New Part", art: "$0", rigging: "$0" });
    updateDraft("vtuberExtraParts", current);
  };

  const deleteVtuberExtraPart = (idx: number) => {
    if (!draft) return;
    const current = [...(draft.vtuberExtraParts || [])];
    current.splice(idx, 1);
    updateDraft("vtuberExtraParts", current);
  };

  const handleVtuberExtraPartChange = (idx: number, field: "type" | "art" | "rigging", value: string) => {
    if (!draft) return;
    const current = [...(draft.vtuberExtraParts || [])];
    if (current[idx]) {
      current[idx] = { ...current[idx], [field]: value };
      updateDraft("vtuberExtraParts", current);
    }
  };


  // Actions for Social Items
  const handleSocialChange = (index: number, field: keyof SocialItem, value: string) => {
    const arr = [...(draft.socials || [])];
    arr[index] = { ...arr[index], [field]: value };
    updateDraft("socials", arr);
  };

  const addSocial = () => {
    const arr = [...(draft.socials || [])];
    arr.push({ t: "link", u: "https://" });
    updateDraft("socials", arr);
  };

  const deleteSocial = (index: number) => {
    const arr = [...(draft.socials || [])];
    arr.splice(index, 1);
    updateDraft("socials", arr);
  };

  // Actions for Do and Dont lists
  const handleListChange = (key: "doList" | "dontList" | "tos", index: number, value: string) => {
    const arr = [...(draft[key] || [])];
    arr[index] = value;
    updateDraft(key, arr);
  };

  const addListItem = (key: "doList" | "dontList" | "tos") => {
    const arr = [...(draft[key] || [])];
    arr.push("New Specification Entry");
    updateDraft(key, arr);
  };

  const deleteListItem = (key: "doList" | "dontList" | "tos", index: number) => {
    const arr = [...(draft[key] || [])];
    arr.splice(index, 1);
    updateDraft(key, arr);
  };

  // Actions for Slide and Example lists
  const addImageArrayItem = (key: "illustSlides" | "illustExamples" | "ychExamples") => {
    const arr = [...(draft[key] || [])];
    arr.push(""); // empty preview placeholder
    updateDraft(key, arr);
  };

  const deleteImageArrayItem = (key: "illustSlides" | "illustExamples" | "ychExamples", index: number) => {
    const arr = [...(draft[key] || [])];
    arr.splice(index, 1);
    updateDraft(key, arr);
  };

  // Actions for Pricing rows
  const handlePriceRowChange = (index: number, field: keyof IllustRow, value: string) => {
    const arr = [...(draft.illustRows || [])];
    arr[index] = { ...arr[index], [field]: value };
    updateDraft("illustRows", arr);
  };

  const addPriceRow = () => {
    const arr = [...(draft.illustRows || [])];
    arr.push({ type: "NEW TYPE", rough: "$0", color: "$0" });
    updateDraft("illustRows", arr);
  };

  const deletePriceRow = (index: number) => {
    const arr = [...(draft.illustRows || [])];
    arr.splice(index, 1);
    updateDraft("illustRows", arr);
  };

  // Actions for YCH items list
  const handleYchItemChange = (index: number, field: keyof YchItem, value: string) => {
    const arr = [...(draft.ychItems || [])];
    arr[index] = { ...arr[index], [field]: value };
    updateDraft("ychItems", arr);
  };

  const addYchItem = () => {
    const arr = [...(draft.ychItems || [])];
    arr.push({ name: `YCH ${arr.length + 1}`, image: "", desc: "", price: "$20" });
    updateDraft("ychItems", arr);
  };

  const deleteYchItem = (index: number) => {
    const arr = [...(draft.ychItems || [])];
    arr.splice(index, 1);
    updateDraft("ychItems", arr);
  };

  // Primary persistent save triggers
  const executeSaveToBackend = async () => {
    setLocalSaving(true);
    try {
      await onSave(draft);
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <div id="admin_control_dashboard" className="w-full flex flex-col md:flex-row min-h-[90vh] bg-[#180e0c] text-[#f5ede0] rounded-2xl border-2 border-[#3d2018] overflow-hidden shadow-2xl relative">
      
      {/* SIDEBAR: Admin Menu Guides */}
      <div className="w-full md:w-[200px] bg-[#211410] border-r border-[#3d2018] flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-4">
          <div className="pb-3 border-b border-[#3d2018] text-center md:text-left">
            <h1 className="font-fredoka text-sm text-[#d4704a] tracking-wider uppercase">Friedcat DB</h1>
            <p className="text-[10px] text-[#9b7060] tracking-widest font-bold">DATABASE CONSOLE</p>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveMenuSec("profile")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "profile"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </button>
            
            <button
              onClick={() => setActiveMenuSec("status")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "status"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Status
            </button>
            
            <button
              onClick={() => setActiveMenuSec("socials")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "socials"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Socials
            </button>
            
            <button
              onClick={() => setActiveMenuSec("dodont")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "dodont"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Do/Don't
            </button>
            
            <button
              onClick={() => setActiveMenuSec("illust")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "illust"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              Illust CMS
            </button>
            
            <button
              onClick={() => setActiveMenuSec("ych")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "ych"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              YCH CMS
            </button>
            
            <button
              onClick={() => setActiveMenuSec("vtuber")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "vtuber"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Vtuber
            </button>
            
            <button
              onClick={() => setActiveMenuSec("tos")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "tos"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Rules TOS
            </button>
            
            <button
              onClick={() => setActiveMenuSec("contact")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                activeMenuSec === "contact"
                  ? "bg-[#d4704a]/10 border-[#d4704a] text-[#d4704a]"
                  : "border-transparent text-[#9b7060] hover:text-[#f5ede0] hover:bg-[#2c1a14]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Contact Page
            </button>
          </nav>
        </div>

        {/* View Switch Portals and Admin Logout widget */}
        <div className="p-4 border-t border-[#3d2018] space-y-3">
          {adminUser && (
            <div className="flex items-center gap-2 pb-2 border-b border-[#3d2018]/50">
              {adminUser.avatar ? (
                <img
                  src={adminUser.avatar}
                  alt={adminUser.username}
                  className="w-6 h-6 rounded-full border border-[#d4704a] shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#d4704a] flex items-center justify-center text-[10px] text-white shrink-0 font-bold uppercase font-fredoka">
                  {adminUser.username.substring(0, 2)}
                </div>
              )}
              <span className="text-[10px] uppercase text-[#9b7060] font-black tracking-wide truncate">
                @{adminUser.username}
              </span>
            </div>
          )}

          <button
            onClick={onNavigateToPortfolio}
            className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#d4704a] text-[#d4704a] font-fredoka text-[10px] uppercase tracking-wider transition-all hover:bg-[#d4704a] hover:text-[#180e0c] cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            LIVE SITE
          </button>

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#9b3523]/50 text-[#9b3523] hover:bg-[#9b3523] hover:text-white font-fredoka text-[10px] uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            LOG OUT
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: Parameter Forms Panel */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        
        {/* Top Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3d2018] mb-6">
          <div>
            <h2 className="font-fredoka text-xl text-[#d4704a] tracking-wide uppercase">
              {activeMenuSec} settings
            </h2>
            <p className="text-[11px] text-[#9b7060] font-bold uppercase tracking-widest mt-0.5">
              Edit the corresponding field parameters and save changes to server
            </p>
          </div>
          <button
            onClick={executeSaveToBackend}
            disabled={localSaving || saving}
            className="px-6 py-2.5 bg-brand-red-btn hover:bg-brand-red text-white font-fredoka text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {localSaving || saving ? "SAVING DB..." : "SAVE CONFIGS"}
          </button>
        </div>

        {/* Dynamic sub-forms view */}
        <div className="flex-1 min-h-[50vh]">

          {/* SECTION: PROFILE */}
          {activeMenuSec === "profile" && (
            <div className="space-y-6">
              
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Mascot Profile Handle</span>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Artistry Name (Human Label)</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => updateDraft("name", e.target.value)}
                    className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm focus:outline-none focus:border-[#d4704a] text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Avatar Image (Profile Mascot)</span>
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-20 h-20 bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {draft.avatarImg ? (
                      <img 
                        src={draft.avatarImg} 
                        alt="Mascot preview" 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full" 
                        style={getImageStyleHelper(draft.imageStyles?.avatarImg)}
                      />
                    ) : (
                      <span className="text-xl">&#128049;</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Avatar Image URL</label>
                    <ImageUrlInput value={draft.avatarImg || ""} onChange={(url) => updateDraft("avatarImg", url)} />
                  </div>
                </div>
                {draft.avatarImg && (
                  <ImageStyleSliders imageKey="avatarImg" draft={draft} onChange={updateImageStyle} />
                )}
              </div>


              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Commission Grouping Cards (Thumnails)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Illustration CMS Card</label>
                    <div className="aspect-video bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden flex items-center justify-center relative mb-2">
                      {draft.svcIllustThumb ? (
                        <img 
                          src={draft.svcIllustThumb} 
                          alt="Illust CMS" 
                          className="w-full h-full" 
                          style={getImageStyleHelper(draft.imageStyles?.svcIllustThumb)}
                        />
                      ) : (
                        <span className="text-2xl">&#127912;</span>
                      )}
                    </div>
                    <ImageUrlInput value={draft.svcIllustThumb || ""} onChange={(url) => updateDraft("svcIllustThumb", url)} />
                    {draft.svcIllustThumb && (
                      <ImageStyleSliders imageKey="svcIllustThumb" draft={draft} onChange={updateImageStyle} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">YCH CMS Card</label>
                    <div className="aspect-video bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden flex items-center justify-center relative mb-2">
                      {draft.svcYchThumb ? (
                        <img 
                          src={draft.svcYchThumb} 
                          alt="Ych CMS" 
                          className="w-full h-full" 
                          style={getImageStyleHelper(draft.imageStyles?.svcYchThumb)}
                        />
                      ) : (
                        <span className="text-2xl">&#127912;</span>
                      )}
                    </div>
                    <ImageUrlInput value={draft.svcYchThumb || ""} onChange={(url) => updateDraft("svcYchThumb", url)} />
                    {draft.svcYchThumb && (
                      <ImageStyleSliders imageKey="svcYchThumb" draft={draft} onChange={updateImageStyle} />
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* SECTION: STATUS */}
          {activeMenuSec === "status" && (
            <div className="space-y-6">
              
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Home Portal Status Banners</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Illustration Commission Status</label>
                    <select
                      value={draft.statusIllust}
                      onChange={(e) => updateDraft("statusIllust", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="limited">Limited</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Live2D Rigging Status</label>
                    <select
                      value={draft.statusLive2d}
                      onChange={(e) => updateDraft("statusLive2d", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="limited">Limited</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">CMS Page Section Statuses</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Illustration Grid List Status</label>
                    <select
                      value={draft.illustStatus}
                      onChange={(e) => updateDraft("illustStatus", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="limited">Limited</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">YCH Grid List Status</label>
                    <select
                      value={draft.ychStatus}
                      onChange={(e) => updateDraft("ychStatus", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="limited">Limited</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: SOCIALS */}
          {activeMenuSec === "socials" && (
            <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
              <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Social Platforms & Redirect handles</span>
              
              <div className="space-y-3">
                {draft.socials && draft.socials.map((soc, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={soc.t}
                      onChange={(e) => handleSocialChange(idx, "t", e.target.value)}
                      className="w-[120px] bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-2.5 text-xs font-bold uppercase"
                    >
                      <option value="twitter">Twitter / X</option>
                      <option value="bluesky">Bluesky</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="link">Other Site</option>
                    </select>

                    <input
                      type="url"
                      value={soc.u}
                      placeholder="Redirect link: https://..."
                      onChange={(e) => handleSocialChange(idx, "u", e.target.value)}
                      className="flex-1 bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-2.5 text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => deleteSocial(idx)}
                      className="p-2.5 hover:bg-brand-red-soft/20 text-brand-red-soft rounded-lg cursor-pointer transition-all border border-[#3d2018]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSocial}
                className="w-full border-2 border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060] hover:text-[#d4704a] rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add Social Account Row
              </button>
            </div>
          )}

          {/* SECTION: DO & DON'T */}
          {activeMenuSec === "dodont" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DO List */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#8fc46a] uppercase tracking-widest block">✓ DO LIST (Allowed Artwork)</span>
                
                <div className="space-y-2">
                  {draft.doList && draft.doList.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleListChange("doList", idx, e.target.value)}
                        className="flex-1 bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-2.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => deleteListItem("doList", idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addListItem("doList")}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#8fc46a] text-[#9b7060] hover:text-[#8fc46a] rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Row
                </button>
              </div>

              {/* DONT List */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#e66a75] uppercase tracking-widest block">✗ DON'T LIST (Restricted Artwork)</span>
                
                <div className="space-y-2">
                  {draft.dontList && draft.dontList.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleListChange("dontList", idx, e.target.value)}
                        className="flex-1 bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-2.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => deleteListItem("dontList", idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addListItem("dontList")}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#e66a75] text-[#9b7060] hover:text-[#e66a75] rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Row
                </button>
              </div>

            </div>
          )}

          {/* SECTION: ILLUSTRATION */}
          {activeMenuSec === "illust" && (
            <div className="space-y-6">
              
              {/* Description Intro text */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Illustration description notice</span>
                <textarea
                  value={draft.illustNote}
                  onChange={(e) => updateDraft("illustNote", e.target.value)}
                  rows={2}
                  className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm focus:outline-none"
                />
              </div>

              {/* Slideshow image arrays */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Slideshow list carousel (Max 3)</span>
                
                <div className="space-y-3">
                  {draft.illustSlides && draft.illustSlides.map((slide, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-14 h-10 bg-[#1c1008] border border-[#3d2018] rounded overflow-hidden flex items-center justify-center shrink-0">
                        {slide ? (
                          <img src={slide} alt="slide" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">&#127912;</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <ImageUrlInput
                          value={slide || ""}
                          onChange={(url) => { const a = [...(draft.illustSlides || [])]; a[idx] = url; updateDraft("illustSlides", a); }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteImageArrayItem("illustSlides", idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {(draft.illustSlides || []).length < 3 && (
                  <button
                    type="button"
                    onClick={() => addImageArrayItem("illustSlides")}
                    className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060]/80 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slide Image
                  </button>
                )}
              </div>

              {/* Pricing breakdown Rows matrix */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Illustration rates table</span>
                
                <div className="space-y-3">
                  {draft.illustRows && draft.illustRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        value={row.type}
                        placeholder="Type: e.g. BUST"
                        onChange={(e) => handlePriceRowChange(idx, "type", e.target.value)}
                        className="bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] p-2 text-xs rounded"
                      />
                      <input
                        type="text"
                        value={row.rough}
                        placeholder="Rough Sketch: e.g. $9+ / ฿300+"
                        onChange={(e) => handlePriceRowChange(idx, "rough", e.target.value)}
                        className="bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] p-2 text-xs rounded"
                      />
                      <input
                        type="text"
                        value={row.color}
                        placeholder="Full rendering rate"
                        onChange={(e) => handlePriceRowChange(idx, "color", e.target.value)}
                        className="bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] p-2 text-xs rounded"
                      />
                      <button
                        type="button"
                        onClick={() => deletePriceRow(idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg flex items-center justify-center cursor-pointer max-w-[40px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addPriceRow}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060]/80 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Row Rate
                </button>
              </div>

              {/* Illustration showcase examples lists */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Illustration examples gallery</span>
                
                <div className="space-y-3">
                  {draft.illustExamples && draft.illustExamples.map((src, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#1c1008] border border-[#3d2018] rounded overflow-hidden flex items-center justify-center shrink-0">
                        {src ? (
                          <img src={src} alt="Showcase upload file" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">&#127912;</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <ImageUrlInput
                          value={src || ""}
                          onChange={(url) => { const a = [...(draft.illustExamples || [])]; a[idx] = url; updateDraft("illustExamples", a); }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteImageArrayItem("illustExamples", idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addImageArrayItem("illustExamples")}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060]/80 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Artwork Showcase Slot
                </button>
              </div>

            </div>
          )}

          {/* SECTION: YCH */}
          {activeMenuSec === "ych" && (
            <div className="space-y-6">
              
              {/* Note details */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Ych description notice</span>
                <textarea
                  value={draft.ychNote}
                  onChange={(e) => updateDraft("ychNote", e.target.value)}
                  rows={2}
                  className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm focus:outline-none"
                />
              </div>

              {/* YCH active template listing items */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Active YCH items List</span>
                
                <div className="space-y-4">
                  {draft.ychItems && draft.ychItems.map((ych, idx) => (
                    <div key={idx} className="bg-[#1c1008] border border-[#3d2018] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#3d2018]/60 pb-2">
                        <span className="font-fredoka text-xs text-[#d4704a]">YCH Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => deleteYchItem(idx)}
                          className="px-2.5 py-1 text-xs text-brand-red-soft font-bold rounded hover:bg-brand-red-soft/10 cursor-pointer"
                        >
                          Remove This YCH
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#9b7060] uppercase font-bold">Template Name</label>
                          <input
                            type="text"
                            value={ych.name}
                            onChange={(e) => handleYchItemChange(idx, "name", e.target.value)}
                            className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-[#9b7060] uppercase font-bold">Base Rate</label>
                          <input
                            type="text"
                            value={ych.price}
                            onChange={(e) => handleYchItemChange(idx, "price", e.target.value)}
                            className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#9b7060] uppercase font-bold">Brief Specs Details</label>
                        <textarea
                          value={ych.desc}
                          onChange={(e) => handleYchItemChange(idx, "desc", e.target.value)}
                          rows={2}
                          className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#9b7060] uppercase font-bold">Template Layout Cover</label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#180e0c] border border-[#3d2018] rounded overflow-hidden shrink-0 flex items-center justify-center">
                            {ych.image ? (
                              <img src={ych.image} alt="YCH template preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs">&#127912;</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <ImageUrlInput
                              value={ych.image || ""}
                              onChange={(url) => handleYchItemChange(idx, "image", url)}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addYchItem}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060]/80 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add YCH Item Category
                </button>
              </div>

              {/* YCH Finished examples */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">YCH Finished examples gallery</span>
                
                <div className="space-y-3">
                  {draft.ychExamples && draft.ychExamples.map((src, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#1c1008] border border-[#3d2018] rounded overflow-hidden flex items-center justify-center shrink-0">
                        {src ? (
                          <img src={src} alt="YCH upload example" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">&#127912;</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <ImageUrlInput
                          value={src || ""}
                          onChange={(url) => { const a = [...(draft.ychExamples || [])]; a[idx] = url; updateDraft("ychExamples", a); }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteImageArrayItem("ychExamples", idx)}
                        className="p-2 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addImageArrayItem("ychExamples")}
                  className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060]/80 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Artwork Example Slot
                </button>
              </div>

            </div>
          )}

          {/* SECTION: VTUBER */}
          {activeMenuSec === "vtuber" && (
            <div className="space-y-4">
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Vtuber blueprint description details</span>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#9b7060] uppercase font-bold block">Richtext details content</label>
                  <textarea
                    value={draft.vtuberText}
                    onChange={(e) => updateDraft("vtuberText", e.target.value)}
                    rows={6}
                    className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm focus:outline-none focus:border-[#d4704a]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold block">Live2D Commission Status</label>
                    <select
                      value={draft.statusLive2d}
                      onChange={(e) => updateDraft("statusLive2d", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-xs text-[#f5ede0] rounded-lg p-2.5 focus:outline-none focus:border-[#d4704a]"
                    >
                      <option value="open">Open</option>
                      <option value="limited">Limited</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold block">Design Badge Note (e.g. "I don't do the design")</label>
                    <input
                      type="text"
                      value={draft.vtuberDesignNote || ""}
                      onChange={(e) => updateDraft("vtuberDesignNote", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-xs text-[#f5ede0] rounded-lg p-2.5 focus:outline-none focus:border-[#d4704a]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold block">Privacy Fee Banner Msg</label>
                    <input
                      type="text"
                      value={draft.vtuberPrivacyFee || ""}
                      onChange={(e) => updateDraft("vtuberPrivacyFee", e.target.value)}
                      className="w-full bg-[#1c1008] border border-[#3d2018] text-xs text-[#f5ede0] rounded-lg p-2.5 focus:outline-none focus:border-[#d4704a]"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC FULLBODY COMMISSIONS PRICE TABLE */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Fullbody Commissions Table</span>
                  <button
                    type="button"
                    onClick={addVtuberFullbodyRow}
                    className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider bg-[#3d2018]/50 text-[#d4704a] hover:bg-[#3d2018] rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.vtuberFullbodyRows && draft.vtuberFullbodyRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2.5 items-end bg-[#1c1008] border border-[#3d2018] p-3 rounded-lg relative">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] text-[#9b7060] uppercase font-semibold">Type (e.g. Art + Rigging)</label>
                        <input
                          type="text"
                          value={row.type}
                          onChange={(e) => handleVtuberFullbodyChange(idx, "type", e.target.value)}
                          className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2 focus:outline-none focus:border-[#d4704a]"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] text-[#9b7060] uppercase font-semibold">Starting Price (e.g. $716+ / ฿23,000+)</label>
                        <input
                          type="text"
                          value={row.price}
                          onChange={(e) => handleVtuberFullbodyChange(idx, "price", e.target.value)}
                          className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2 focus:outline-none focus:border-[#d4704a]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteVtuberFullbodyRow(idx)}
                        className="p-2 bg-[#180e0c] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!draft.vtuberFullbodyRows || draft.vtuberFullbodyRows.length === 0) && (
                    <p className="text-xs text-[#9b7060] italic py-2">No custom pricing types added. Default prices will be rendered on the website.</p>
                  )}
                </div>
              </div>

              {/* DYNAMIC EXTRA PARTS PRICE TABLE */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Extra Parts Commission Table</span>
                  <button
                    type="button"
                    onClick={addVtuberExtraPart}
                    className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider bg-[#3d2018]/50 text-[#d4704a] hover:bg-[#3d2018] rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Part
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.vtuberExtraParts && draft.vtuberExtraParts.map((part, idx) => (
                    <div key={idx} className="space-y-2.5 bg-[#1c1008] border border-[#3d2018] p-3 rounded-lg relative">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#9b7060] uppercase font-semibold">Part Type Name</label>
                          <input
                            type="text"
                            value={part.type}
                            onChange={(e) => handleVtuberExtraPartChange(idx, "type", e.target.value)}
                            className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2 focus:outline-none focus:border-[#d4704a]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#9b7060] uppercase font-semibold">Art price (e.g. $5 / ฿150)</label>
                          <input
                            type="text"
                            value={part.art}
                            onChange={(e) => handleVtuberExtraPartChange(idx, "art", e.target.value)}
                            className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2 focus:outline-none focus:border-[#d4704a]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#9b7060] uppercase font-semibold">Rigging price (e.g. $9 / ฿300)</label>
                          <input
                            type="text"
                            value={part.rigging}
                            onChange={(e) => handleVtuberExtraPartChange(idx, "rigging", e.target.value)}
                            className="w-full bg-[#180e0c] border border-[#3d2018] text-xs text-[#f5ede0] rounded p-2 focus:outline-none focus:border-[#d4704a]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => deleteVtuberExtraPart(idx)}
                          className="px-2.5 py-1 text-[10px] uppercase font-bold bg-[#180e0c] hover:bg-brand-red-soft/20 text-[#9b6060] rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Part
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!draft.vtuberExtraParts || draft.vtuberExtraParts.length === 0) && (
                    <p className="text-xs text-[#9b7060] italic py-2">No custom extra parts configured. Default parts will be rendered on the website.</p>
                  )}
                </div>
              </div>

              {/* VTUBER IMAGES */}
              <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-5">
                <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Live2D Commission Visual Materials</span>

                {/* 1. Main Cover Image */}
                <div>
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-16 h-20 bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {draft.vtuberMainImg ? (
                        <img 
                          src={draft.vtuberMainImg} 
                          alt="Cover Preview" 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full" 
                          style={getImageStyleHelper(draft.imageStyles?.vtuberMainImg)}
                        />
                      ) : (
                        <span className="text-xl">&#127912;</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Main Column Showcase Image URL</label>
                      <ImageUrlInput value={draft.vtuberMainImg || ""} onChange={(url) => updateDraft("vtuberMainImg", url)} />
                    </div>
                  </div>
                  {draft.vtuberMainImg && (
                    <ImageStyleSliders imageKey="vtuberMainImg" draft={draft} onChange={updateImageStyle} />
                  )}
                </div>

                <div className="h-px bg-[#3d2018]/50 w-full" />

                {/* 2. Examples Showcase images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Example Left */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Example Left Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-20 bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {draft.vtuberExample1 ? (
                          <img 
                            src={draft.vtuberExample1} 
                            alt="Ex 1 Preview" 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full" 
                            style={getImageStyleHelper(draft.imageStyles?.vtuberExample1)}
                          />
                        ) : (
                          <span className="text-sm">&#127912;</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <ImageUrlInput value={draft.vtuberExample1 || ""} onChange={(url) => updateDraft("vtuberExample1", url)} />
                      </div>
                    </div>
                    {draft.vtuberExample1 && (
                      <ImageStyleSliders imageKey="vtuberExample1" draft={draft} onChange={updateImageStyle} />
                    )}
                  </div>

                  {/* Example Right */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#9b7060] uppercase font-bold tracking-wider block">Example Right Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-20 bg-[#1c1008] border border-[#3d2018] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {draft.vtuberExample2 ? (
                          <img 
                            src={draft.vtuberExample2} 
                            alt="Ex 2 Preview" 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full" 
                            style={getImageStyleHelper(draft.imageStyles?.vtuberExample2)}
                          />
                        ) : (
                          <span className="text-sm">&#127912;</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <ImageUrlInput value={draft.vtuberExample2 || ""} onChange={(url) => updateDraft("vtuberExample2", url)} />
                      </div>
                    </div>
                    {draft.vtuberExample2 && (
                      <ImageStyleSliders imageKey="vtuberExample2" draft={draft} onChange={updateImageStyle} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TOS */}
          {activeMenuSec === "tos" && (
            <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
              <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Terms of Service points & guidelines</span>
              
              <div className="space-y-2">
                {draft.tos && draft.tos.map((term, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="font-mono text-xs text-[#d4704a] bg-[#1c1008] border border-[#3d2018] rounded px-2 py-1.5 mt-1 font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleListChange("tos", idx, e.target.value)}
                      className="flex-1 bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-2.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => deleteListItem("tos", idx)}
                      className="p-2.5 bg-[#1c1008] hover:bg-brand-red-soft/20 text-[#9b6060] rounded-lg cursor-pointer mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addListItem("tos")}
                className="w-full border border-dashed border-[#3d2018] hover:border-[#d4704a] text-[#9b7060] hover:text-[#d4704a] rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Agreement Contract Line
              </button>
            </div>
          )}

          {/* SECTION: CONTACT */}
          {activeMenuSec === "contact" && (
            <div className="bg-[#2c1a14] border border-[#3d2018] rounded-xl p-5 space-y-4">
              <span className="font-fredoka text-xs text-[#d4704a] uppercase tracking-widest block">Contact Me Page Description Text</span>
              <p className="text-[10px] text-[#9b7060]/90 leading-relaxed uppercase font-bold">
                You can customize the main message displayed in the pink "HOW TO GET IN TOUCH" section. Avoid putting email here as the mailbox icon was removed.
              </p>
              
              <div className="space-y-2">
                <textarea
                  value={draft.contactText ?? "For commissions, booking requests, or direct business inquiries, the best way to connect is to shoot me a friendly DM on my social platforms! I am active regularly and will respond as fast as possible to verify schedule openings. Please make sure you read my Terms of Service before finalizing your plan! 🐾"}
                  onChange={(e) => updateDraft("contactText", e.target.value)}
                  rows={4}
                  className="w-full bg-[#1c1008] border border-[#3d2018] text-[#f5ede0] rounded-lg p-3 text-sm focus:outline-none focus:border-[#d4704a]"
                  placeholder="Insert custom contact message here..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Floating notifications */}
        <div id="persistance_info_disclaimer" className="mt-8 p-4 bg-[#231512] border border-[#3a1d15] rounded-xl flex items-start gap-2 text-[#9b7060] rounded-lg text-xs leading-normal">
          <AlertCircle className="w-4 h-4 text-[#d4704a] mt-0.5 shrink-0" />
          <span>
            * Ensure you click the <strong>SAVE CONFIGS</strong> button at the top header to write inputs permanently to disk on the express server node. Unsaved modifications will reset on server restarts.
          </span>
        </div>

      </div>

    </div>
  );
}
