import { GET } from "@/app/api/reports/download/route";
import {
  generateHtmlContent,
  getTableHeaders,
} from "@/lib/report-generation";

describe("GET /api/reports/download", () => {
  it("returns 400 when the report type is missing", async () => {
    const request = new Request("http://localhost/api/reports/download");

    const response = await GET(request as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Report type is required",
    });
  });

  it("returns 500 when the report type is unsupported", async () => {
    const request = new Request(
      "http://localhost/api/reports/download?type=unsupported"
    );

    const response = await GET(request as never);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to generate report",
    });
  });
});

describe("report rendering helpers", () => {
  it("provides headers for a supported report", () => {
    expect(getTableHeaders("user_activity")).toContain("Location");
    expect(getTableHeaders("unsupported")).toBe("");
  });

  it("renders report data into the PDF HTML", () => {
    const html = generateHtmlContent(
      [{ location: "Central Park", reportCount: 3 }],
      "user_activity"
    );

    expect(html).toContain("Central Park");
    expect(html).toContain("USER_ACTIVITY REPORT");
  });
});
