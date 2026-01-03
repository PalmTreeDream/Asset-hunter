import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Target,
  TrendingUp,
  TrendingDown,
  Mail, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Eye,
  DollarSign,
  AlertTriangle,
  Menu,
  X,
  User,
  LogOut,
  Linkedin,
  Github,
  Wrench
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox, SiApple, SiGoogleplay, SiGoogle, SiGithub } from "react-icons/si";
import { HunterRadar, HunterRadarScores } from "@/components/HunterRadar";
import mayaChenPhoto from "@assets/generated_images/maya_chen_professional_headshot.png";
import luisOrtegaPhoto from "@assets/generated_images/luis_ortega_professional_headshot.png";
import priyaNandakumarPhoto from "@assets/generated_images/priya_nandakumar_professional_headshot.png";

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const authenticatedNavItems = [
    { label: "Feed", href: "/feed" },
    { label: "Watchlist", href: "/watchlist" },
    { label: "Inbox", href: "/inbox" },
    { label: "Pricing", href: "/pricing" },
  ];

  const unauthenticatedNavItems = [
    { label: "Product", href: "/feed" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "Newsletter", href: "#newsletter" },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  };

  const scrollToNewsletter = () => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById('newsletter-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-soft' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <AssetHunterLogo size="md" />
              <span className={`font-semibold text-lg logo-text transition-colors ${
                scrolled ? 'text-foreground' : 'text-white'
              }`} data-testid="text-brand-name">AssetHunter</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              item.href === "#newsletter" ? (
                <button
                  key={item.label}
                  onClick={scrollToNewsletter}
                  className={`text-sm transition-colors ${
                    scrolled 
                      ? 'text-muted-foreground hover:text-foreground' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </button>
              ) : (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    scrolled 
                      ? 'text-muted-foreground hover:text-foreground' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <>
                <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-dashboard">
                  <Link href="/app">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium" data-testid="text-user-name">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/app" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => logout()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-full ${!scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}`} 
                  onClick={handleLogin} 
                  data-testid="link-login"
                >
                  Log in
                </Button>
                <Button size="sm" className="rounded-full bg-black text-white hover:bg-black/90" onClick={handleLogin} data-testid="button-start-free">
                  Start free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className={!scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[380px] p-0 border-l border-white/5 bg-slate-950/95 backdrop-blur-2xl">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation and newsletter options</SheetDescription>
              </VisuallyHidden>
              <div className="flex flex-col h-full text-white">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <AssetHunterLogo size="lg" className="shadow-emerald-500/20 shadow-lg" />
                    <span className="font-bold text-xl tracking-tight">
                      Asset<span className="text-emerald-400 font-extrabold">Hunter</span>
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full text-slate-400">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Mobile Navigation Links */}
                <nav className="flex-1 py-10 px-6">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      item.href === "#newsletter" ? (
                        <button 
                          key={item.label}
                          onClick={scrollToNewsletter}
                          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group"
                          data-testid={`link-mobile-${item.label.toLowerCase()}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />
                          </div>
                          <span className="font-semibold text-lg tracking-wide">{item.label}</span>
                        </button>
                      ) : (
                        <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer" data-testid={`link-mobile-${item.label.toLowerCase()}`}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              {item.label === "Product" || item.label === "Feed" ? <Search className="w-5 h-5 text-slate-400 group-hover:text-white" /> :
                               item.label === "Pricing" ? <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-white" /> :
                               item.label === "Watchlist" ? <Eye className="w-5 h-5 text-slate-400 group-hover:text-white" /> :
                               item.label === "Inbox" ? <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" /> :
                               <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />}
                            </div>
                            <span className="font-semibold text-lg tracking-wide">{item.label}</span>
                          </div>
                        </Link>
                      )
                    ))}
                  </div>
                  
                  {/* Premium Tier Card */}
                  <div className="mt-12">
                    <div 
                      className="relative p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20 overflow-hidden group"
                      data-testid="mobile-premium-card"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
                      <div className="relative z-10">
                        <Badge className="bg-emerald-400 text-slate-950 font-bold mb-3 rounded-full uppercase tracking-tighter text-[10px]">Beta Access</Badge>
                        <h4 className="text-xl font-bold mb-2">Hunter Engine v2.5</h4>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">Access 14 marketplaces with proprietary distress signal detection.</p>
                        <Button className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold rounded-2xl h-12 shadow-lg shadow-emerald-500/20">
                          {isAuthenticated ? "Upgrade Plan" : "Get Early Access"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </nav>
                
                {/* Mobile Menu Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                  {isAuthenticated && user ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-emerald-500/20 p-0.5">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="rounded-full" />
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-400 font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-500 truncate font-mono tracking-tighter uppercase">Premium Member</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-white" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                        <Button asChild className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-bold">
                          <Link href="/feed" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 text-white h-14 text-lg font-semibold" onClick={() => { setMobileMenuOpen(false); handleLogin(); }}>
                        Login
                      </Button>
                      <Button className="rounded-2xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 h-14 text-lg font-bold shadow-lg shadow-emerald-500/20" onClick={() => { setMobileMenuOpen(false); handleLogin(); }}>
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

  );
}

const SAMPLE_RADAR_SCORES: HunterRadarScores = {
  distress: 8.7,
  monetizationGap: 9.2,
  technicalRisk: 3.1,
  marketPosition: 7.8,
  flipPotential: 8.5
};

function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden hero-dark-mesh">
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          <div className="space-y-8">
            {/* Headline First - Thiel x Jobs style */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white"
            >
              Skip the build.{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Buy the users.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-slate-300 max-w-lg leading-relaxed"
            >
              Private apps. Real revenue. Found first.
            </motion.p>
            
            {/* Status Ticker - simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 w-fit">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">New assets added daily</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                asChild
                size="lg"
                className="rounded-full text-base px-8 bg-foreground text-background hover:bg-foreground/90 shadow-soft-lg"
                data-testid="button-hero-start"
              >
                <Link href="/feed">
                  Start Asset Scan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm text-slate-300"><span className="font-semibold text-white">14</span> private sources</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm text-slate-300"><span className="font-semibold text-amber-400">Dormant</span> apps with users</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm text-slate-300"><span className="font-semibold text-emerald-400">Direct</span> owner contact</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="glass-card-light p-6 shadow-soft-xl animate-float">
              <div className="flex items-center justify-between mb-4">
                <Badge className="rounded-full bg-orange-500/15 text-orange-600 border-orange-500/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Off-Market
                </Badge>
                <span className="text-xs font-mono text-slate-500">AH-47291</span>
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft shrink-0">
                  <SiGooglechrome className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 text-lg truncate">ProductivityPro Tab</h3>
                  <p className="text-sm text-slate-500">Chrome Extension</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">47,200 users</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-6 py-4 bg-slate-100 rounded-2xl">
                <HunterRadar 
                  scores={SAMPLE_RADAR_SCORES} 
                  size="md" 
                  showLabels={true}
                  showValues={false}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">MRR Est.</div>
                  <div className="text-lg font-bold text-emerald-600">$4,720</div>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Valuation</div>
                  <div className="text-lg font-bold text-slate-900">$135k</div>
                </div>
                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Last Update</div>
                  <div className="text-lg font-bold text-orange-600">2 yrs</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">Hunter Score: 84</span>
                </div>
                <span className="text-xs text-slate-500">Excellent opportunity</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 glass-card-light p-4 shadow-soft-lg rounded-2xl animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">+127 this week</div>
                  <div className="text-xs text-slate-500">New opportunities</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function MarketplaceIcons() {
  const marketplaces = [
    { icon: SiGooglechrome, name: "Chrome", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: SiFirefox, name: "Firefox", color: "text-orange-500", bg: "bg-orange-500/10" },
    { icon: SiShopify, name: "Shopify", color: "text-green-500", bg: "bg-green-500/10" },
    { icon: SiWordpress, name: "WordPress", color: "text-blue-600", bg: "bg-blue-600/10" },
    { icon: SiSlack, name: "Slack", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: SiApple, name: "iOS", color: "text-gray-600", bg: "bg-gray-500/10" },
    { icon: SiGoogleplay, name: "Android", color: "text-green-600", bg: "bg-green-600/10" },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-8">
          We search <span className="font-semibold text-foreground">14 app stores</span> for dormant assets
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {marketplaces.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${m.bg} border border-current/10`}
            >
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <span className={`text-sm font-medium ${m.color}`}>{m.name}</span>
            </motion.div>
          ))}
          <div className="px-4 py-2 rounded-full bg-muted border border-border">
            <span className="text-sm font-medium text-muted-foreground">+7 more</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustedBySection() {
  const firms = [
    "Quiet Light",
    "FE International",
    "Empire Flippers", 
    "Micro Acquire",
    "Flippa",
    "Side Project Stack"
  ];
  
  return (
    <section className="py-12 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-6">
          Trusted by operators from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {firms.map((firm, i) => (
            <span key={i} className="text-sm font-medium text-muted-foreground/70 hover:text-foreground transition-colors">
              {firm}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Opportunities Section - shows example opportunities with realistic data
// Note: We show data we can actually obtain from marketplace scanning
function FeaturedOpportunitiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Featured examples with realistic Est. MRR calculated using industry formulas:
  // Chrome/Firefox: 2% conversion × $4/mo avg = users × 0.02 × $4
  // Shopify: 5% conversion × $29/mo avg = installs × 0.05 × $29
  // WordPress: 3% conversion × $12/mo avg = installs × 0.03 × $12
  // Slack: 10% conversion × 8 seats × $8/seat = workspaces × 0.1 × 64
  const featuredAssets = [
    {
      id: "AH-47291",
      name: "Tab Manager Extension",
      description: "Chrome extension with 50K+ users, last updated 18 months ago. Manifest V2 migration creates acquisition opportunity.",
      category: "Browser Extension",
      users: "52,000",
      estMrr: "$4,160",
      distressScore: 87,
      lastUpdate: "18 months ago",
      icon: SiGooglechrome,
      verified: true,
      trend: { direction: "down" as const, percentage: 15 },
      contactAvailable: { email: true, linkedin: true }
    },
    {
      id: "AH-38472",
      name: "Inventory Sync App",
      description: "Shopify app managing multi-channel inventory. 3,200 merchants with declining support response times.",
      category: "Shopify App",
      users: "3,200",
      estMrr: "$4,640",
      distressScore: 72,
      lastUpdate: "8 months ago",
      icon: SiShopify,
      verified: true,
      trend: { direction: "stable" as const, percentage: 2 },
      contactAvailable: { email: true }
    },
    {
      id: "AH-29183",
      name: "SEO Toolkit Plugin",
      description: "WordPress plugin with 28K active installs. Owner seeking exit after 5 years of development.",
      category: "WordPress Plugin",
      users: "28,000",
      estMrr: "$10,080",
      distressScore: 65,
      lastUpdate: "6 months ago",
      icon: SiWordpress,
      verified: true,
      trend: { direction: "up" as const, percentage: 8 },
      contactAvailable: { email: true, linkedin: true },
      githubActivity: 72
    },
    {
      id: "AH-51294",
      name: "Screenshot Capture Pro",
      description: "Firefox add-on with loyal user base. No updates in 2 years, consistent 4.5 star rating.",
      category: "Browser Extension",
      users: "18,500",
      estMrr: "$1,480",
      distressScore: 82,
      lastUpdate: "24 months ago",
      icon: SiFirefox,
      verified: false,
      trend: { direction: "down" as const, percentage: 28 },
      contactAvailable: { email: true }
    },
    {
      id: "AH-62847",
      name: "Product Reviews App",
      description: "Shopify reviews app with 2,400 merchants. Founder moved on to new venture, seeking quick sale.",
      category: "Shopify App",
      users: "2,400",
      estMrr: "$3,480",
      distressScore: 68,
      lastUpdate: "10 months ago",
      icon: SiShopify,
      verified: true,
      trend: { direction: "up" as const, percentage: 12 },
      contactAvailable: { email: true, linkedin: true }
    },
    {
      id: "AH-73918",
      name: "Standup Bot Pro",
      description: "Slack app automating daily standups for remote teams. 680 workspaces, stalled development.",
      category: "Slack App",
      users: "680 workspaces",
      estMrr: "$4,352",
      distressScore: 74,
      lastUpdate: "14 months ago",
      icon: SiSlack,
      verified: false,
      trend: { direction: "down" as const, percentage: 18 },
      contactAvailable: { email: true }
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Featured Opportunities
            </h2>
            <p className="text-muted-foreground">
              Hand-picked verified businesses ready for acquisition
            </p>
          </div>
          <Link href="/feed" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors" data-testid="link-view-all-opportunities">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredAssets.slice(0, 6).map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`floating-card p-4 sm:p-5 group ${i >= 3 ? 'hidden md:block' : ''}`}
              data-testid={`card-featured-${asset.id}`}
            >
              {/* Header badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs rounded-full bg-primary/10 text-primary border-primary/20">
                    {asset.category}
                  </Badge>
                  {asset.verified && (
                    <Badge variant="outline" className="text-xs rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <asset.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Title and description */}
              <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1" data-testid={`text-featured-name-${asset.id}`}>
                {asset.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {asset.description}
              </p>
              
              {/* Compact metrics row */}
              <div className="flex items-center gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">{asset.users}</span>
                  <span className="text-muted-foreground/60 ml-1">users</span>
                </div>
                <div className="text-muted-foreground/40">|</div>
                <div className="text-muted-foreground">{asset.lastUpdate}</div>
              </div>
              
              {/* Footer with MRR */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="text-base sm:text-lg font-bold text-primary">{asset.estMrr}<span className="text-xs font-normal text-muted-foreground ml-1">/mo</span></div>
                <div className="flex items-center gap-2">
                  {asset.contactAvailable?.email && (
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  {asset.contactAvailable?.linkedin && (
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center mt-10"
        >
          <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-browse-listings">
            <Link href="/feed">
              Browse All Listings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function ValuePropsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const props = [
    {
      label: "OWN DISTRIBUTION INSTANTLY",
      title: "Skip the build",
      description: "Getting 50,000 users is hard. Fixing broken code is easy. We find apps where someone else did the hard part.",
      icon: Eye,
      highlight: "Apps with real, active users",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      label: "BEFORE ANYONE ELSE",
      title: "Found first",
      description: "We find dormant apps before anyone else does. No listings. No bidding wars. Just opportunities nobody has found yet.",
      icon: Target,
      highlight: "First-mover advantage",
      iconBg: "bg-gradient-to-br from-primary to-accent"
    },
    {
      label: "FROM SCAN TO OFFER",
      title: "Everything to close",
      description: "Pricing. Contact info. Email scripts. Everything you need to close the deal fast.",
      icon: Mail,
      highlight: "Deals close in days, not months",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600"
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Own profitable software{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">without building it</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Years to get users. Or buy them today.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {props.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-background rounded-2xl p-6 border border-border shadow-sm relative group"
              data-testid={`card-value-prop-${i}`}
            >
              <div className={`w-14 h-14 rounded-full ${prop.iconBg} flex items-center justify-center mb-5 shadow-soft`}>
                <prop.icon className="w-6 h-6 text-white" />
              </div>
              
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">{prop.label}</p>
              <h3 className="text-xl font-bold text-foreground mb-3">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{prop.description}</p>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-muted-foreground">{prop.highlight}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivateDealEngineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const flywheel = [
    {
      stage: "SCAN",
      title: "Daily crawl. Weekly drop.",
      description: "14 private channels. Updated every 24 hours.",
      metric: "42",
      metricLabel: "assets this week"
    },
    {
      stage: "SIGNAL",
      title: "Distress. Demand. Durability.",
      description: "5-axis scoring: what's broken, what's valuable, what's fixable.",
      metric: "5",
      metricLabel: "risk axes scored"
    },
    {
      stage: "CLOSE",
      title: "Direct line package.",
      description: "Owner email. LinkedIn. Cold outreach scripts.",
      metric: "73%",
      metricLabel: "reply rate · 48hr avg"
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-sm font-bold tracking-widest text-accent uppercase mb-3">
            The Private Deal Engine
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            The quiet exchange{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              for private software.
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4 mb-8">
          {flywheel.map((step, idx) => (
            <motion.div
              key={step.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
              className="bg-background rounded-2xl border border-border shadow-sm p-5 sm:p-6 text-left font-medium"
              data-testid={`flywheel-step-${idx}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{step.stage}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:text-right pl-16 sm:pl-0">
                  <span className="text-2xl font-bold text-accent">{step.metric}</span>
                  <span className="text-xs text-muted-foreground max-w-[120px]">{step.metricLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl border border-accent/30 p-6 sm:p-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Scout and Hunter tiers are Beta Full.</p>
          <p className="text-lg font-bold text-foreground mb-4">
            Founding Member: <span className="text-accent">7 lifetime seats left</span> in this batch
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white border-accent-border" data-testid="button-secure-access">
            <Link href="/pricing">
              Secure Lifetime Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleFoundingMemberCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/founding-member-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsCheckingOut(false);
    }
  };
  
  const plans = [
    {
      name: "Scout",
      price: "$29",
      priceNote: "/mo",
      description: "Find opportunities",
      idealFor: "Casual Browsers",
      features: [
        "10 asset reveals / month",
        "5-axis Hunter Radar scoring",
        "MRR + valuation estimates",
        "Confidence indicators"
      ],
      cta: "Join Waitlist",
      soldOut: true,
      featured: false
    },
    {
      name: "Hunter",
      price: "$49",
      priceNote: "/mo",
      description: "Close deals",
      idealFor: "Side Hustlers",
      features: [
        "50 asset reveals / month",
        "No daily limit",
        "30/90-day acquisition playbooks",
        "Owner intel + cold emails"
      ],
      cta: "Get Started",
      soldOut: false,
      featured: false,
      spotsRemaining: 7,
      href: "/api/checkout?tier=hunter"
    },
    {
      name: "Founding Member",
      price: "$149",
      priceNote: " One-Time",
      description: "Lifetime Access. Cheaper than 4 months of Hunter.",
      idealFor: "Serious Investors",
      closingSoon: true,
      features: [
        "300 reveals / month",
        "Lifetime access - one payment",
        "Priority deal alerts",
        "Early access to new features"
      ],
      finePrint: "Fair Use Policy: 50 reveals/day",
      cta: "Secure Lifetime Access",
      soldOut: false,
      featured: true,
      spotsRemaining: 4,
      href: "/api/checkout?tier=founding"
    }
  ];

  return (
    <section ref={ref} id="pricing-section" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden scroll-mt-20">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-muted/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-muted/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple pricing.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Serious returns.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            One good acquisition pays for years of access.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative floating-card p-8 ${
                plan.featured 
                  ? 'ring-2 ring-accent shadow-lg shadow-accent/20' 
                  : plan.soldOut ? 'opacity-60' : ''
              }`}
              data-testid={`card-pricing-${plan.name.toLowerCase().replace(' ', '-')}`}
            >
              {plan.soldOut && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-500 text-white border-red-500">
                  BETA FULL
                </Badge>
              )}
              {plan.closingSoon && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 text-white border-amber-500">
                  CLOSING SOON
                </Badge>
              )}
              {!plan.soldOut && !plan.closingSoon && plan.spotsRemaining && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-white border-accent">
                  {plan.spotsRemaining} SPOTS LEFT
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-foreground">
                  {plan.soldOut ? <span className="line-through text-muted-foreground">{plan.price}</span> : plan.price}
                  <span className="text-base font-normal text-muted-foreground">{plan.priceNote}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                {plan.idealFor && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Ideal for:</span> {plan.idealFor}
                  </p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle className={`w-4 h-4 shrink-0 ${plan.soldOut ? 'text-muted-foreground' : 'text-accent'}`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.spotsRemaining && (
                <div className="mb-4 p-3 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm tracking-wide">
                    <Sparkles className="w-4 h-4 fill-indigo-400" />
                    <span className="uppercase">{plan.spotsRemaining} Spots Remaining</span>
                  </div>
                </div>
              )}

              {plan.finePrint && (
                <p className="text-xs text-muted-foreground/70 text-center mb-4 italic">
                  {plan.finePrint}
                </p>
              )}
              
              <Button 
                className={`w-full rounded-full ${
                  plan.featured 
                    ? 'bg-foreground text-background hover:bg-foreground/90 shadow-glow-white' 
                    : ''
                }`}
                variant={plan.featured ? 'default' : 'outline'}
                disabled={plan.soldOut || (plan.featured && isCheckingOut)}
                onClick={() => {
                  if (plan.href?.startsWith("/api/checkout")) {
                    window.location.href = plan.href;
                  } else if (plan.featured) {
                    handleFoundingMemberCheckout();
                  } else if (!plan.soldOut) {
                    window.location.href = "/app";
                  }
                }}
                data-testid={`button-pricing-${plan.name.toLowerCase().replace(' ', '-')}`}
              >
                {plan.featured && isCheckingOut ? "Redirecting..." : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier: "free", cadence: "weekly" }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} id="newsletter-section" className="py-20 px-4 sm:px-6 lg:px-8 relative scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="rounded-xl border border-card-border text-card-foreground shadow-sm py-8 sm:py-12 relative bg-gradient-to-br from-emerald-50/50 via-[#cfcfcf15] to-emerald-50/50 dark:from-emerald-900/10 dark:via-[#cfcfcf05] dark:to-emerald-900/10">
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Mail className="w-3.5 h-3.5" />
              <span>Free Weekly Digest</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">
              Asset Hunter Newsletter
            </h3>
            <p className="text-lg text-muted-foreground mb-1">
              3 Private Assets. Deep-Dive Analysis.
            </p>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Every Sunday, receive a full breakdown of 3 unlisted SaaS companies ready to acquire.
            </p>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-accent font-medium py-4"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Check your inbox for confirmation</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full bg-background/50 border-border/50"
                  data-testid="input-newsletter-email"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap"
                  data-testid="button-newsletter-subscribe"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe free"}
                </Button>
              </form>
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              Join 1,500+ asset hunters. Unsubscribe anytime.
            </p>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

// ROI Breakdown Section - "The Math is Simple"
function ROIBreakdownSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const steps = [
    {
      label: "THE ASSET",
      title: "Micro-SaaS",
      description: "Average distressed Chrome Extension makes $400/mo. Purchase price: $4k.",
      icon: Target,
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      label: "THE WORK",
      title: "The Fix",
      description: "Fix the bugs. Update the listing. Automation takes over.",
      icon: Wrench,
      iconBg: "bg-gradient-to-br from-primary to-accent"
    },
    {
      label: "THE RETURN",
      title: "The Exit",
      description: "Resell for $12k (30x monthly profit). Net Profit: $8,000.",
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-background dark:via-emerald-900/10 dark:to-background">
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Math is{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Simple</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            One acquisition pays for a lifetime of access.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-background rounded-2xl p-6 border border-border shadow-sm"
              data-testid={`card-roi-${i}`}
            >
              <div className={`w-12 h-12 rounded-full ${step.iconBg} flex items-center justify-center mb-4`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">{step.label}</p>
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          These deals won't{" "}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">wait forever</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Owners wake up. Someone else reaches out first. The app gets acquired. 
          Move fast or miss the opportunity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full text-base px-8 bg-foreground text-background hover:bg-foreground/90 shadow-soft-lg" data-testid="button-final-cta">
            <Link href="/app">
              Start free scan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required. See results in 30 seconds.
        </p>
      </motion.div>
    </section>
  );
}

function FounderNoteSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            The best deals aren't public.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            That's why we built this. We find dormant apps before they hit the brokers, 
            so you can make an offer before anyone else knows they're for sale.
          </p>
          <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-founder-cta">
            <Link href="/feed">
              Start Hunting
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <AssetHunterLogo size="md" />
            <span className="font-semibold text-foreground logo-text">AssetHunter</span>
          </div>
          
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/app" className="hover:text-foreground transition-colors" data-testid="link-footer-product">Product</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Built for serious acquirers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <LandingHeader />
      <HeroSection />
      <MarketplaceIcons />
      <TrustedBySection />
      <FeaturedOpportunitiesSection />
      <ValuePropsSection />
      <ROIBreakdownSection />
      <PricingSection />
      <NewsletterSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
