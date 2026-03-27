import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center px-3 py-1 border-2 border-border bg-primary/10 text-primary text-[11px] font-bold tracking-widest uppercase mb-6">
              Support
            </div>
            <h1 className="text-[48px] md:text-[64px] font-serif font-bold italic text-foreground leading-tight mb-8">
              Contact Us
            </h1>
            <p className="text-[20px] text-foreground/70 max-w-2xl leading-relaxed">
              Have questions about ChangeLog? Our team of interior design enthusiasts is here to help you protect your scope.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Details */}
            <div className="bg-card border-2 border-border p-8 md:p-12 neo-shadow">
              <div className="space-y-10">
                <div>
                  <h3 className="text-[14px] font-bold text-foreground/50 uppercase tracking-[0.2em] mb-4">Email Us</h3>
                  <a href="mailto:fazilshaik103@gmail.com" className="text-[24px] md:text-[32px] font-serif italic text-primary hover:underline transition-all">
                    Shortly@gmail.com
                  </a>
                </div>

                <div>
                  <h3 className="text-[14px] font-bold text-foreground/50 uppercase tracking-[0.2em] mb-4">Support Hours</h3>
                  <p className="text-[18px] font-bold text-foreground uppercase tracking-wide">
                    Monday — Friday<br />
                    9:00 AM — 6:00 PM EST
                  </p>
                </div>

              </div>
            </div>

            {/* Support Card */}
            <div className="bg-primary p-8 md:p-12 border-2 border-border neo-shadow flex flex-col justify-between text-background relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[32px] font-serif italic font-bold mb-6 text-background">Need a demo?</h3>
                <p className="text-[18px] text-background/80 mb-10 leading-relaxed font-medium">
                  Schedule a quick 15-minute call with our team to see how ChangeLog can save you hours of unbilled work.
                </p>
              </div>
              <a href="https://calendly.com/fazilshaik103/30min" className="relative z-10 w-full py-4 bg-background text-foreground text-center font-bold uppercase tracking-widest border-2 border-border hover:bg-muted transition-colors neo-shadow-sm">
                Book a Demo
              </a>

              {/* Decorative background element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 border-t-2 border-l-2 border-background/20 rotate-45 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
