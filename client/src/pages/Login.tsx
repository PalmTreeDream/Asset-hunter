import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch('/api/session/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem('userEmail', email.toLowerCase().trim());
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to send login link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="md" />
                <span className="font-semibold text-lg text-foreground logo-text">AssetHunter</span>
              </div>
            </Link>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {submitted ? "Check your email" : "Log in to AssetHunter"}
            </CardTitle>
            <CardDescription>
              {submitted 
                ? "We sent you a secure login link. Click it to access your account."
                : "Enter your email and we'll send you a secure login link."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-accent py-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Login link sent to {email}</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive it? Check your spam folder or{" "}
                  <button 
                    onClick={() => setSubmitted(false)} 
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !email.includes("@")}
                  data-testid="button-login-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send login link
                    </>
                  )}
                </Button>
              </form>
            )}
            
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline" data-testid="link-signup">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
