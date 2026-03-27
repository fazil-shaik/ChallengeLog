import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center px-3 py-1 border-2 border-border bg-primary/10 text-primary text-[11px] font-bold tracking-widest uppercase mb-6">
              Legal
            </div>
            <h1 className="text-[48px] md:text-[64px] font-serif font-bold italic text-foreground leading-tight mb-8">
              Privacy Policy
            </h1>
          </div>

          <div className="bg-card border-2 border-border p-8 md:p-12 neo-shadow">
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">1. Introduction</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We value your privacy. This Privacy Policy explains how ChangeLog ("we," "us," or "our") collects, uses, and protects your information when you use our website and services.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">2. Information We Collect</h2>
                <div className="space-y-4">
                  <p className="text-foreground/80 leading-relaxed font-bold italic">
                    — Personal Information
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    We collect your email, name, and billing information when you register for an account. We also store any contract data or change orders you upload to provide our analysis services.
                  </p>
                  <p className="text-foreground/80 leading-relaxed font-bold italic">
                    — Usage Data
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    We collect standard analytics data including IP addresses, browser types, and interaction history to improve our platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">3. Data Usage</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Your data is used solely to provide and enhance the ChangeLog service. We do not sell your personal data to third parties. Contract analysis is performed securely using our internal AI models or trusted partners like Google Gemini and Groq.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">4. Security</h2>
                <p className="text-foreground/80 leading-relaxed border-2 border-border p-6 bg-muted/20">
                  We implement industry-standard security measures to protect your information. All data is encrypted in transit and at rest.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">5. Your Rights</h2>
                <p className="text-foreground/80 leading-relaxed">
                  You have the right to access, correct, or delete your personal information at any time. You can manage your data directly through your dashboard or contact us for assistance.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
