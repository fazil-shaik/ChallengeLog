"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, ChevronLeft, Check, FileText, IndianRupee } from "lucide-react";

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
    <div className="flex items-center justify-center gap-4 mb-10 w-full max-w-lg mx-auto">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
              step >= num
                ? "bg-slate-900 text-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {step > num ? <Check size={18} /> : num}
          </div>
          {num < 3 && (
            <div
              className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                step > num ? "bg-slate-900" : "bg-slate-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center py-12 px-4 selection:bg-slate-200">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
        <h1 className="text-3xl font-extrabold tracking-tight text-center mb-2 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Create New Project
        </h1>
        <p className="text-slate-500 text-center mb-10 font-medium">Add a new client project to your workspace</p>
        
        {renderStepIndicator()}

        <div className="min-h-[300px] flex flex-col justify-center transition-all duration-500 relative">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-2"><div className="w-2 h-6 bg-slate-900 rounded-sm"></div> Client Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all outline-none font-medium placeholder:font-normal"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all outline-none font-medium placeholder:font-normal"
                    placeholder="contact@acmecorp.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-2"><div className="w-2 h-6 bg-indigo-600 rounded-sm"></div> Project Brief</h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full flex-col mt-4 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer relative group"
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />
                <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="text-indigo-600" size={28} />
                </div>
                {uploadingFile ? (
                  <p className="font-semibold text-slate-600 animate-pulse">Uploading file...</p>
                ) : fileData ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-full">
                    <Check size={18} /> File Uploaded: {file?.name}
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-slate-800 text-lg">Drop your brief here</p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse PDF files</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">OR</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Brief Text</label>
                <textarea
                  rows={4}
                  value={formData.briefText}
                  onChange={(e) => setFormData({ ...formData, briefText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all outline-none resize-none font-medium placeholder:font-normal"
                  placeholder="Paste project requirements here..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-2"><div className="w-2 h-6 bg-emerald-500 rounded-sm"></div> Budget & Value</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Original Value ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.originalValue}
                    onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all outline-none font-bold text-lg"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              step === 1 
              ? "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50" 
              : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm"
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={(step === 1 && (!formData.clientName || !formData.clientEmail))}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                (step === 1 && (!formData.clientName || !formData.clientEmail))
                ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95"
              }`}
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.originalValue}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isSubmitting || !formData.originalValue
                ? "bg-emerald-100 text-emerald-400 shadow-none cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Check size={20} /> Create Project</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
