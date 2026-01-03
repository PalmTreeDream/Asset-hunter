import { Link, useLocation } from "wouter";
import { LayoutGrid, Bookmark, MessageSquare, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
}

const navItems: NavItem[] = [
  { label: "Listings", href: "/feed", icon: LayoutGrid },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "Inbox", href: "/inbox", icon: MessageSquare },
  { label: "Profile", href: "/settings", icon: User },
];

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden safe-area-pb" data-testid="mobile-nav">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href === "/feed" && location.startsWith("/asset/"));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "fill-current/10" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
