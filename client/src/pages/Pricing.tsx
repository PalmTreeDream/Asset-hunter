import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { 
  Target,
  Check,
  ArrowRight,
  Mail,
  Zap,
  Users,
  BarChart3,
  Shield,
  CheckCircle,
  AlertTriangle,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";

function PricingHeader() {
  const navItems = [
    { label: "Product", href: "/app" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <AssetHunterLogo size="md" />
              <span className="font-semibold text-lg text-foreground logo-text">AssetHunter</span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full" data-testid="link-login">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-start-free">
              <Link href="/app">Start free</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function PricingPlans() {
  const plans = [
    {
      name: "Scout",
      price: "$29",
      period: "/mo",
      description: "Find opportunities",
      features: [
        "30 scans per month",
        "5 owner reveals",
        "5-axis Hunter Radar scoring",
        "MRR + valuation estimates",
        "Marketplace confidence indicators",
        "Risk & opportunity analysis",
        "All 14 marketplaces"
      ],
      cta: "Start free trial",
      href: "/app",
      popular: false,
      icon: Target
    },
    {
      name: "Hunter",
      price: "$99",
      period: "/mo",
      description: "Close deals",
      features: [
        "Unlimited scans + reveals",
        "The Play: 30/90-day acquisition playbooks",
        "Opening offer + walk-away prices",
        "Verified owner email + LinkedIn",
        "Owner motivation + leverage intel",
        "3 cold email scripts + timing strategy",
        "Priority support"
      ],
      cta: "Start hunting",
      href: "/app",
      popular: true,
      icon: Zap
    },
    {
      name: "Portfolio",
      price: "$249",
      period: "/mo",
      description: "Multi-asset operators",
      features: [
        "Everything in Hunter",
        "3 team seats",
        "Full API access",
        "Priority deal alerts",
        "White-label reports",
        "Dedicated account manager"
      ],
      cta: "Contact us",
      href: "mailto:support@assethunter.io",
      popular: false,
      icon: Crown
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="rounded-full px-4 py-1.5 bg-accent/10 text-accent border-accent/20 mb-6">
            Private equity for solo operators
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Invest in yourself.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Own the upside.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop paying brokers 15% of your deals. Find your own off-market opportunities and keep the returns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative glass-card rounded-3xl p-8 border ${
                  plan.popular 
                    ? 'border-accent/50 shadow-soft-xl' 
                    : 'border-border/30 shadow-soft-lg'
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-white px-4 py-1">
                    Most popular
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-accent to-emerald-400' 
                      : 'bg-gradient-to-br from-primary/20 to-accent/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild 
                  className={`w-full rounded-xl ${
                    plan.popular 
                      ? 'bg-foreground text-background hover:bg-foreground/90' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 sm:p-12 border border-border/50 shadow-soft-lg text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Free Weekly Digest</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Get top opportunities delivered
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Every Sunday: 5 handpicked distressed assets with user bases, MRR potential, and acquisition strategies.
          </p>
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-accent font-medium py-4"
            >
              <CheckCircle className="w-5 h-5" />
              <span>You're subscribed! Check your inbox.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full bg-background/50 border-border/50"
                data-testid="input-pricing-newsletter-email"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap"
                data-testid="button-pricing-newsletter-subscribe"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe free"}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-muted-foreground mt-4">
            Join 2,400+ acquirers. No spam, ever.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What's included in the free trial?",
      a: "You get full access to the Scout plan for 7 days. That includes 30 scans across all 14 marketplaces, 5-axis Hunter Radar scoring, MRR estimates, and 5 owner reveals."
    },
    {
      q: "What is the 5-axis Hunter Radar?",
      a: "Our proprietary scoring system evaluates every opportunity on 5 dimensions: Distress level, Monetization gap, Technical risk, Market position, and Flip potential. Each axis is scored 1-10 based on real marketplace data."
    },
    {
      q: "What's in 'The Play' acquisition playbooks?",
      a: "Hunter tier unlocks our 30/90-day playbooks with Quick Wins (day 1-7 improvements), Growth Levers (scaling strategies), De-risking moves, and Exit Timeline projections. Plus opening offer and walk-away prices for negotiations."
    },
    {
      q: "What marketplaces do you scan?",
      a: "We scan 14 marketplaces including Chrome Web Store, Firefox Add-ons, Shopify App Store, WordPress.org, Slack, Zapier, Atlassian, Flippa, Acquire.com, and more. Each marketplace shows confidence indicators based on available data."
    },
    {
      q: "What's included in the free newsletter?",
      a: "Every Sunday, we send you 5 handpicked distressed assets with user bases, MRR potential, and key metrics to help you find your next acquisition."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-muted-foreground">Everything you need to know about our plans and newsletter.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 border border-border/30"
              data-testid={`faq-item-${i}`}
            >
              <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingFooter() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <AssetHunterLogo size="md" />
            <span className="font-semibold text-foreground logo-text">AssetHunter</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/app" className="hover:text-foreground transition-colors">Product</Link>
            <a href="mailto:support@assethunter.io" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Built for serious acquirers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PricingHeader />
      <div className="pt-16">
        <PricingPlans />
        <NewsletterSection />
        <FAQ />
      </div>
      <PricingFooter />
    </div>
  );
}
