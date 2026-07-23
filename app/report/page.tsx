"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Leaf,
  Loader2,
  MapPin,
  Recycle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createUser,
  getUserByEmail,
  createReport,
  getRecentReports,
  getDuplicateCandidates,
  attachReportToWasteCase,
} from "@/utils/db/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import OpenStreetMapLocationSearch from "@/components/OpenStreetMapLocationSearch";
import { formatMyanmarDateTime } from "@/utils/dateTime";
import type { MapPoint } from "@/components/OpenStreetMapCanvas";
import { useLanguage } from "@/components/LanguageProvider";

export default function ReportPage() {
  const { language } = useLanguage();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);
  const router = useRouter();

  const [reports, setReports] = useState<
    Array<{
      id: number;
      location: string;
      wasteType: string;
      amount: string;
      createdAt: string;
    }>
  >([]);

  const [newReport, setNewReport] = useState({
    location: "",
    type: "",
    amount: "",
  });
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string;
    quantity: string;
    confidence: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationChange = useCallback((location: string, point: MapPoint | null) => {
    setNewReport((previous) => ({ ...previous, location }));
    setSelectedPoint(point);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleVerify = async () => {
    if (!file) {
      toast.error("Please upload a waste image first.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const base64Data = await readFileAsBase64(file);
      const response = await fetch("/api/verify-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: base64Data.split(",")[1],
          mimeType: file.type,
        }),
      });
      const parsedResult = await response.json();

      if (!response.ok) {
        throw new Error(parsedResult.error || "Waste verification failed.");
      }

      setVerificationResult(parsedResult);
      setVerificationStatus("success");
      setNewReport((previous) => ({
        ...previous,
        type: parsedResult.wasteType,
        amount: parsedResult.quantity,
      }));
      toast.success("Waste verified successfully.");
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
      toast.error(
        error instanceof Error ? error.message : "Waste verification failed."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== "success" || !user) {
      toast.error("Please verify the waste before submitting or log in.");
      return;
    }
    if (!newReport.location) {
      toast.error("Search for and select a waste location before submitting.");
      return;
    }
    if (!selectedPoint || !file) {
      toast.error("Select a map point and keep the verified image attached.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("image", file);
      const uploadResponse = await fetch("/api/report-images", {
        method: "POST",
        body: uploadForm,
      });
      const uploadResult = (await uploadResponse.json()) as {
        imageUrl?: string;
        error?: string;
      };
      if (!uploadResponse.ok || !uploadResult.imageUrl) {
        throw new Error(uploadResult.error || "The report image could not be stored.");
      }

      const candidates = await getDuplicateCandidates(
        selectedPoint.lat,
        selectedPoint.lon
      );
      let matchedReportId: number | null = null;
      let duplicateConfidence = 0;

      if (candidates.length > 0) {
        const base64Data = await readFileAsBase64(file);
        const duplicateResponse = await fetch("/api/detect-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64Data.split(",")[1],
            mimeType: file.type,
            candidates,
          }),
        });
        const duplicateResult = (await duplicateResponse.json()) as {
          matchedReportId?: number | null;
          confidence?: number;
          error?: string;
        };
        if (!duplicateResponse.ok) {
          throw new Error(
            duplicateResult.error || "Duplicate detection could not be completed."
          );
        }
        matchedReportId = duplicateResult.matchedReportId ?? null;
        duplicateConfidence = duplicateResult.confidence ?? 0;
      }

      const report = (await createReport(
        user.id,
        newReport.location,
        newReport.type,
        newReport.amount,
        verificationResult ?? undefined
      ));

      if (!report) {
        throw new Error("The report could not be saved");
      }

      const caseResult = await attachReportToWasteCase(
        report.id,
        selectedPoint.lat,
        selectedPoint.lon,
        uploadResult.imageUrl,
        matchedReportId,
        duplicateConfidence
      );

      const formattedReport = {
        id: report.id,
        location: report.location,
        wasteType: report.wasteType,
        amount: report.amount,
        createdAt: formatMyanmarDateTime(report.createdAt),
      };

      setReports([formattedReport, ...reports]);
      setNewReport({ location: "", type: "", amount: "" });
      setSelectedPoint(null);
      setFile(null);
      setPreview(null);
      setVerificationStatus("idle");
      setVerificationResult(null);
      window.dispatchEvent(new Event("accountDataUpdated"));

      toast.success(
        caseResult.linkedToExistingCase
          ? "Report submitted and linked to an existing waste case. You've earned reporting points."
          : "Report submitted as a new waste case. You've earned reporting points."
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(
        error instanceof Error
          ? `Failed to submit report: ${error.message}`
          : "Failed to submit report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        let user = await getUserByEmail(email);
        if (!user) {
          user = await createUser(email, "Anonymous User");
        }
        setUser(user);

        const recentReports = await getRecentReports();
        const formattedReports = recentReports.map((report) => ({
          ...report,
          createdAt: formatMyanmarDateTime(report.createdAt),
        }));
        setReports(formattedReports);
      } else {
        toast.error("Please log in before reporting waste.");
        router.replace("/");
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#103b2b] px-6 py-9 text-white shadow-[0_24px_70px_-28px_rgba(15,61,43,0.7)] sm:px-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <Recycle className="absolute -bottom-12 -right-4 h-48 w-48 rotate-12 text-white/[0.05]" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Community action
          </div>
          <h1
            className={`max-w-2xl font-bold tracking-tight ${
              language === "my"
                ? "text-xl leading-relaxed sm:text-2xl lg:text-3xl"
                : "text-3xl sm:text-4xl lg:text-5xl"
            }`}
          >
            Spot waste. Report it.
            <span className="block text-emerald-300">Make your city cleaner.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
            Share a clear photo and location. Our AI verifies the details so
            collection teams can act faster.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mb-12 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-32px_rgba(15,23,42,0.45)] sm:p-8"
      >
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">01</span>
          <div>
            <h2 className="font-semibold text-slate-900">Add a clear photo</h2>
            <p className="mt-1 text-sm text-slate-500">Keep the waste visible and well lit.</p>
          </div>
        </div>
        <div className="mb-8">
          <label
            htmlFor="waste-image"
            className="sr-only"
          >
            Upload Waste Image
          </label>
          <div className="mt-1 flex min-h-56 justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 pb-6 pt-8 transition hover:border-emerald-400 hover:bg-emerald-50/40">
            <div className="space-y-1 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                <ImagePlus className="h-6 w-6" />
              </span>
              <div className="flex justify-center text-sm text-slate-600">
                <label
                  htmlFor="waste-image"
                  className="relative cursor-pointer rounded-md font-semibold text-emerald-700 hover:text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500"
                >
                  <span>Choose a photo</span>
                  <input
                    id="waste-image"
                    name="waste-image"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="pt-2 text-xs text-slate-400">PNG, JPG or GIF · Up to 10MB</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="mb-8 mt-4 overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={preview}
              alt="Waste preview"
              width={800}
              height={600}
              unoptimized
              className="max-h-[32rem] w-full object-cover"
            />
          </div>
        )}

        <Button
          type="button"
          onClick={handleVerify}
          className="mb-8 h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
          disabled={!file || verificationStatus === "verifying"}
        >
          {verificationStatus === "verifying" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analysing photo...
            </>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4 text-emerald-300" />Verify with AI</>
          )}
        </Button>

        {verificationStatus === "success" && verificationResult && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
            <div className="flex items-center">
              <CheckCircle2 className="mr-3 h-6 w-6 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-emerald-900">
                  Verification Successful
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-emerald-700">
                  <p>Waste Type: {verificationResult.wasteType}</p>
                  <p>Quantity: {verificationResult.quantity}</p>
                  <p>
                    Confidence:{" "}
                    {(verificationResult.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === "failure" && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Verification failed. Check the message above, then try another image.
          </div>
        )}

        <div className="mb-6 flex items-start gap-4 border-t border-slate-100 pt-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">02</span>
          <div>
            <h2 className="font-semibold text-slate-900">Pin the location</h2>
            <p className="mt-1 text-sm text-slate-500">Search an address or place the marker precisely.</p>
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label
              htmlFor="location"
              className="sr-only"
            >
              Location
            </label>
            <OpenStreetMapLocationSearch onChange={handleLocationChange} />
          </div>
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Waste Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={newReport.type}
              onChange={handleInputChange}
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
              placeholder="Awaiting verification"
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Estimated Amount
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={newReport.amount}
              onChange={handleInputChange}
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
              placeholder="Awaiting verification"
              readOnly
            />
          </div>
        </div>
        <Button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>Submit report<ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Community activity</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Recent reports</h2>
          <p className="mt-1 text-sm text-slate-500">Latest waste reports submitted by the community.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-200 sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live updates
        </div>
      </div>
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_14px_45px_-28px_rgba(15,23,42,0.35)]">
        {reports.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Leaf className="h-5 w-5" />
            </span>
            <p className="font-semibold text-slate-800">No reports yet</p>
            <p className="mt-1 text-sm text-slate-500">Your submitted reports will appear here.</p>
          </div>
        ) : (
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full min-w-[760px]">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Reported at (MMT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="group transition hover:bg-emerald-50/30"
                >
                  <td className="max-w-sm px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="truncate font-medium">{report.location}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {report.wasteType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                    {report.amount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" />{report.createdAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
