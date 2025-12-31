import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Loader2,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ContactHeader() {
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
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-product">
              Product
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-pricing">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm text-foreground font-medium" data-testid="link-nav-contact">
              Contact
            </Link>
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

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24-48 hours."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <ContactHeader />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge className="rounded-full px-4 py-1.5 bg-accent/10 text-accent border-accent/20">
              <MessageSquare className="w-3 h-3 mr-2" />
              Let's talk
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Questions? <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">We're here.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exploring micro-acquisitions? Curious about a specific deal? Our team responds within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Send a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24-48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Message Sent!</h3>
                  <p className="text-muted-foreground mt-1">
                    We'll get back to you within 24-48 hours.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    data-testid="input-contact-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    data-testid="input-contact-message"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitMutation.isPending}
                  data-testid="button-contact-submit"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Direct Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a 
                href="mailto:hello@assethunter.io" 
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">hello@assethunter.io</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enterprise</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Need custom integrations, API access, or white-label solutions?
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">View Syndicate Plan</Link>
              </Button>
            </CardContent>
          </Card>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
