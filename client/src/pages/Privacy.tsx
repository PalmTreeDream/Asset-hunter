import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AssetHunterLogo } from "@/components/AssetHunterLogo";

export default function Privacy() {
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
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 28, 2025</p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                AssetHunter.io ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our Service. 
                Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Account information: email address, name, company name</li>
                <li>Payment information: processed securely through Stripe (we do not store card details)</li>
                <li>Usage data: searches, saved assets, watchlist items, scan history</li>
                <li>Communication data: messages sent through contact forms or support</li>
                <li>Newsletter preferences: subscription tier, cadence, filter settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Automatically Collected Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you access our Service, we automatically collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Device information: browser type, operating system, device identifiers</li>
                <li>Log data: IP address, access times, pages viewed, referring URL</li>
                <li>Cookies and similar technologies for session management and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send newsletters and marketing communications (with your consent)</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues or fraud</li>
                <li>Personalize your experience and deliver relevant content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With service providers who assist in operating our Service (Stripe, email providers)</li>
                <li>To comply with legal obligations or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. This includes encryption of 
                data in transit (HTTPS), secure database storage, and regular security assessments. However, no 
                method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide 
                you services. We will retain and use your information as necessary to comply with legal obligations, 
                resolve disputes, and enforce our agreements. You may request deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access: Request a copy of your personal data</li>
                <li>Correction: Request correction of inaccurate data</li>
                <li>Deletion: Request deletion of your personal data</li>
                <li>Portability: Request transfer of your data to another service</li>
                <li>Opt-out: Unsubscribe from marketing communications</li>
                <li>Restriction: Request limitation of processing in certain cases</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@assethunter.io.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to collect and track information about your 
                activity on our Service. You can instruct your browser to refuse all cookies or indicate when 
                a cookie is being sent. However, some features of our Service may not function properly without 
                cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites or services that are not operated by us. 
                We have no control over and assume no responsibility for the content, privacy policies, or 
                practices of any third-party sites or services. We encourage you to review the privacy policies 
                of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If we become aware that we have collected personal 
                data from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of 
                residence. These countries may have different data protection laws. By using our Service, you 
                consent to the transfer of information to the United States and other countries.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">13. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at{" "}
                <a href="mailto:privacy@assethunter.io" className="text-primary hover:underline">
                  privacy@assethunter.io
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/terms">Terms of Service</Link>
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
