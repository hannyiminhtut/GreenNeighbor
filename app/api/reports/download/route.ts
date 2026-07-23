import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db/dbConfig";
import { Reports, CollectedWastes } from "@/utils/db/schema";
import puppeteer from "puppeteer";
import { eq, sql } from "drizzle-orm";
import { generateHtmlContent } from "@/lib/report-generation";

// Helper function to query the database based on report type
const queryReportData = async (type: string) => {
  switch (type) {
    case "user_activity":
      return db
        .select({
          location: Reports.location,
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(Reports.location);

    case "collection_efficiency":
      return db
        .select({
          totalReports: sql<number>`COUNT(DISTINCT ${Reports.id})`.as(
            "totalReports"
          ),
          collectedReports: sql<number>`COUNT(${CollectedWastes.reportId})`.as(
            "collectedReports"
          ),
        })
        .from(Reports)
        .leftJoin(CollectedWastes, eq(CollectedWastes.reportId, Reports.id));

    case "reward_engagement":
      return db
        .select({
          wasteType: Reports.wasteType,
          totalAmount: sql<number>`
              SUM(CAST(REGEXP_REPLACE(${Reports.amount}, '[^0-9.]+', '', 'g') AS FLOAT))
            `.as("totalAmount"),
        })
        .from(Reports)
        .groupBy(Reports.wasteType);

    case "user_engagement_by_date":
      return db
        .select({
          date: sql<Date>`DATE(${Reports.createdAt})`.as("date"),
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(sql`DATE(${Reports.createdAt})`);

    case "average_waste_per_location":
      return db
        .select({
          location: Reports.location,
          averageWaste:
            sql<number>`AVG(CAST(REGEXP_REPLACE(${Reports.amount}, '[^0-9.]+', '', 'g') AS FLOAT))`.as(
              "averageWaste"
            ),
        })
        .from(Reports)
        .groupBy(Reports.location);

    case "waste_type_by_location":
      return db
        .select({
          location: Reports.location,
          wasteType: Reports.wasteType,
          reportCount: sql<number>`COUNT(${Reports.id})`.as("reportCount"),
        })
        .from(Reports)
        .groupBy(Reports.location, Reports.wasteType);

    case "collector_efficiency":
      return db
        .select({
          collectorId: CollectedWastes.collectorId,
          collectedReports: sql<number>`COUNT(${CollectedWastes.reportId})`.as(
            "collectedReports"
          ),
        })
        .from(CollectedWastes)
        .groupBy(CollectedWastes.collectorId);

    default:
      throw new Error("Invalid report type");
  }
};

// API handler function
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (!type) {
      return NextResponse.json(
        { error: "Report type is required" },
        { status: 400 }
      );
    }


    const data = await queryReportData(type);
    console.log(`${type} Data:`, data);

    const htmlContent = generateHtmlContent(data, type);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set the HTML content for the page
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

    // Generate PDF from the HTML content
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    // Return the PDF as a stream response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${type}_report.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
