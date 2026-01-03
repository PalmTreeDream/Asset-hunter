import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Target, Settings, Menu, X, Activity, Zap, Home, CreditCard, Mail, MessageSquare, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const authenticatedLinks = [
    { href: "/feed", label: "Hunt Assets", icon: Target },
    { href: "/watchlist", label: "Watchlist", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const unauthenticatedLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/contact", label: "Contact Us", icon: Mail },
  ];

  const links = isAuthenticated ? authenticatedLinks : unauthenticatedLinks;

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] lg:hidden glass-strong rounded-xl border border-white/10"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Premium glassmorphic sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-all duration-500 ease-in-out",
        "bg-slate-950/80 backdrop-blur-xl border-r border-white/5 shadow-2xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo and branding */}
        <div className="p-8 flex items-center gap-3">
          <AssetHunterLogo size="lg" className="shadow-emerald-500/20 shadow-lg" />
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Asset<span className="text-emerald-400 font-extrabold">Hunter</span>
          </span>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto" onClick={handleLinkClick}>
          {links.map((link) => {
            const isActive = location === link.href || (link.href === "/feed" && location.startsWith("/asset/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-5 bg-emerald-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-105")} />
                <span className="text-sm tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Status/User footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover-elevate transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.firstName || 'Hunter'}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate uppercase tracking-widest">Premium Member</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors h-8 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Guest Terminal</p>
                <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Limited Discovery</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
