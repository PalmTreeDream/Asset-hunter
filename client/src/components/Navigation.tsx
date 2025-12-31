import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Target, Settings, Menu, X, Activity, Zap, Home, CreditCard, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";

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
        className="fixed top-4 left-4 z-[60] lg:hidden glass rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Light glassmorphic sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300",
        "glass-strong shadow-soft-lg",
        "border-r border-border/50",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo and branding */}
        <div className="p-6 flex items-center gap-3">
          <AssetHunterLogo size="lg" />
          <span className="font-display font-bold text-xl tracking-tight logo-text">
            Asset<span className="font-extrabold">Hunter</span>
          </span>
        </div>

        {/* Main navigation links */}
        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" onClick={handleLinkClick}>
          {mainLinks.map((link) => {
            const isActive = location === link.href || (link.href === "/app" && location === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-soft" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
              >
                <link.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-105")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-border/50">
            <p className="px-4 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">More</p>
            {secondaryLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-sm",
                    isActive 
                      ? "bg-muted text-foreground font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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

        {/* Status footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Terminal Active</p>
              <p className="text-xs text-muted-foreground font-mono">14 mkts connected</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </nav>
    </>
  );
}
