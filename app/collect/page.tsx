"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Upload,
  Loader,
  Calendar,
  Weight,
  Search,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  getWasteCollectionTasks,
  updateTaskStatus,
  saveReward,
  saveCollectedWaste,
  getUserByEmail,
} from "@/utils/db/actions";
import Image from "next/image";
import dynamic from "next/dynamic";
import { formatMyanmarDateTime } from "@/utils/dateTime";
import {
  recommendCollector,
  type DispatchRecommendation,
} from "@/lib/dispatch-matching";

const CollectionTaskMap = dynamic(
  () => import("@/components/CollectionTaskMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        Loading reported locations...
      </div>
    ),
  }
);

type CollectionTask = {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  imageUrl: string | null;
  status: "pending" | "in_progress" | "completed" | "verified";
  date: string;
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  confirmationCount: number;
  verifiedAt: string | null;
  collectorId: number | null;
};

const ITEMS_PER_PAGE = 5;

export default function CollectPage() {
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleDispatchTaskIds, setVisibleDispatchTaskIds] = useState<
    Set<number>
  >(new Set());
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setLoading(true);
      try {
        // Fetch user
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            toast.error("User not found. Please log in again.");
            // Redirect to login page or handle this case appropriately
          }
        } else {
          toast.error("User not logged in. Please log in.");
          // Redirect to login page or handle this case appropriately
        }

        // Fetch tasks
        const fetchedTasks = await getWasteCollectionTasks();
        setTasks(fetchedTasks as CollectionTask[]);
      } catch (error) {
        console.error("Error fetching user and tasks:", error);
        toast.error("Failed to load user data and tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTasks();
  }, []);

  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(
    null
  );
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failure"
  >("idle");
  const [verificationResult, setVerificationResult] = useState<{
    sameLocation: boolean;
    wasteRemoved: boolean;
    confidence: number;
  } | null>(null);
  const handleStatusChange = async (
    taskId: number,
    newStatus: CollectionTask["status"]
  ) => {
    if (!user) {
      toast.error("Please log in to collect waste.");
      return;
    }

    const task = tasks.find((item) => item.id === taskId);
    if (task?.userId === user.id) {
      toast.error("You cannot collect waste that you reported.");
      return;
    }

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus, user.id);
      if (updatedTask) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: newStatus, collectorId: user.id }
              : task
          )
        );
        toast.success("Task status updated successfully");
      } else {
        toast.error("Failed to update task status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const readFileAsBase64 = (dataUrl: string): string => {
    return dataUrl.split(",")[1];
  };

  const handleVerify = async () => {
    if (
      !selectedTask ||
      !selectedTask.imageUrl ||
      !verificationImage ||
      !verificationFile ||
      !user
    ) {
      toast.error("Missing required information for verification.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const base64Data = readFileAsBase64(verificationImage);
      const response = await fetch("/api/verify-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: verificationFile.type,
          beforeImageUrl: selectedTask.imageUrl,
        }),
      });
      const parsedResult = await response.json();

      if (!response.ok) {
        throw new Error(parsedResult.error || "Collection verification failed.");
      }

      setVerificationResult(parsedResult);
      const passed =
        parsedResult.sameLocation &&
        parsedResult.wasteRemoved &&
        parsedResult.confidence >= 0.7;
      setVerificationStatus(passed ? "success" : "failure");

      if (passed) {
          await handleStatusChange(selectedTask.id, "verified");
          const earnedReward = Math.floor(Math.random() * 50) + 10; // Random reward between 10 and 59

          // Save the reward
          await saveReward(user.id, earnedReward);

          // Save the collected waste
          const collectedWaste = await saveCollectedWaste(
            selectedTask.id,
            user.id
          );
          const verifiedAt = formatMyanmarDateTime(
            collectedWaste.collectionDate
          );
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === selectedTask.id
                ? { ...task, status: "verified", verifiedAt }
                : task
            )
          );

          toast.success(
            `Verification successful! You earned ${earnedReward} tokens!`,
            {
              duration: 5000,
              position: "top-center",
            }
          );
          setSelectedTask(null);
          setVerificationImage(null);
          setVerificationFile(null);
          setVerificationResult(null);
          setVerificationStatus("idle");
      } else {
          toast.error(
            "Verification failed. The collected waste does not match the reported waste.",
            {
              duration: 5000,
              position: "top-center",
            }
          );
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
      toast.error(
        error instanceof Error
          ? error.message
          : "Collection verification failed."
      );
    }
  };

  const filteredTasks = [...tasks]
    .filter((task) =>
      task.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (firstTask, secondTask) =>
        new Date(secondTask.createdAt).getTime() -
        new Date(firstTask.createdAt).getTime()
    );

  const pageCount = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Waste Collection Tasks
      </h1>

      {!loading && (
        <section className="mb-6" aria-labelledby="reported-locations-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="reported-locations-title"
              className="text-xl font-semibold text-gray-800"
            >
              Reported Locations
            </h2>
            <span className="text-sm text-gray-500">
              {tasks.filter((task) => task.latitude !== null && task.longitude !== null).length} mapped cases
            </span>
          </div>
          <CollectionTaskMap tasks={tasks} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Pending</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />In progress</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-purple-600" />Completed</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-600" />Verified</span>
          </div>
        </section>
      )}

      <div className="mb-6">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Collection queue
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Recent Reports
          </h2>
        </div>
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          <Input
            type="text"
            placeholder="Search recent reports by area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl border-slate-200">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedTasks.map((task) => (
              <div
                key={task.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_50px_-24px_rgba(15,23,42,0.5)]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    task.status === "pending"
                      ? "bg-amber-400"
                      : task.status === "in_progress"
                        ? "bg-blue-500"
                        : task.status === "completed"
                          ? "bg-violet-500"
                          : "bg-emerald-500"
                  }`}
                />
                <div className="p-5 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Collection case #{task.id}
                        </p>
                        <h2 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                          {task.location}
                        </h2>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <TaskMetadata icon={Trash2} label="Waste type" value={task.wasteType} capitalize />
                    <TaskMetadata icon={Weight} label="Estimated" value={task.amount} />
                    <TaskMetadata icon={Calendar} label="Reported" value={task.date} />
                  </div>
                  {task.status === "verified" && task.verifiedAt && (
                    <div className="mb-4 flex items-center rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-inset ring-emerald-100">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verified {task.verifiedAt}
                    </div>
                  )}
                  {task.status !== "verified" &&
                    visibleDispatchTaskIds.has(task.id) && (
                    <DispatchRecommendationCard task={task} />
                  )}
                </div>
                <div className="flex min-h-16 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                  {task.userId === user?.id && task.status !== "verified" && (
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                      Your report — another user must collect it
                    </span>
                  )}
                  {task.status === "pending" && task.userId !== user?.id && (
                    <>
                      <Button
                        type="button"
                        onClick={() =>
                          setVisibleDispatchTaskIds((currentIds) => {
                            const nextIds = new Set(currentIds);
                            if (nextIds.has(task.id)) {
                              nextIds.delete(task.id);
                            } else {
                              nextIds.add(task.id);
                            }
                            return nextIds;
                          })
                        }
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-300 bg-white px-4 text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        <Sparkles className="mr-1.5 h-4 w-4 text-blue-600" />
                        {visibleDispatchTaskIds.has(task.id)
                          ? "Hide AI Match"
                          : "View AI Match"}
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(task.id, "in_progress")}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-emerald-600 bg-emerald-600 px-4 text-white shadow-sm hover:bg-emerald-700 hover:text-white"
                      >
                        Start Collection
                      </Button>
                    </>
                  )}
                  {task.status === "in_progress" &&
                    task.userId !== user?.id &&
                    task.collectorId === user?.id && (
                      <>
                        <span className="text-xs font-medium text-amber-700">
                          Reminder: upload a clear after-cleanup photo.
                        </span>
                        <Button
                          onClick={() => setSelectedTask(task)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-slate-900 bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-800 hover:text-white"
                        >
                          Complete & Verify
                        </Button>
                      </>
                    )}
                  {task.status === "in_progress" &&
                    task.userId !== user?.id &&
                    task.collectorId !== user?.id && (
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                        In progress by another collector
                      </span>
                    )}
                  {task.status === "verified" && (
                    <span className="flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Reward Earned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="mx-2 self-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={currentPage === pageCount}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Verify Collection</h3>
            <p className="mb-4 text-sm text-gray-600">
              Upload a clear after-cleanup photo. AI will compare it with the
              original report photo to confirm this is the same place and the
              waste has been removed.
            </p>
            <div className="mb-4">
              <label
                htmlFor="verification-image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="verification-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="verification-image"
                        name="verification-image"
                        type="file"
                        className="sr-only"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            {verificationImage && (
              <Image
                src={verificationImage}
                alt="Verification"
                width={800}
                height={600}
                unoptimized
                className="mb-4 rounded-md w-full"
              />
            )}
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={
                !verificationImage || verificationStatus === "verifying"
              }
            >
              {verificationStatus === "verifying" ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                "Verify Collection"
              )}
            </Button>
            {verificationResult && (
              <div
                className={`mt-4 rounded-md border p-4 ${
                  verificationStatus === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <p>
                  Same Place:{" "}
                  {verificationResult.sameLocation ? "Yes" : "No"}
                </p>
                <p>
                  Waste Removed:{" "}
                  {verificationResult.wasteRemoved ? "Yes" : "No"}
                </p>
                <p>
                  Confidence: {(verificationResult.confidence * 100).toFixed(2)}
                  %
                </p>
              </div>
            )}
            {verificationStatus === "failure" && (
              <p className="mt-2 text-red-600 text-center text-sm">
                Verification failed. Please try again.
              </p>
            )}
            <Button
              onClick={() => setSelectedTask(null)}
              variant="outline"
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add a conditional render to show user info or login prompt */}
      {/* {user ? (
        <p className="text-sm text-gray-600 mb-4">Logged in as: {user.name}</p>
      ) : (
        <p className="text-sm text-red-600 mb-4">Please log in to collect waste and earn rewards.</p>
      )} */}
    </div>
  );
}

