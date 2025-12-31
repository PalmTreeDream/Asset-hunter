import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Target,
  TrendingUp, 
  Users,
  DollarSign,
  Menu,
  User,
  LogOut,
  ArrowRight,
  ExternalLink,
  Loader2,
  Filter,
  ChevronDown
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox, SiApple, SiGoogleplay } from "react-icons/si";

interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  description: string;
  user_count: number;
  marketplace: string;
  mrr_potential: number;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  chrome_extension: "Chrome Extension",
  firefox_addon: "Firefox Add-on",
  shopify_app: "Shopify App",
  wordpress_plugin: "WordPress Plugin",
  slack_app: "Slack App",
  ios_app: "iOS App",
  android_app: "Android App",
};

const MARKETPLACE_ICONS: Record<string, typeof SiGooglechrome> = {
  chrome_extension: SiGooglechrome,
  firefox_addon: SiFirefox,
  shopify_app: SiShopify,
  wordpress_plugin: SiWordpress,
  slack_app: SiSlack,
  ios_app: SiApple,
  android_app: SiGoogleplay,
};

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: "Browse", href: "/feed" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <AssetHunterLogo size="md" />
              <span className="font-semibold text-lg text-slate-900">AssetHunter</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.href === "/feed" 
                    ? "text-indigo-600" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
            ) : isAuthenticated && user ? (
              <>
                <Button asChild variant="ghost" size="sm" data-testid="button-dashboard">
                  <Link href="/hunt">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/hunt" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogin} data-testid="link-login">
                  Log in
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild data-testid="button-start-free">
                  <Link href="/hunt">Start Scanning</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation</SheetDescription>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b">
                  <AssetHunterLogo size="md" />
                  <span className="font-semibold text-lg">AssetHunter</span>
                </div>
                <nav className="flex-1 py-4">
                  {navItems.map((item) => (
                    <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}>
                      <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                        <span className="font-medium text-slate-900">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t space-y-3">
                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700" data-testid="button-mobile-start-scanning">
                    <Link href="/hunt">Start Scanning</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function AssetCard({ asset, index }: { asset: Asset; index: number }) {
  const Icon = MARKETPLACE_ICONS[asset.type] || Target;
  const formatMRR = (mrr: number) => {
    if (mrr >= 1000) return `$${(mrr / 1000).toFixed(1)}k`;
    return `$${mrr}`;
  };
  
  const formatUsers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
      data-testid={`card-asset-${asset.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{asset.name}</h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {TYPE_LABELS[asset.type] || asset.type}
            </Badge>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{asset.description}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{formatUsers(asset.user_count)} users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-600 font-medium">{formatMRR(asset.mrr_potential)}/mo potential</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1" data-testid={`button-view-details-${asset.id}`}>
          <Link href={`/hunt?asset=${asset.id}`}>
            View Details
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild data-testid={`button-external-link-${asset.id}`}>
          <a href={asset.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

function FeedContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const scanMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/scan", { 
        target_url: query || "productivity"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAssets(data.assets || []);
      setHasSearched(true);
    }
  });
  
  useEffect(() => {
    scanMutation.mutate("productivity tools");
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      scanMutation.mutate(searchQuery);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Browse Distressed Software Assets
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Discover Chrome extensions, Shopify apps, and SaaS products with real user bases ready for acquisition.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search productivity, e-commerce, AI tools..."
                className="pl-10 h-12 text-base"
                data-testid="input-search"
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700"
              disabled={scanMutation.isPending}
              data-testid="button-search"
            >
              {scanMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {assets.length} assets found
            </Badge>
            {hasSearched && (
              <span className="text-sm text-slate-500">Preview mode - sign in for full access</span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="gap-2" asChild data-testid="button-advanced-filters">
            <Link href="/hunt">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Link>
          </Button>
        </div>
        
        {scanMutation.isPending && !assets.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : assets.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.slice(0, 6).map((asset, i) => (
                <AssetCard key={asset.id} asset={asset} index={i} />
              ))}
            </div>
            
            {assets.length > 6 && (
              <div className="mt-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent -top-24 pointer-events-none" />
                  <div className="relative bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {assets.length - 6}+ more assets available
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Sign in to access the full scanner with real-time results across 14 marketplaces.
                    </p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-start-full-scan">
                      <Link href="/hunt">
                        Start Full Scan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
            <p className="text-slate-600 mb-6">Try a different search term or browse our categories.</p>
            <Button onClick={() => scanMutation.mutate("chrome extension")} variant="outline" data-testid="button-try-chrome">
              Try "Chrome extensions"
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <AssetHunterLogo size="md" />
            <span className="font-semibold text-lg text-white">AssetHunter</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} AssetHunter</p>
        </div>
      </div>
    </footer>
  );
}

export default function Feed() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <FeedContent />
      <Footer />
    </div>
  );
}
