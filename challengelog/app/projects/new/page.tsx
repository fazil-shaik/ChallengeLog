"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, ChevronLeft, Check, FileText, IndianRupee } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewProject() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    briefText: "",
    originalValue: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileData, setFileData] = useState<{ url: string; fileId: string } | null>(null);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadingFile(true);
      
      const payload = new FormData();
      payload.append("file", selectedFile);
      
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: payload,
        });
        const data = await res.json();
        setFileData({ url: data.url, fileId: data.fileId });
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setUploadingFile(true);
      
      const payload = new FormData();
      payload.append("file", selectedFile);
      
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: payload,
        });
        const data = await res.json();
        if (data.url) {
            setFileData({ url: data.url, fileId: data.fileId });
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          briefText: formData.briefText,
          originalValue: parseFloat(formData.originalValue) || 0,
          briefFileUrl: fileData?.url,
          briefFileId: fileData?.fileId,
        }),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      } else {
        console.error("Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12 w-full max-w-lg mx-auto">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 border-2 transition-all duration-300 ${
              step >= num
                ? "bg-primary border-border text-background font-bold neo-shadow-sm"
                : "bg-muted border-border/50 text-foreground/50 font-bold"
            }`}
          >
            {step > num ? <Check size={18} strokeWidth={3} /> : num}
          </div>
          {num < 3 && (
            <div
              className={`w-12 h-[2px] mx-2 transition-all duration-300 ${
                step > num ? "bg-border" : "bg-border/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-6 selection:bg-secondary/30 relative">
      <div className="absolute top-6 right-6 lg:top-8 lg:right-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-2xl text-center mb-10">
        <div className="text-[12px] font-bold text-primary tracking-widest uppercase mb-4 flex items-center justify-center gap-4">
          <div className="w-8 h-[2px] bg-primary"></div>
          NEW PROJECT
          <div className="w-8 h-[2px] bg-primary"></div>
        </div>
        <h1 className="text-[48px] md:text-[56px] font-serif font-bold italic tracking-tight leading-none mb-4">
          Define Your Scope
        </h1>
        <p className="text-[16px] text-foreground/70 max-w-md mx-auto">
          Add a new client project to start tracking changes and protect your work.
        </p>
      </div>

      <div className="w-full max-w-[650px] bg-card border-2 border-border neo-shadow p-8 md:p-12 relative">
        {/* L-Shaped Corner Accent */}
        <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-[4px] border-l-[4px] border-secondary z-10 pointer-events-none fade-in"></div>

        {renderStepIndicator()}

        <div className="min-h-[300px] flex flex-col justify-center transition-all duration-500 relative bg-background border-[1.5px] border-border p-8 neo-shadow-sm mb-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-[20px] font-bold uppercase tracking-wider flex items-center gap-3">
                <div className="w-3 h-3 bg-primary"></div> Client Details
              </h2>
              <div className="space-y-5 mt-6">
                <div>
                  <label className="block text-[12px] font-bold tracking-widest uppercase text-foreground/80 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3.5 bg-card border-[1.5px] border-border focus:outline-none focus:neo-shadow-sm transition-shadow text-[15px] font-medium"
                    placeholder="E.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-widest uppercase text-foreground/80 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-3.5 bg-card border-[1.5px] border-border focus:outline-none focus:neo-shadow-sm transition-shadow text-[15px] font-medium"
                    placeholder="contact@acmecorp.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-[20px] font-bold uppercase tracking-wider flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary"></div> Project Brief
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full flex-col mt-6 border-2 border-dashed border-border p-10 flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative group"
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />
                <div className="w-14 h-14 border-2 border-primary bg-background flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform duration-300 neo-shadow-sm">
                    <Upload className="text-primary" size={24} strokeWidth={2.5} />
                </div>
                {uploadingFile ? (
                  <p className="text-[13px] font-bold tracking-widest uppercase text-foreground/70 animate-pulse">UPLOADING FILE...</p>
                ) : fileData ? (
                  <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 border-[1.5px] border-primary/30 px-4 py-2 text-[12px] tracking-widest uppercase">
                    <Check size={16} strokeWidth={3} /> FILE ATTACHED
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-foreground text-[16px] uppercase tracking-wide">Drop your contract</p>
                    <p className="text-foreground/50 text-[12px] font-medium tracking-wide mt-2">OR CLICK TO BROWSE PDF</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 my-8">
                <div className="h-[2px] bg-border/20 flex-1"></div>
                <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">OR PASTE TEXT</span>
                <div className="h-[2px] bg-border/20 flex-1"></div>
              </div>

              <div>
                <label className="block text-[12px] font-bold tracking-widest uppercase text-foreground/80 mb-2">Brief Content</label>
                <textarea
                  rows={4}
                  value={formData.briefText}
                  onChange={(e) => setFormData({ ...formData, briefText: e.target.value })}
                  className="w-full px-4 py-3.5 bg-card border-[1.5px] border-border focus:outline-none focus:neo-shadow-sm transition-shadow resize-none text-[14px] leading-relaxed"
                  placeholder="Paste your project requirements or scope definition here..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-[20px] font-bold uppercase tracking-wider flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-400 dark:bg-amber-600"></div> Value Tracker
              </h2>
              <div className="mt-6">
                <label className="block text-[12px] font-bold tracking-widest uppercase text-foreground/80 mb-2">Original Contract Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-foreground/40 font-bold text-[18px]">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.originalValue}
                    onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })}
                    className="w-full pl-9 pr-4 py-4 bg-card border-[1.5px] border-border focus:outline-none focus:neo-shadow-sm transition-shadow font-serif font-bold text-[24px]"
                    placeholder="10,000"
                  />
                </div>
                <p className="text-[12px] text-foreground/50 mt-3 font-medium">Used to calculate scope creep and total recovered value later.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3.5 border-[1.5px] font-bold text-[12px] uppercase tracking-widest transition-all ${
              step === 1 
              ? "opacity-50 cursor-not-allowed border-border/20 text-foreground/30 bg-muted/30" 
              : "border-border text-foreground bg-card hover:bg-muted neo-shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <ChevronLeft size={16} strokeWidth={3} /> BACK
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={(step === 1 && (!formData.clientName || !formData.clientEmail))}
              className={`flex items-center gap-2 px-8 py-3.5 border-[1.5px] font-bold text-[12px] uppercase tracking-widest transition-all ${
                (step === 1 && (!formData.clientName || !formData.clientEmail))
                ? "border-border/20 text-foreground/40 bg-muted/50 cursor-not-allowed"
                : "border-border text-background bg-primary hover:bg-primary-hover neo-shadow hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              CONTINUE <ChevronRight size={16} strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.originalValue}
              className={`flex items-center gap-2 px-8 py-3.5 border-[1.5px] font-bold text-[12px] uppercase tracking-widest transition-all ${
                isSubmitting || !formData.originalValue
                ? "border-border/20 text-foreground/40 bg-muted/50 cursor-not-allowed"
                : "border-border text-foreground bg-secondary hover:bg-[#D9665C]/90 dark:bg-secondary dark:hover:bg-[#C29352] dark:text-black neo-shadow hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> SAVING...</>
              ) : (
                <><Check size={16} strokeWidth={3} /> CREATE PROJECT</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
