import React, { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  User,
  Building2,
  Pill,
  ShieldAlert,
  Download,
  Plus,
} from "lucide-react";
import { Language, HealthDocument, DocumentCategory } from "../types";
import { StorageManager } from "../utils/storage";

interface DocumentOrganizerProps {
  documents: HealthDocument[];
  language: Language;
  onDocumentAdded: (newDoc: HealthDocument) => void;
  isOffline: boolean;
}

export const DocumentOrganizer: React.FC<DocumentOrganizerProps> = ({
  documents,
  language,
  onDocumentAdded,
  isOffline,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(documents[0] || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Upload Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Prescription");
  const [doctorName, setDoctorName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [ocrRawText, setOcrRawText] = useState("");

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== "all" && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.doctorName?.toLowerCase().includes(q) ||
        doc.facilityName?.toLowerCase().includes(q) ||
        doc.extractedSummary?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimulateExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    try {
      let extractedData: any = null;

      if (!isOffline && ocrRawText.trim()) {
        const res = await fetch("/api/extract-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentText: ocrRawText || `Prescription for ${title}, prescribed by ${doctorName || "Dr. Srinivas Rao"} at ${facilityName || "Bhoothpur PHC"}`,
            category,
          }),
        });
        if (res.ok) {
          extractedData = await res.json();
        }
      }

      const newDoc: HealthDocument = {
        id: "doc_" + Date.now(),
        title,
        category,
        date: new Date().toISOString().split("T")[0],
        doctorName: doctorName || extractedData?.doctorName || "Dr. Srinivas Rao, MBBS",
        facilityName: facilityName || extractedData?.facilityName || "Bhoothpur Primary Health Centre",
        extractedSummary:
          extractedData?.summary ||
          `Medical record filed for ${title}. Contains routine clinical guidance and dosage schedules.`,
        detectedMedicines: extractedData?.detectedMedicines || [
          { name: "Telmisartan", dosage: "40mg", frequency: "Once daily morning" },
        ],
        tags: [category, "Rural Healthcare", "Verified"],
      };

      StorageManager.addDocument(newDoc);
      onDocumentAdded(newDoc);
      setSelectedDoc(newDoc);
      setShowUploadModal(false);
      resetForm();
    } catch (err) {
      console.error("Document upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Prescription");
    setDoctorName("");
    setFacilityName("");
    setOcrRawText("");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Health Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {language === "te"
              ? "వైద్య పత్రాల నిర్వాహకుడు"
              : language === "hi"
              ? "चिकित्सा दस्तावेज आयोजक"
              : "Medical Document Organizer"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            {language === "te"
              ? "ప్రిస్క్రిప్షన్లు, ల్యాబ్ రిపోర్టులు మరియు డిశ్చార్జ్ సమ్మరీలను భద్రపరచండి. AI ద్వారా ముఖ్య వివరాలను గ్రహించండి."
              : language === "hi"
              ? "पर्चे, लैब टेस्ट रिपोर्ट और अस्पताल के कागजात सुरक्षित रखें। AI द्वारा स्वतः समझें।"
              : "Digitize prescriptions, lab reports & discharge summaries with structured extraction."}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filter & List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or doctors..."
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden text-xs sm:text-sm text-slate-800 font-medium shadow-2xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {["all", "Prescription", "Lab Report", "Discharge Summary", "Vaccine Card"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-600 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{doc.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-1">
                    {doc.title}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {doc.doctorName || doc.facilityName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Document Inspector */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200">
                      {selectedDoc.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedDoc.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-2">
                    {selectedDoc.title}
                  </h2>
                </div>

                <button
                  onClick={() => alert(`Downloading record copy for: ${selectedDoc.title}`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Verified AI Extraction Box */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Structured Extraction
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                    OCR Processed
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedDoc.extractedSummary}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">PRESCRIBING DOCTOR</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedDoc.doctorName || "Not stated"}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">HOSPITAL / PHC</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedDoc.facilityName || "Primary Health Centre"}</span>
                  </div>
                </div>

                {/* Detected Medicines in Prescription */}
                {selectedDoc.detectedMedicines && selectedDoc.detectedMedicines.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-600" />
                      Detected Medicines & Frequency:
                    </span>
                    <div className="space-y-2">
                      {selectedDoc.detectedMedicines.map((med, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold"
                        >
                          <span className="text-slate-800">{med.name} ({med.dosage})</span>
                          <span className="text-blue-700 text-[11px] bg-blue-50 px-2.5 py-0.5 rounded-full">
                            {med.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Safety Disclaimers */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Important Verification Notice:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    This is an AI-assisted structured digitization of your medical document. Always bring your physical paper prescriptions or show the original document to your physician.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Select a document from the left list to view structured details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Upload & Digitize Medical Record</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateExtraction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hypertension & Thyroid Followup Rx"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Vaccine Card">Vaccine Card</option>
                    <option value="Insurance / Scheme">Insurance / Scheme</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Srinivas Rao"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hospital / PHC</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Bhoothpur PHC"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Document Notes or OCR Raw Text (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ocrRawText}
                  onChange={(e) => setOcrRawText(e.target.value)}
                  placeholder="Paste prescription contents or lab report values..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-hidden font-medium bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  {isUploading ? (
                    <span>Processing with AI...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save & Extract</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
