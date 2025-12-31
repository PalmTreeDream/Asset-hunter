import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Target,
  TrendingUp, 
  Mail, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Eye,
  DollarSign,
  AlertTriangle,
  Menu,
  User,
  LogOut
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

  const navItems = [
    { label: "Product", href: "/app" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
    { label: "Newsletter", href: "#newsletter" },
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
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation and newsletter options</SheetDescription>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <AssetHunterLogo size="md" />
                    <span className="font-semibold text-lg logo-text">AssetHunter</span>
                  </div>
                </div>
                
                {/* Mobile Navigation Links */}
                <nav className="flex-1 py-6">
                  <div className="space-y-1 px-4">
                    <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover-elevate cursor-pointer" data-testid="link-mobile-product">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Product</span>
                      </div>
                    </Link>
                    <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover-elevate cursor-pointer" data-testid="link-mobile-pricing">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Pricing</span>
                      </div>
                    </Link>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover-elevate cursor-pointer" data-testid="link-mobile-contact">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Contact</span>
                      </div>
                    </Link>
                    <button 
                      onClick={scrollToNewsletter}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover-elevate text-left"
                      data-testid="link-mobile-newsletter"
                    >
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Newsletter</span>
                    </button>
                  </div>
                  
                  {/* Free Newsletter */}
                  <div className="mt-6 px-4">
                    <button 
                      onClick={scrollToNewsletter}
                      className="w-full text-left px-4 py-3 rounded-xl bg-muted/30 border border-border/50 hover-elevate active-elevate-2 cursor-pointer transition-all"
                      data-testid="button-tier-free"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs rounded-full">Free Newsletter</Badge>
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground">Weekly digest of top opportunities</p>
                    </button>
                  </div>
                </nav>
                
                {/* Mobile Menu Footer CTAs */}
                <div className="p-4 border-t border-border space-y-3">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button asChild className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90" data-testid="button-mobile-dashboard">
                        <Link href="/app" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl" 
                        onClick={() => { setMobileMenuOpen(false); logout(); }}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => { setMobileMenuOpen(false); handleLogin(); }} data-testid="button-mobile-start">
                        Start free scan
                      </Button>
                      <Button variant="outline" className="w-full rounded-xl" onClick={() => { setMobileMenuOpen(false); handleLogin(); }} data-testid="button-mobile-login">
                        Log in
                      </Button>
                    </>
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
            {/* Status Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 w-fit">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-400">46 High-Distress Deals Surfaced Today</span>
              </div>
              <Badge className="rounded-full px-4 py-1.5 bg-accent/20 text-accent border-accent/30 w-fit">
                <Target className="w-3 h-3 mr-2" />
                Private equity for solo operators
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white"
            >
              Buy software businesses{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                before brokers see them.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-300 max-w-lg leading-relaxed"
            >
              We scan 14 marketplaces for abandoned apps with real revenue. 
              Stop building from scratch. Buy Day 1 income.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
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
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm"><span className="font-semibold text-white">312</span> <span className="text-slate-400">surfaced this week</span></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm"><span className="font-semibold text-orange-400">46</span> <span className="text-slate-400">high-distress</span></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm"><span className="font-semibold text-primary">9</span> <span className="text-slate-400">under review</span></span>
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
          Scanning off-market opportunities across <span className="font-semibold text-foreground">14 marketplaces</span>
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

// Featured Opportunities Section - shows real names for marketing on homepage
function FeaturedOpportunitiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const featuredAssets = [
    {
      id: "AH-47291",
      name: "AI-Powered Marketing SaaS",
      description: "B2B platform helping companies automate their marketing workflows with AI.",
      category: "SaaS",
      verified: true,
      revenue: "$420K ARR",
      profit: "$180K",
      mrr: "$35K",
      growth: "+85%",
      users: "2,400",
      icon: SiWordpress
    },
    {
      id: "AH-38472",
      name: "E-commerce Fashion Brand",
      description: "Direct-to-consumer sustainable fashion brand with strong social media presence.",
      category: "E-commerce",
      verified: true,
      revenue: "$1.2M",
      profit: "$340K",
      mrr: "$100K",
      growth: "+120%",
      users: "45K",
      icon: SiShopify
    },
    {
      id: "AH-29183",
      name: "Mobile Fitness App",
      description: "iOS and Android fitness tracking app with subscription model and engaged community.",
      category: "Mobile App",
      verified: true,
      revenue: "$280K ARR",
      profit: "$95K",
      mrr: "$23K",
      growth: "+65%",
      users: "8,500",
      icon: SiApple
    },
    {
      id: "AH-51029",
      name: "Data Analytics Platform",
      description: "Enterprise analytics solution serving Fortune 500 companies across multiple industries.",
      category: "SaaS",
      verified: true,
      revenue: "$850K ARR",
      profit: "$420K",
      mrr: "$71K",
      growth: "+95%",
      users: "150",
      icon: SiGoogle
    },
    {
      id: "AH-62841",
      name: "Content Creation Tool",
      description: "AI-powered content creation platform for marketers and content creators.",
      category: "SaaS",
      verified: true,
      revenue: "$180K ARR",
      profit: "$65K",
      mrr: "$15K",
      growth: "+140%",
      users: "1,200",
      icon: SiWordpress
    },
    {
      id: "AH-73920",
      name: "Educational Platform",
      description: "Online learning platform focusing on tech skills with video courses and certifications.",
      category: "EdTech",
      verified: true,
      revenue: "$320K",
      profit: "$125K",
      mrr: "$27K",
      growth: "+75%",
      users: "12K",
      icon: SiGithub
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAssets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="floating-card p-5 group"
              data-testid={`card-featured-${asset.id}`}
            >
              {/* Header badges */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs rounded-full bg-primary/10 text-primary border-primary/20">
                    {asset.category}
                  </Badge>
                  {asset.verified && (
                    <Badge variant="outline" className="text-xs rounded-full border-emerald-500/30 text-emerald-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              {/* Title and description */}
              <h3 className="font-semibold text-foreground text-lg mb-1" data-testid={`text-featured-name-${asset.id}`}>
                {asset.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {asset.description}
              </p>
              
              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="font-semibold text-foreground">{asset.revenue}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Profit</div>
                  <div className="font-semibold text-foreground">{asset.profit}</div>
                </div>
              </div>
              
              {/* Footer with MRR and stats */}
              <div className="flex items-end justify-between pt-3 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground">Est. MRR</div>
                  <div className="text-lg font-bold text-primary">{asset.mrr}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    {asset.growth}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {asset.users}
                  </span>
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
      title: "Skip the build",
      subtitle: "Own distribution instantly",
      description: "Getting 50,000 users is hard. Fixing broken code is easy. We find apps where someone else did the hard part - building an audience.",
      icon: Eye,
      highlight: "Apps with real, active users",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Before brokers see them",
      subtitle: "True off-market access",
      description: "We scan primary marketplaces for distress signals. No listings. No bidding wars. Just abandoned apps that nobody has approached yet.",
      icon: Target,
      highlight: "First-mover advantage",
      color: "from-primary to-accent"
    },
    {
      title: "Everything to close",
      subtitle: "From scan to offer",
      description: "Valuations, owner contact info, cold email templates, and negotiation scripts. We hand you the playbook so you can move fast.",
      icon: Mail,
      highlight: "Deals close in days, not months",
      color: "from-accent to-emerald-500"
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Own profitable software{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">without building it</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Skip the painful years of building an audience. Buy apps that already have users paying attention.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="floating-card p-8 relative group"
              data-testid={`card-value-prop-${i}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prop.color} flex items-center justify-center mb-6 shadow-soft`}>
                <prop.icon className="w-7 h-7 text-white" />
              </div>
              
              <div className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{prop.subtitle}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{prop.description}</p>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">{prop.highlight}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const sampleAssets = [
    { 
      name: "TabOrganizer Pro", 
      platform: "Chrome", 
      users: "34,200", 
      mrr: "$3,420", 
      distress: 8.2, 
      monetization: 7.8, 
      techRisk: 2.4, 
      icon: SiGooglechrome, 
      color: "text-blue-400",
      lastUpdate: "18 months ago",
      status: "MV2 Risk"
    },
    { 
      name: "ShipFast Notify", 
      platform: "Shopify", 
      users: "12,800", 
      mrr: "$2,560", 
      distress: 9.1, 
      monetization: 8.4, 
      techRisk: 1.8, 
      icon: SiShopify, 
      color: "text-green-400",
      lastUpdate: "24 months ago",
      status: "Abandoned"
    },
    { 
      name: "WP Speed Boost", 
      platform: "WordPress", 
      users: "89,000", 
      mrr: "$3,630", 
      distress: 7.6, 
      monetization: 6.9, 
      techRisk: 3.2, 
      icon: SiWordpress, 
      color: "text-sky-400",
      lastUpdate: "14 months ago",
      status: "Low Support"
    },
  ];

  const getScoreColor = (score: number, isRisk = false) => {
    if (isRisk) {
      if (score <= 3) return "text-emerald-400";
      if (score <= 6) return "text-amber-400";
      return "text-red-400";
    }
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 bg-accent/10 text-accent border-accent/20 mb-6">
            <Target className="w-3 h-3 mr-2" />
            Deal Intelligence Terminal
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Real-time{" "}
            <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">acquisition signals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Distress scores, monetization gaps, and flip potential - all calculated live.
          </p>
        </motion.div>
        
        {/* Bloomberg-style dark terminal panel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl p-6 lg:p-8 max-w-5xl mx-auto shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #0F1729 0%, #1a2744 100%)',
            border: '1px solid rgba(16, 183, 127, 0.2)'
          }}
        >
          {/* Terminal header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">ASSET_HUNTER_TERMINAL v2.1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400">SCANNING 14 MARKETPLACES</span>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Assets Tracked", value: "2,847", trend: "+124 this week" },
              { label: "Avg Distress Score", value: "7.8", trend: "High opportunity" },
              { label: "Total MRR Potential", value: "$428K", trend: "Across all assets" },
              { label: "New This Week", value: "47", trend: "Fresh opportunities" },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                <div className="text-xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-emerald-400/80">{stat.trend}</div>
              </div>
            ))}
          </div>
          
          {/* Asset rows */}
          <div className="space-y-3">
            {sampleAssets.map((asset, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Asset info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <asset.icon className={`w-6 h-6 ${asset.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{asset.name}</span>
                        <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border-red-500/30">
                          {asset.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{asset.platform}</span>
                        <span className="text-slate-600">|</span>
                        <span>{asset.users} users</span>
                        <span className="text-slate-600">|</span>
                        <span>Updated {asset.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scores grid */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Distress</div>
                        <div className={`text-lg font-bold font-mono ${getScoreColor(asset.distress)}`}>
                          {asset.distress.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">MRR Gap</div>
                        <div className={`text-lg font-bold font-mono ${getScoreColor(asset.monetization)}`}>
                          {asset.monetization.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Tech Risk</div>
                        <div className={`text-lg font-bold font-mono ${getScoreColor(asset.techRisk, true)}`}>
                          {asset.techRisk.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    {/* MRR badge */}
                    <div className="hidden sm:block pl-4 border-l border-white/10">
                      <div className="text-xs text-slate-500 mb-1">Est. MRR</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">{asset.mrr}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 font-mono">Showing 3 of 2,847 tracked assets</span>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span>Next scan:</span>
                <span className="text-emerald-400 font-mono">12:34</span>
              </div>
            </div>
            <Button asChild className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" data-testid="button-view-all">
              <Link href="/app">
                Access Full Terminal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ROIBreakdownSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const roiCards = [
    {
      title: "Micro-SaaS",
      subtitle: "The Asset",
      body: "Average distressed Chrome Extension makes $400/mo. Purchase price: $4k.",
      icon: Target
    },
    {
      title: "The Fix",
      subtitle: "The Work",
      body: "Fix the bugs. Update the listing. Automation takes over.",
      icon: TrendingUp
    },
    {
      title: "The Exit",
      subtitle: "The Return",
      body: "Resell for $12k (30x monthly profit). Net Profit: $8,000.",
      icon: DollarSign
    }
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Math is{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Simple</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One acquisition pays for a lifetime of access.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {roiCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card p-6 shadow-soft-lg bg-slate-900/40 border-white/5 relative overflow-hidden group"
              data-testid={`roi-card-${i}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <card.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{card.subtitle}</div>
                    <div className="font-semibold text-foreground text-lg">{card.title}</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const plans = [
    {
      name: "Scout",
      price: "$29",
      priceNote: "/mo",
      description: "Find opportunities",
      features: [
        "30 scans + 5 owner reveals",
        "5-axis Hunter Radar scoring",
        "MRR + valuation estimates",
        "Confidence indicators"
      ],
      cta: "Waitlist Full",
      soldOut: true,
      featured: false
    },
    {
      name: "Hunter",
      price: "$99",
      priceNote: "/mo",
      description: "Close deals",
      features: [
        "Unlimited scans + reveals",
        "30/90-day acquisition playbooks",
        "Opening offer + walk-away prices",
        "Owner intel + cold emails"
      ],
      cta: "Waitlist Full",
      soldOut: true,
      featured: false
    },
    {
      name: "Founding Member",
      price: "$149",
      priceNote: " / Lifetime",
      description: "Skip the waitlist. Never pay monthly fees. Beta Access.",
      features: [
        "Everything in Hunter",
        "Lifetime access - one payment",
        "Priority deal alerts",
        "Early access to new features"
      ],
      cta: "Secure Lifetime Access",
      soldOut: false,
      featured: true,
      spotsRemaining: 7
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
                  SOLD OUT
                </Badge>
              )}
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-white border-accent">
                  Best Value
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-foreground">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">{plan.priceNote}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle className={`w-4 h-4 shrink-0 ${plan.soldOut ? 'text-muted-foreground' : 'text-accent'}`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.featured && plan.spotsRemaining && (
                <div className="mb-4 p-3 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm tracking-wide">
                    <Sparkles className="w-4 h-4 fill-indigo-400" />
                    <span className="uppercase">{plan.spotsRemaining} Spots Remaining in this batch</span>
                  </div>
                </div>
              )}
              
              <Button 
                className={`w-full rounded-full ${
                  plan.featured 
                    ? 'bg-foreground text-background hover:bg-foreground/90 shadow-glow-white' 
                    : ''
                }`}
                variant={plan.featured ? 'default' : 'outline'}
                disabled={plan.soldOut}
                data-testid={`button-pricing-${plan.name.toLowerCase().replace(' ', '-')}`}
              >
                {plan.cta}
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
        className="max-w-2xl mx-auto"
      >
        <div className="glass-strong rounded-3xl p-8 sm:p-12 border border-border/50 shadow-soft-lg relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Mail className="w-3.5 h-3.5" />
              <span>Free Weekly Digest</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Get top opportunities delivered
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Every Sunday: 5 handpicked distressed assets with user bases, 
              MRR potential, and acquisition strategies. No spam, ever.
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
              Join the waiting list for the next batch. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </motion.div>
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
      <LiveDemoSection />
      <ROIBreakdownSection />
      <PricingSection />
      <NewsletterSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