function TaskMetadata({
  icon: Icon,
  label,
  value,
  capitalize = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`truncate text-sm font-medium text-slate-800 ${capitalize ? "capitalize" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function DispatchRecommendationCard({ task }: { task: CollectionTask }) {
  const recommendation: DispatchRecommendation = recommendCollector(task);
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);

  const explainRecommendation = async () => {
    setExplaining(true);
    try {
      const response = await fetch("/api/dispatch-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wasteType: task.wasteType,
          amount: task.amount,
          priority: recommendation.priority,
          collectorName: recommendation.collector.name,
          matchScore: recommendation.matchScore,
          reasons: recommendation.reasons,
        }),
      });
      const result = (await response.json()) as {
        explanation?: string;
        error?: string;
      };
      if (!response.ok || !result.explanation) {
        throw new Error(result.error || "AI explanation is unavailable.");
      }
      setExplanation(result.explanation);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "AI explanation failed."
      );
    } finally {
      setExplaining(false);
    }
  };

  const priorityStyles = {
    High: "bg-red-400/15 text-red-200 ring-red-300/20",
    Medium: "bg-amber-400/15 text-amber-200 ring-amber-300/20",
    Low: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/20",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white shadow-lg shadow-slate-900/10 sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
              <Truck className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI Smart Dispatch · Simulated profile
              </div>
              <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                {recommendation.collector.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-300">
                {recommendation.collector.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-400/15 px-3 py-1.5 text-blue-200 ring-1 ring-inset ring-blue-300/20">
              {recommendation.matchScore}% match
            </span>
            <span className={`rounded-full px-3 py-1.5 ring-1 ring-inset ${priorityStyles[recommendation.priority]}`}>
              {recommendation.priority} priority
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
          {recommendation.reasons.slice(0, 4).map((reason) => (
            <div key={reason} className="flex items-start gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-inset ring-white/[0.06]">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
        {explanation && (
          <p className="mt-3 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-slate-200 ring-1 ring-inset ring-white/10">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-blue-300" />
            {explanation}
          </p>
        )}
        {!explanation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={explaining}
            onClick={() => void explainRecommendation()}
            className="mt-3 h-8 rounded-lg px-2 text-xs text-blue-200 hover:bg-white/10 hover:text-white"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {explaining ? "Generating explanation..." : "Explain AI match"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CollectionTask["status"] }) {
  const statusConfig = {
    pending: { color: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
    in_progress: { color: "bg-blue-50 text-blue-700 ring-blue-200", icon: Trash2 },
    completed: { color: "bg-violet-50 text-violet-700 ring-violet-200", icon: CheckCircle },
    verified: { color: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle },
  };

  const { color, icon: Icon } = statusConfig[status];

  return (
    <span
      className={`flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${color}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}
