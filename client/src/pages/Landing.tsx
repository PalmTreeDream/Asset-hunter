import { useState, useEffect } from "react";
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
  Star,
  Users,
  DollarSign,
  Menu,
  User,
  LogOut,
  Play,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Send
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { SiGooglechrome, SiShopify, SiWordpress, SiSlack, SiFirefox, SiApple, SiGoogleplay, SiGoogle, SiGithub } from "react-icons/si";
import mayaChenPhoto from "@assets/generated_images/maya_chen_professional_headshot.png";
import luisOrtegaPhoto from "@assets/generated_images/luis_ortega_professional_headshot.png";
import priyaNandakumarPhoto from "@assets/generated_images/priya_nandakumar_professional_headshot.png";

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
              <span className="font-semibold text-lg text-slate-900" data-testid="text-brand-name">AssetHunter</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleLogin} data-testid="button-start-free">
                  Get Started
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
                  {isAuthenticated ? (
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700" data-testid="button-mobile-dashboard">
                      <Link href="/hunt">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleLogin} data-testid="button-mobile-start-free">
                        Get Started
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleLogin} data-testid="button-mobile-login">
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

function HeroSection() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight"
          >
            Find distressed software assets{" "}
            <span className="text-indigo-600">before anyone else</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto"
          >
            We scan 14 marketplaces for abandoned apps with real user bases. 
            Get acquisition intelligence, valuations, and owner outreach tools.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-base"
              data-testid="button-hero-browse"
            >
              <Link href="/feed">
                Browse Listings
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 text-base border-slate-300"
              onClick={handleLogin}
              data-testid="button-hero-start"
            >
              <Play className="mr-2 w-4 h-4" />
              Watch Demo
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 text-center">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-600 fill-indigo-600" />
              <span className="text-slate-900 font-semibold">4.8</span>
              <span className="text-slate-500">avg rating</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <span className="text-slate-900 font-semibold">$2.4M+</span>
              <span className="text-slate-500">assets discovered</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-slate-900 font-semibold">1,200+</span>
              <span className="text-slate-500">hunters trust us</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span className="text-slate-900 font-semibold">14</span>
              <span className="text-slate-500">marketplaces scanned</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MarketplacesSection() {
  const marketplaces = [
    { icon: SiGooglechrome, name: "Chrome" },
    { icon: SiFirefox, name: "Firefox" },
    { icon: SiShopify, name: "Shopify" },
    { icon: SiWordpress, name: "WordPress" },
    { icon: SiSlack, name: "Slack" },
    { icon: SiApple, name: "iOS" },
    { icon: SiGoogleplay, name: "Android" },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500 mb-6">Scanning opportunities across</p>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          {marketplaces.map((mp) => (
            <div key={mp.name} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
              <mp.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{mp.name}</span>
            </div>
          ))}
          <span className="text-slate-400 text-sm">+ 7 more</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: "Discover Opportunities",
      description: "Our AI scans 14 marketplaces for apps with real users but signs of distress - abandoned updates, broken support, or technical debt."
    },
    {
      icon: BarChart3,
      title: "Get Hunter Intelligence",
      description: "Receive detailed analysis including valuation estimates, MRR potential, acquisition strategy, and risk assessment with our 5-axis radar scoring."
    },
    {
      icon: FileText,
      title: "Access Playbooks",
      description: "Get cold email templates, negotiation scripts, and owner contact info to make your acquisition pitch and close deals faster."
    },
    {
      icon: Send,
      title: "Make Your Move",
      description: "Execute on opportunities with confidence. Our intel gives you the leverage to negotiate better deals on distressed assets."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            How AssetHunter Works
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From discovery to acquisition in four simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                <step.icon className="w-8 h-8" />
              </div>
              <div className="text-sm font-medium text-indigo-600 mb-2">Step {i + 1}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Distress Scoring",
      description: "Proprietary 5-axis radar identifies assets with high acquisition potential based on abandonment signals, monetization gaps, and flip potential."
    },
    {
      icon: TrendingUp,
      title: "MRR Estimates",
      description: "Data-driven revenue projections based on user counts, marketplace benchmarks, and monetization strategies."
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Technical risk analysis including Manifest V2 deprecation, platform policy changes, and maintenance requirements."
    },
    {
      icon: Zap,
      title: "Instant Valuations",
      description: "Real-time asset valuations with 3-5x ARR calculations, considering market position and growth potential."
    },
    {
      icon: Mail,
      title: "Owner Outreach",
      description: "AI-generated cold emails and negotiation scripts tailored to each asset's specific distress signals."
    },
    {
      icon: BarChart3,
      title: "Hunter Radar",
      description: "Visual 5-axis analysis covering distress level, monetization gap, technical risk, market position, and flip potential."
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Everything you need to acquire distressed assets
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive intelligence tools for micro-private equity operators
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Found a Chrome extension with 50k users that hadn't been updated in 2 years. Acquired it for $3k and now it generates $800/mo in revenue.",
      author: "Maya Chen",
      role: "Solo Operator",
      avatar: mayaChenPhoto
    },
    {
      quote: "The Hunter Intelligence reports are incredible. Saved me weeks of due diligence on my last acquisition. The cold email templates actually got responses.",
      author: "Luis Ortega",
      role: "Micro-PE Fund",
      avatar: luisOrtegaPhoto
    },
    {
      quote: "I was skeptical about finding good deals outside traditional brokers. AssetHunter surfaced a Shopify app that paid for itself in the first month.",
      author: "Priya Nandakumar",
      role: "Indie Hacker",
      avatar: priyaNandakumarPhoto
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Trusted by micro-PE operators
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Real results from real hunters
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-slate-50 rounded-xl p-6 border border-slate-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Scout",
      price: "$29",
      period: "/mo",
      description: "Start finding opportunities",
      features: [
        "30 scans per month",
        "5 owner reveals",
        "5-axis Hunter Radar",
        "MRR estimates"
      ],
      cta: "Waitlist Full",
      disabled: true,
      featured: false
    },
    {
      name: "Hunter",
      price: "$99",
      period: "/mo",
      description: "Full acquisition toolkit",
      features: [
        "Unlimited scans",
        "Unlimited owner reveals",
        "Acquisition playbooks",
        "Cold email templates"
      ],
      cta: "Waitlist Full",
      disabled: true,
      featured: false
    },
    {
      name: "Founding Member",
      price: "$149",
      period: " lifetime",
      description: "Skip the waitlist forever",
      features: [
        "Everything in Hunter",
        "Lifetime access",
        "Priority deal alerts",
        "Early access to features"
      ],
      cta: "Get Lifetime Access",
      disabled: false,
      featured: true,
      badge: "7 spots left"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            One good acquisition pays for years of access
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-white rounded-xl p-8 border ${
                plan.featured 
                  ? 'border-indigo-200 shadow-xl' 
                  : 'border-slate-200'
              } ${plan.disabled ? 'opacity-60' : ''}`}
              data-testid={`card-pricing-${plan.name.toLowerCase().replace(' ', '-')}`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white">
                  {plan.badge}
                </Badge>
              )}
              {plan.disabled && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-500 text-white">
                  SOLD OUT
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-slate-900">
                  {plan.price}
                  <span className="text-base font-normal text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle className={`w-5 h-5 shrink-0 ${plan.disabled ? 'text-slate-400' : 'text-indigo-600'}`} />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.featured 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : ''
                }`}
                variant={plan.featured ? 'default' : 'outline'}
                disabled={plan.disabled}
                asChild={!plan.disabled}
                data-testid={`button-pricing-${plan.name.toLowerCase().replace(' ', '-')}`}
              >
                {plan.disabled ? (
                  <span>{plan.cta}</span>
                ) : (
                  <Link href="/pricing">{plan.cta}</Link>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <section className="py-20 lg:py-32 bg-indigo-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Ready to find your next acquisition?
        </h2>
        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
          Join 1,200+ operators discovering distressed software assets across 14 marketplaces.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 text-base"
            asChild
            data-testid="button-cta-browse"
          >
            <Link href="/hunt">
              Start Scanning Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 text-base"
            onClick={handleLogin}
            data-testid="button-cta-demo"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AssetHunterLogo size="md" />
              <span className="font-semibold text-lg text-white">AssetHunter</span>
            </div>
            <p className="text-sm">
              The intelligence platform for acquiring distressed software assets.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/feed" className="hover:text-white transition-colors" data-testid="link-footer-browse">Browse Listings</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors" data-testid="link-footer-pricing">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors" data-testid="link-footer-contact">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hunt" className="hover:text-white transition-colors" data-testid="link-footer-hunter">Hunter Intelligence</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors" data-testid="link-footer-playbooks">Acquisition Playbooks</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors" data-testid="link-footer-terms">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors" data-testid="link-footer-privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} AssetHunter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      document.documentElement.classList.add('dark');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <MarketplacesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
