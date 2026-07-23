const MYANMAR_TIME_ZONE = "Asia/Yangon";

export function formatMyanmarDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: MYANMAR_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

  return `${formatted} MMT`;
}
