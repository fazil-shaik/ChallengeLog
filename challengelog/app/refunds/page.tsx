import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center px-3 py-1 border-2 border-border bg-secondary/10 text-secondary text-[11px] font-bold tracking-widest uppercase mb-6">
              Policies
            </div>
            <h1 className="text-[48px] md:text-[64px] font-serif font-bold italic text-foreground leading-tight mb-8">
              Refunds & Cancellations
            </h1>
          </div>

          <div className="bg-card border-2 border-border p-8 md:p-12 neo-shadow">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-[20px] font-bold text-foreground mb-6 uppercase tracking-wide">
                Strict Policy
              </p>
              <div className="p-6 bg-muted/30 border-l-4 border-primary mb-8">
                <p className="text-[24px] md:text-[32px] font-serif italic text-foreground leading-relaxed">
                  &quot;No refunds and cancellations&quot;
                </p>
              </div>
              <p className="text-foreground/80 leading-relaxed text-[16px]">
                At ChangeLog, we provide a 14-day free trial to ensure our service meets your needs before any commitment. Once a subscription is active, we do not offer refunds or cancellations for the current billing period. 
              </p>
              <p className="text-foreground/80 leading-relaxed text-[16px] mt-4">
                You may manage your subscription and disable auto-renewal at any time through your dashboard settings. Your access will remain active until the end of your current billing cycle.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
