import React, { useState, useEffect } from "react";
import PortfolioView from "./components/PortfolioView";
import AdminView from "./components/AdminView";
import { PortfolioData } from "./types";
import portfolioJson from "../data/portfolio.json";

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(portfolioJson as PortfolioData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic router path state
  const [route, setRoute] = useState<"portfolio" | "admin">(() => {
    if (
      window.location.pathname === "/admin" || 
      window.location.hash === "#admin" ||
      window.location.hash === "#/admin"
    ) {
      return "admin";
    }
    return "portfolio";
  });

  // Fetch standard configurations from express backend server
  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) {
        throw new Error(`Could not access portfolio API: ${response.status} ${response.statusText}`);
      }
      const fetchedJson = await response.json();
      setData((prev) => ({
        ...prev,
        ...fetchedJson,
        imageStyles: {
          ...(prev?.imageStyles || {}),
          ...(fetchedJson.imageStyles || {}),
        },
      }));
    } catch (err) {
      console.error("Database connection failed:", err);
      // Keep the local fallback portfolio data so the page still renders.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();

    // Support back-and-forth history routing
    const handleLocationChange = () => {
      if (
        window.location.pathname === "/admin" || 
        window.location.hash === "#admin" ||
        window.location.hash === "#/admin"
      ) {
        setRoute("admin");
      } else {
        setRoute("portfolio");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Update URL and path route
  const navigateTo = (newRoute: "portfolio" | "admin") => {
    setRoute(newRoute);
    if (newRoute === "admin") {
      window.history.pushState({}, "", "/admin");
      window.location.hash = "admin";
    } else {
      window.history.pushState({}, "", "/");
      window.location.hash = "";
    }
  };

  // Trigger POST submission to backend persist API
  const handleSavePortfolioData = async (newData: PortfolioData) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("friedcat_admin_token") || "";
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Token": token
        },
        body: JSON.stringify(newData)
      });
      if (!response.ok) {
        throw new Error("Persist portfolio failed");
      }
      const resJson = await response.json();
      if (resJson.success) {
        setData(newData);
        triggerToast("✓ Configuration Saved successfully to Backend!");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Database error: Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div id="fullstack_cat_app" className="min-h-screen py-8 px-4 sm:px-6 relative select-none">
      
      {/* Dynamic Animated background SVG waves exact to original code styles */}
      <svg className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none h-40 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path d="M0 80 Q180 20 360 80 Q540 140 720 80 Q900 20 1080 80 Q1260 140 1440 80 L1440 160 L0 160Z" fill="#8fc46a" opacity=".7"/>
        <path d="M0 110 Q120 60 240 110 Q360 160 480 110 Q600 60 720 110 Q840 160 960 110 Q1080 60 1200 110 Q1320 160 1440 110 L1440 160 L0 160Z" fill="#6fac4e"/>
      </svg>

      {/* Floating alert notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211410] text-[#6ec99a] border-2 border-[#6ec99a] px-6 py-3.5 rounded-xl font-fredoka text-xs tracking-wider uppercase font-bold shadow-2xl animate-bounceFast">
          {toastMessage}
        </div>
      )}

      {/* Render matching view base on active route state */}
      {route === "portfolio" ? (
        <PortfolioView 
          data={data} 
          loading={loading} 
          onNavigateToAdmin={() => navigateTo("admin")} 
        />
      ) : (
        <div className="max-w-[1000px] mx-auto relative z-10">
          <AdminView 
            data={data} 
            onSave={handleSavePortfolioData} 
            onNavigateToPortfolio={() => navigateTo("portfolio")} 
            saving={saving}
          />
        </div>
      )}

      {/* Retro hand-drawn background noise assets */}
      <div className="text-center text-white/40 font-mono text-[9px] font-black uppercase tracking-[0.25em] relative z-10 mt-12 select-none select-all pointer-events-none select-all">
        © 2026 Friedcat • Draw to live • Live to draw • Active Port: 3000 Node Container
      </div>

    </div>
  );
}
