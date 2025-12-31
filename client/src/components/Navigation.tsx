import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Target, Settings, Menu, X, Activity, Zap, Home, CreditCard, Mail, Signal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks = [
    { href: "/app", label: "Hunt Assets", icon: Target },
    { href: "/watchlist", label: "Watchlist", icon: LayoutDashboard },
    { href: "/pulse", label: "Distress Pulse", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const secondaryLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/contact", label: "Contact Us", icon: Mail },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] lg:hidden glass-terminal rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Terminal glassmorphic sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300",
        "glass-terminal",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo and branding */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            Asset<span className="font-bold text-primary">Hunter</span>
          </span>
        </div>

        {/* Main navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" onClick={handleLinkClick}>
          {mainLinks.map((link) => {
            const isActive = location === link.href || (link.href === "/app" && location === "/hunt");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/15 text-primary border border-primary/25 font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
              >
                <link.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <p className="px-3 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-2">More</p>
            {secondaryLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm",
                    isActive 
                      ? "bg-white/5 text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status footer - Terminal style */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-lg glass-card">
            <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Signal className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Terminal Active</p>
              <p className="text-[10px] text-muted-foreground font-mono">14 mkts connected</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </nav>
    </>
  );
}
