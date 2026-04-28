"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Types
interface KYCStatus {
  is_verified: boolean;
  aadhaar_verified: boolean;
  pan_verified: boolean;
  photo_verified: boolean;
  address_verified: boolean;
  police_verification: boolean;
  submitted_at?: string;
  verified_at?: string;
  rejection_reason?: string;
}

interface KYCDocuments {
  aadhaar_front?: string;
  aadhaar_back?: string;
  pan_card?: string;
  photo?: string;
  address_proof?: string;
  police_clearance?: string;
}

export default function EKYCPage() {
  // Mock data (TODO: Replace with API)
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    is_verified: false,
    aadhaar_verified: false,
    pan_verified: false,
    photo_verified: false,
    address_verified: false,
    police_verification: false,
  });

  const [formData, setFormData] = useState({
    aadhaar_number: "",
    pan_number: "",
    full_name: "",
    date_of_birth: "",
    address: "",
  });

  const [documents, setDocuments] = useState<KYCDocuments>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleFileUpload = (field: keyof KYCDocuments, file: File) => {
    // TODO: Upload to cloud storage and get URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments({
        ...documents,
        [field]: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKYC = async () => {
    // Validate all fields
    if (
      !formData.aadhaar_number ||
      !formData.pan_number ||
      !formData.full_name
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (
      !documents.aadhaar_front ||
      !documents.aadhaar_back ||
      !documents.pan_card ||
      !documents.photo
    ) {
      alert("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit KYC
      console.log("TODO: Submit KYC", { formData, documents });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("KYC submitted successfully! You will be notified once verified.");
      setKycStatus({
        ...kycStatus,
        submitted_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to submit KYC:", error);
      alert("Failed to submit KYC. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationColor = (verified: boolean) => {
    return verified ? "text-green-400" : "text-amber-400";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          eKYC Verification
        </h1>
        <p className="text-white/40">
          Complete your identity verification to start accepting jobs
        </p>
      </motion.div>

      {/* Verification Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={`rounded-2xl border p-6 ${
          kycStatus.is_verified
            ? "border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5"
            : kycStatus.submitted_at
              ? "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5"
              : "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5"
        }`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="mb-2 font-bold text-white text-xl">
              Verification Status
            </h2>
            <p
              className={`font-semibold text-sm ${
                kycStatus.is_verified
                  ? "text-green-400"
                  : kycStatus.submitted_at
                    ? "text-amber-400"
                    : "text-blue-400"
              }`}
            >
              {kycStatus.is_verified
                ? "✓ Verified"
                : kycStatus.submitted_at
                  ? "⏳ Under Review"
                  : "○ Not Submitted"}
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-2 font-semibold ${
              kycStatus.is_verified
                ? "border-green-500/30 bg-green-500/20 text-green-400"
                : kycStatus.submitted_at
                  ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                  : "border-blue-500/30 bg-blue-500/20 text-blue-400"
            }`}
          >
            {kycStatus.is_verified
              ? "Active"
              : kycStatus.submitted_at
                ? "Pending"
                : "Incomplete"}
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <svg
              className={`h-5 w-5 ${getVerificationColor(kycStatus.aadhaar_verified)}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {kycStatus.aadhaar_verified ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-white/70">Aadhaar</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg
              className={`h-5 w-5 ${getVerificationColor(kycStatus.pan_verified)}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {kycStatus.pan_verified ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-white/70">PAN Card</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg
              className={`h-5 w-5 ${getVerificationColor(kycStatus.photo_verified)}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {kycStatus.photo_verified ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-white/70">Photo</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg
              className={`h-5 w-5 ${getVerificationColor(kycStatus.address_verified)}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {kycStatus.address_verified ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-white/70">Address</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg
              className={`h-5 w-5 ${getVerificationColor(kycStatus.police_verification)}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {kycStatus.police_verification ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <span className="text-white/70">Police Verification</span>
          </div>
        </div>

        {kycStatus.rejection_reason && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="mb-1 font-semibold text-red-400 text-sm">
              Rejection Reason:
            </p>
            <p className="text-sm text-white/70">
              {kycStatus.rejection_reason}
            </p>
          </div>
        )}
      </motion.div>

      {/* KYC Form */}
      {!kycStatus.is_verified && (
        <>
          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                    currentStep === step
                      ? "bg-amber-500 text-white"
                      : currentStep > step
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-white/40"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-16 rounded-full ${
                      currentStep > step ? "bg-green-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
              >
                <h2 className="mb-6 font-bold text-white text-xl">
                  Step 1: Personal Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Full Name (as per Aadhaar) *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      value={formData.aadhaar_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aadhaar_number: e.target.value,
                        })
                      }
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.pan_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pan_number: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Current Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter your complete address"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700"
                  >
                    Continue to Documents
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
              >
                <h2 className="mb-6 font-bold text-white text-xl">
                  Step 2: Upload Documents
                </h2>

                <div className="space-y-4">
                  {/* Aadhaar Front */}
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Aadhaar Card (Front) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload("aadhaar_front", e.target.files[0])
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-white hover:file:bg-amber-600"
                    />
                    {documents.aadhaar_front && (
                      <p className="mt-2 text-green-400 text-xs">✓ Uploaded</p>
                    )}
                  </div>

                  {/* Aadhaar Back */}
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Aadhaar Card (Back) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload("aadhaar_back", e.target.files[0])
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-white hover:file:bg-amber-600"
                    />
                    {documents.aadhaar_back && (
                      <p className="mt-2 text-green-400 text-xs">✓ Uploaded</p>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      PAN Card *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload("pan_card", e.target.files[0])
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-white hover:file:bg-amber-600"
                    />
                    {documents.pan_card && (
                      <p className="mt-2 text-green-400 text-xs">✓ Uploaded</p>
                    )}
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Recent Passport Size Photo *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload("photo", e.target.files[0])
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-white hover:file:bg-amber-600"
                    />
                    {documents.photo && (
                      <p className="mt-2 text-green-400 text-xs">✓ Uploaded</p>
                    )}
                  </div>

                  {/* Address Proof (Optional) */}
                  <div>
                    <label className="mb-2 block font-medium text-sm text-white/60">
                      Address Proof (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload("address_proof", e.target.files[0])
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-white hover:file:bg-amber-600"
                    />
                    <p className="mt-1 text-white/40 text-xs">
                      Utility bill, Bank statement, etc.
                    </p>
                    {documents.address_proof && (
                      <p className="mt-2 text-green-400 text-xs">✓ Uploaded</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-6 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
              >
                <h2 className="mb-6 font-bold text-white text-xl">
                  Step 3: Review & Submit
                </h2>

                <div className="space-y-6">
                  {/* Personal Details Summary */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="mb-3 font-semibold text-sm text-white/60">
                      Personal Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-white/40">Name:</span>{" "}
                        {formData.full_name}
                      </p>
                      <p className="text-white">
                        <span className="text-white/40">DOB:</span>{" "}
                        {formData.date_of_birth}
                      </p>
                      <p className="text-white">
                        <span className="text-white/40">Aadhaar:</span>{" "}
                        {formData.aadhaar_number}
                      </p>
                      <p className="text-white">
                        <span className="text-white/40">PAN:</span>{" "}
                        {formData.pan_number}
                      </p>
                      <p className="text-white">
                        <span className="text-white/40">Address:</span>{" "}
                        {formData.address}
                      </p>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <h3 className="mb-3 font-semibold text-sm text-white/60">
                      Documents Uploaded
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-white">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Aadhaar Card (Front & Back)
                      </p>
                      <p className="flex items-center gap-2 text-white">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        PAN Card
                      </p>
                      <p className="flex items-center gap-2 text-white">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Photo
                      </p>
                      {documents.address_proof && (
                        <p className="flex items-center gap-2 text-white">
                          <svg
                            className="h-4 w-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Address Proof
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-blue-400 text-sm">
                      By submitting, you agree that all information provided is
                      accurate and you authorize HomeBuddy to verify your
                      identity through government databases and conduct
                      background checks.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-6 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitKYC}
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit for Verification"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-blue-400 text-sm">
              Why eKYC is Required
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              eKYC verification ensures trust and safety for both customers and
              technicians. Your documents are encrypted and stored securely.
              Verification typically takes 24-48 hours. You can start accepting
              jobs once verified.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
