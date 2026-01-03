import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
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
  Crown,
  Sparkles
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
  const { toast } = useToast();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("scout");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/waitlist", { 
        email: waitlistEmail, 
        tier: selectedTier 
      });
      const data = await res.json();
      
      if (res.ok) {
        toast({ 
          title: "You're on the list!", 
          description: "We'll notify you when a spot opens up." 
        });
        setShowWaitlistModal(false);
        setWaitlistEmail("");
      } else if (res.status === 409) {
        toast({ 
          title: "Already registered", 
          description: data.message || "You're already on the waitlist!" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: data.message || "Failed to join waitlist", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      toast({ 
        title: "Error", 
        description: "Failed to join waitlist. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      name: "Scout",
      price: "$29",
      period: "/mo",
      description: "Find opportunities",
      idealFor: "Casual Browsers",
      features: [
        "10 asset reveals / month",
        "5-axis Hunter Radar scoring",
        "MRR + valuation estimates",
        "Confidence indicators"
      ],
      cta: "Join Waitlist",
      href: "/waitlist",
      popular: false,
      soldOut: true,
      icon: Target
    },
    {
      name: "Hunter",
      price: "$49",
      period: "/mo",
      description: "Close deals",
      idealFor: "Side Hustlers",
      features: [
        "50 asset reveals / month",
        "No daily limit",
        "30/90-day acquisition playbooks",
        "Owner intel + cold emails"
      ],
      cta: "Get Started",
      href: "/api/checkout?tier=hunter",
      popular: false,
      soldOut: false,
      spotsRemaining: 7,
      icon: Zap
    },
    {
      name: "Founding Member",
      price: "$149",
      period: " One-Time",
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
      href: "/api/checkout?tier=founding",
      popular: true,
      soldOut: false,
      spotsRemaining: 4,
      icon: Crown
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple pricing.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Serious returns.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One good acquisition pays for years of access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative glass-card rounded-3xl p-8 border ${
                  plan.popular 
                    ? 'ring-2 ring-accent shadow-lg shadow-accent/20' 
                    : plan.soldOut ? 'opacity-60 border-border/30' : 'border-border/30 shadow-soft-lg'
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
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
                    <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  {plan.idealFor && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Ideal for:</span> {plan.idealFor}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
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
                    plan.popular 
                      ? 'bg-foreground text-background hover:bg-foreground/90' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => {
                    if (plan.soldOut) {
                      // Open waitlist modal
                      setSelectedTier(plan.name.toLowerCase());
                      setShowWaitlistModal(true);
                    } else if (plan.href.startsWith("/api/checkout")) {
                      window.location.href = plan.href;
                    } else if (plan.href === "/app") {
                      window.location.href = "/app";
                    }
                  }}
                  data-testid={`button-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Waitlist Modal */}
      <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Waitlist</DialogTitle>
            <DialogDescription>
              We'll notify you as soon as a spot opens up.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              required
              data-testid="input-waitlist-email"
            />
            <Button 
              type="submit" 
              className="w-full rounded-full" 
              disabled={isSubmitting}
              data-testid="button-waitlist-submit"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
      q: "How many reveals do I get?",
      a: "Scout includes 10 reveals, Hunter includes 50 reveals/month with no daily limits, and Founding Member includes 300 reveals/month with a 50/day fair use limit."
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
