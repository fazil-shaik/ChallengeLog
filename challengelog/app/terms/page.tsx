import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
              Terms of Service
            </h1>
          </div>

          <div className="bg-card border-2 border-border p-8 md:p-12 neo-shadow">
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">1. Acceptance of Terms</h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing and using ChangeLog, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">2. Use License</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We grant you a personal, non-exclusive, non-transferable license to use our platform for your interior design business purposes. You agree not to reverse engineer, decompile, or attempt to extract the source code of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">3. Accuracy of Analysis</h2>
                <p className="text-foreground/80 leading-relaxed p-6 bg-secondary/5 border-l-4 border-secondary font-medium italic">
                  ChangeLog's AI-powered scope detection is an assistive tool. While we strive for 100% accuracy, the final responsibility for contract interpretation and client billing lies with the user.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">4. Intellectual Property</h2>
                <p className="text-foreground/80 leading-relaxed">
                  All content, branding, and proprietary algorithms on ChangeLog are the intellectual property of ChangeLog. All rights reserved.
                </p>
              </section>

              <section>
                <h2 className="text-[20px] font-bold text-foreground uppercase tracking-wider mb-4">5. Governing Law</h2>
                <p className="text-foreground/80 leading-relaxed">
                  These terms are governed by and construed in accordance with the laws of the state of New York, United States, without regard to its conflict of law provisions.
                </p>
              </section>

              <div className="pt-10 border-t border-border mt-10">
                <p className="text-[14px] font-bold text-foreground/50 uppercase tracking-widest">
                  Last Updated: March 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
