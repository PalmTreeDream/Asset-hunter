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
    { label: "Product", href: "/feed" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              <AssetHunterLogo size="md" />
              <span className="font-semibold text-lg text-white">AssetHunter</span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-start-free">
              <Link href="/feed">Start hunting</Link>
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
      cta: "Sold Out",
      href: "#",
      popular: false,
      soldOut: true,
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
      cta: "Sold Out",
      href: "#",
      popular: false,
      soldOut: true,
      icon: Zap
    },
    {
      name: "Founding Member",
      price: "$149",
      period: "Lifetime",
      description: "One-time access. Forever.",
      features: [
        "Unlimited asset unlocks",
        "Full Hunter Intelligence",
        "Direct owner contact",
        "Acquisition playbooks",
        "Private deal flow",
        "Lifetime updates",
        "No monthly fees"
      ],
      cta: "Secure Lifetime Access",
      href: "/feed",
      popular: true,
      soldOut: false,
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Invest in yourself.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
              Own the upside.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Stop paying brokers 15% of your deals. Find your own off-market opportunities and keep the returns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative bg-slate-900 rounded-3xl p-8 ${
                  plan.popular 
                    ? 'border-2 border-accent/50 shadow-2xl shadow-accent/10' 
                    : plan.soldOut 
                      ? 'border border-slate-700/50 opacity-75' 
                      : 'border border-slate-800'
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-white px-4 py-1">
                    Limited Time Founding Offer
                  </Badge>
                )}
                {plan.soldOut && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-600 text-slate-300 px-4 py-1">
                    Sold Out
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                      : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.soldOut ? 'text-slate-500 line-through' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${plan.soldOut ? 'text-slate-600' : 'text-accent'}`} />
                      <span className={`text-sm ${plan.soldOut ? 'text-slate-500' : 'text-slate-200'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild={!plan.soldOut}
                  disabled={plan.soldOut}
                  className={`w-full rounded-xl ${
                    plan.popular 
                      ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20' 
                      : plan.soldOut
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                  data-testid={`button-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
                >
                  {plan.soldOut ? (
                    <span>{plan.cta}</span>
                  ) : (
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Free Weekly Digest</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
            Get top opportunities delivered
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
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
                className="flex-1 rounded-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-accent transition-colors"
                data-testid="input-pricing-newsletter-email"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-full bg-accent text-white hover:bg-accent/90 whitespace-nowrap"
                data-testid="button-pricing-newsletter-subscribe"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe free"}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-slate-500 mt-4">
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
      q: "What is the Founding Member lifetime plan?",
      a: "It's a one-time payment for perpetual access to AssetHunter. You get every feature we build, forever, with no recurring monthly or annual fees."
    },
    {
      q: "What is the 5-axis Hunter Radar?",
      a: "Our proprietary scoring system evaluates every opportunity on 5 dimensions: Distress level, Monetization gap, Technical risk, Market position, and Flip potential. Each axis is scored 1-10 based on real marketplace data."
    },
    {
      q: "What's in the acquisition playbooks?",
      a: "Each deal comes with a strategy for the first 30 and 90 days: Quick Wins (day 1-7 improvements), Growth Levers (scaling strategies), De-risking moves, and Exit Timeline projections."
    },
    {
      q: "What marketplaces do you scan?",
      a: "We scan 14 marketplaces including Chrome Web Store, Firefox Add-ons, Shopify App Store, WordPress.org, Slack, Zapier, Atlassian, Flippa, Acquire.com, and more."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Frequently asked questions</h2>
          <p className="text-slate-400">Everything you need to know about our Founding Member offer.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800"
              data-testid={`faq-item-${i}`}
            >
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-400">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingFooter() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <AssetHunterLogo size="md" />
            <span className="font-semibold text-white">AssetHunter</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/feed" className="hover:text-white transition-colors">Terminal</Link>
            <a href="mailto:support@assethunter.io" className="hover:text-white transition-colors">Contact</a>
          </div>
          
          <p className="text-sm text-slate-500">
            Built for serious acquirers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
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
