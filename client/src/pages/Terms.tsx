import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center gap-2 cursor-pointer">
                <AssetHunterLogo size="md" />
                <span className="font-semibold text-lg text-foreground logo-text">AssetHunter</span>
              </div>
            </Link>
            <Button asChild variant="ghost" size="sm" className="rounded-full" data-testid="link-back">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 28, 2025</p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using AssetHunter.io ("Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our Service. AssetHunter reserves the right 
                to update these terms at any time, and your continued use of the Service constitutes acceptance of 
                any modifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                AssetHunter.io is a software-as-a-service platform that helps users discover, analyze, and evaluate 
                digital assets including browser extensions, apps, and SaaS products across multiple marketplaces. 
                Our Hunter Intelligence engine provides AI-powered analysis and acquisition insights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must create an account. You are responsible for maintaining the 
                confidentiality of your account credentials and for all activities that occur under your account. 
                You must provide accurate and complete information when creating your account and keep it updated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Subscription and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Paid subscriptions are billed monthly or annually as selected. All payments are processed securely 
                through Stripe. Subscriptions automatically renew unless cancelled before the renewal date. Refunds 
                are handled on a case-by-case basis. You may cancel your subscription at any time through your 
                account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Scrape or collect data in violation of marketplace terms</li>
                <li>Harass, spam, or harm asset owners or other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Data and Analysis Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate data and analysis, AssetHunter does not guarantee the accuracy, 
                completeness, or reliability of any information provided through the Service. Hunter Intelligence 
                estimates are for informational purposes only and should not be solely relied upon for business decisions. 
                Users should conduct their own due diligence before making any acquisition decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of the Service, including but not limited to text, graphics, 
                logos, and software, are owned by AssetHunter and are protected by intellectual property laws. 
                You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ASSETHUNTER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR 
                BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless AssetHunter, its officers, directors, employees, and agents 
                from any claims, damages, losses, or expenses arising from your use of the Service or violation of 
                these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. 
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                United States, without regard to its conflict of law provisions. Any disputes arising under these 
                Terms shall be resolved in the courts of Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:legal@assethunter.io" className="text-primary hover:underline">
                  legal@assethunter.io
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
