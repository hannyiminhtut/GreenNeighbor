export type CollectorProfile = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  capacityKg: number;
  acceptedWasteTypes: string[];
  available: boolean;
  activeTasks: number;
};

export type DispatchTask = {
  id: number;
  wasteType: string;
  amount: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  confirmationCount: number;
};

export type DispatchRecommendation = {
  collector: CollectorProfile;
  matchScore: number;
  priority: "Low" | "Medium" | "High";
  priorityScore: number;
  distanceKm: number | null;
  reasons: string[];
};

export const SIMULATED_COLLECTORS: CollectorProfile[] = [
  {
    id: "local-light",
    name: "Yangon Local Cleanup",
    description: "Small local collector for nearby, lightweight waste",
    latitude: 16.8409,
    longitude: 96.1735,
    capacityKg: 100,
    acceptedWasteTypes: ["plastic", "paper", "organic", "mixed"],
    available: true,
    activeTasks: 1,
  },
  {
    id: "recycling",
    name: "GreenLoop Recycling Team",
    description: "Specialist recycling crew for recoverable materials",
    latitude: 16.8053,
    longitude: 96.1561,
    capacityKg: 400,
    acceptedWasteTypes: ["plastic", "paper", "glass", "metal", "electronic"],
    available: true,
    activeTasks: 2,
  },
  {
    id: "heavy-cleanup",
    name: "City Heavy Cleanup Unit",
    description: "Large-capacity team for heavy, mixed, or hazardous cleanup",
    latitude: 16.8661,
    longitude: 96.1951,
    capacityKg: 2000,
    acceptedWasteTypes: [
      "mixed",
      "organic",
      "electronic",
      "hazardous",
      "medical",
      "plastic",
      "paper",
      "glass",
      "metal",
    ],
    available: true,
    activeTasks: 0,
  },
];

function parseAmountKg(amount: string) {
  const numericAmount = Number.parseFloat(amount.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numericAmount) ? numericAmount : 0;
}

function distanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function acceptsWaste(profile: CollectorProfile, wasteType: string) {
  const normalizedType = wasteType.toLowerCase();
  return profile.acceptedWasteTypes.some(
    (type) => normalizedType.includes(type) || type.includes(normalizedType)
  );
}

export function recommendCollector(task: DispatchTask): DispatchRecommendation {
  const amountKg = parseAmountKg(task.amount);
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(task.createdAt).getTime()) / 3_600_000
  );
  const normalizedType = task.wasteType.toLowerCase();
  const riskyWaste = ["hazardous", "medical", "electronic"].some((type) =>
    normalizedType.includes(type)
  );
  const priorityScore = Math.min(
    100,
    (riskyWaste ? 35 : 10) +
      Math.min(25, amountKg / 20) +
      Math.min(20, ageHours / 3.6) +
      Math.min(20, Math.max(0, task.confirmationCount - 1) * 7)
  );
  const priority =
    priorityScore >= 65 ? "High" : priorityScore >= 35 ? "Medium" : "Low";

  const ranked = SIMULATED_COLLECTORS.map((collector) => {
    const distance =
      task.latitude !== null && task.longitude !== null
        ? distanceKm(
            task.latitude,
            task.longitude,
            collector.latitude,
            collector.longitude
          )
        : null;
    const typeMatch = acceptsWaste(collector, task.wasteType);
    const hasCapacity = amountKg <= collector.capacityKg;
    const score = Math.round(
      (typeMatch ? 30 : 0) +
        (hasCapacity ? 25 : Math.max(0, 25 - ((amountKg - collector.capacityKg) / Math.max(amountKg, 1)) * 25)) +
        (distance === null ? 10 : Math.max(0, 25 - distance * 2)) +
        (collector.available ? 10 : 0) +
        Math.max(0, 10 - collector.activeTasks * 3)
    );
    return { collector, score: Math.min(100, score), distance, typeMatch, hasCapacity };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const reasons = [
    best.distance === null
      ? "Location distance is unavailable for this older report"
      : `${best.distance.toFixed(1)} km from the waste case`,
    best.hasCapacity
      ? `Capacity supports the estimated ${task.amount}`
      : "Closest available capacity match among simulated teams",
    best.typeMatch
      ? `Specialized for ${task.wasteType} waste`
      : "General cleanup capability selected",
    best.collector.available
      ? "Currently available"
      : "Currently handling another assignment",
  ];
  if (task.confirmationCount > 1) {
    reasons.push(`Case confirmed by ${task.confirmationCount} reports`);
  }

  return {
    collector: best.collector,
    matchScore: best.score,
    priority,
    priorityScore: Math.round(priorityScore),
    distanceKm: best.distance,
    reasons,
  };
}
