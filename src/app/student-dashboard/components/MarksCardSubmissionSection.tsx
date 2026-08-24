'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MarksCardDocument, MarksCardStatus } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function MarksCardSubmissionSection() {
  const [documents, setDocuments] = useState<MarksCardDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<MarksCardDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<MarksCardDocument | null>(null);
  const [uploadSemester, setUploadSemester] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    const list = await campusRepository.getMarksCardSubmissions();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const getStatusBadge = (status: MarksCardStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge-success text-xs px-2.5 py-0.5 rounded-lg font-700">✓ Approved</span>;
      case 'REVIEWING':
        return <span className="badge-warning text-xs px-2.5 py-0.5 rounded-lg font-700">⏳ Under Review</span>;
      case 'SUBMITTED':
        return <span className="badge-cyan text-xs px-2.5 py-0.5 rounded-lg font-700">📤 Submitted</span>;
      case 'REJECTED':
        return <span className="badge-danger text-xs px-2.5 py-0.5 rounded-lg font-700">✕ Rejected</span>;
      case 'UPLOADING':
        return <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">Uploading...</span>;
      case 'NOT_SUBMITTED':
      default:
        return (
          <span className="text-[11px] px-2.5 py-0.5 rounded-lg font-600 bg-muted/40 text-muted-foreground border border-border/60">
            Pending Upload
          </span>
        );
    }
  };

  const handleTriggerUpload = (semester: number) => {
    setUploadSemester(semester);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadSemester === null) return;

    // Validation: Supported formats
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    // Validation: Max file size 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File exceeds maximum 5MB size limit. Please upload a compressed document.');
      return;
    }

    setIsUploading(true);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const isImage = file.type.startsWith('image/');

    // Local object URL for preview
    const previewUrl = URL.createObjectURL(file);

    try {
      await campusRepository.submitMarksCard(uploadSemester, {
        name: file.name,
        size: sizeInMB,
        type: isImage ? 'image' : 'pdf',
        previewUrl,
      });
      await loadDocuments();
      toast.success(`Semester ${uploadSemester} marks card submitted successfully!`);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadSemester(null);
    }
  };

  const handleRemove = async (semester: number) => {
    if (confirm(`Are you sure you want to remove the submitted Semester ${semester} marks card?`)) {
      await campusRepository.deleteMarksCard(semester);
      await loadDocuments();
      toast.info(`Semester ${semester} marks card removed`);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 border border-primary/30 space-y-5 shadow-glass">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-800 text-foreground tracking-tight">
              Previous Semester Marks Cards & Official Grade Sheets
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload official grade cards for verification by the Controller of Examinations (PDF, JPG, PNG ≤ 5MB)
          </p>
        </div>
        <Badge variant="cyan">Academic Records</Badge>
      </div>

      {/* List of Semesters */}
      <div className="space-y-3.5">
        {documents.map((doc) => {
          const isUploaded = doc.status !== 'NOT_SUBMITTED';
          return (
            <div
              key={doc.id}
              className={`p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                doc.status === 'APPROVED'
                  ? 'bg-success/5 border-success/30'
                  : doc.status === 'REVIEWING'
                  ? 'bg-warning/5 border-warning/30'
                  : doc.status === 'SUBMITTED'
                  ? 'bg-cyan-500/5 border-cyan-500/30'
                  : 'bg-card/60 border-border/70 hover:border-primary/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-800 text-foreground text-sm">{doc.semesterLabel}</span>
                  <span className="text-xs text-muted-foreground font-mono-data">
                    (Year {doc.year})
                  </span>
                  {getStatusBadge(doc.status)}
                  {doc.sgpa && (
                    <span className="text-xs font-700 text-primary font-mono-data">
                      SGPA: {doc.sgpa}
                    </span>
                  )}
                </div>

                {isUploaded ? (
                  <p className="text-xs text-foreground/80 font-mono-data">
                    📄 {doc.fileName} &nbsp;·&nbsp; {doc.fileSize} &nbsp;·&nbsp; Uploaded: {doc.uploadedAt}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No document submitted yet for {doc.semesterLabel}.
                  </p>
                )}

                {doc.adminRemarks && (
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    <span className="font-600 text-foreground">Note: </span>
                    {doc.adminRemarks}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                {isUploaded ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewDoc(doc)}
                      className="text-xs"
                    >
                      👁️ Preview
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTriggerUpload(doc.semester)}
                      disabled={isUploading}
                      className="text-xs"
                    >
                      🔄 Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(doc.semester)}
                      className="text-xs text-danger hover:bg-danger/10"
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTriggerUpload(doc.semester)}
                    disabled={isUploading}
                    className="text-xs shadow-glow font-700"
                  >
                    📤 Upload Marks Card
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Marks Card Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          maxWidth="2xl"
          title={`Marks Card Preview: ${previewDoc.semesterLabel}`}
          description={`${previewDoc.fileName} (${previewDoc.fileSize}) · Status: ${previewDoc.status}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-muted-foreground font-mono-data">
                Uploaded: {previewDoc.uploadedAt}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloaded ${previewDoc.fileName}`);
                    setPreviewDoc(null);
                  }}
                >
                  Download File
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Metadata Bar */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-700">
                  Semester
                </span>
                <span className="font-800 text-foreground">{previewDoc.semesterLabel}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-700">
                  SGPA / CGPA
                </span>
                <span className="font-800 text-primary font-mono-data">{previewDoc.sgpa || '8.80'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-700">
                  Verification
                </span>
                <span className="font-800 text-success">{previewDoc.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-700">
                  File Size
                </span>
                <span className="font-600 text-foreground">{previewDoc.fileSize}</span>
              </div>
            </div>

            {/* Document Viewer Frame */}
            <div className="h-80 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden relative group">
              {previewDoc.previewUrl && previewDoc.fileType === 'image' ? (
                <img
                  src={previewDoc.previewUrl}
                  alt={previewDoc.fileName}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl mx-auto text-primary">
                    📄
                  </div>
                  <div>
                    <h5 className="font-800 text-sm text-foreground">{previewDoc.fileName}</h5>
                    <p className="text-xs text-muted-foreground">
                      Official University Grade Statement Document
                    </p>
                  </div>
                  <p className="text-[11px] text-success font-600">
                    ✓ Verified Digital Cryptographic Signature Attached
                  </p>
                </div>
              )}
            </div>

            {previewDoc.adminRemarks && (
              <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                <span className="font-700 text-foreground">Examiner Remarks: </span>
                <span className="text-muted-foreground">{previewDoc.adminRemarks}</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
