"use server";

import { db } from './dbConfig';
import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions, WasteCases } from './schema';
import { eq, sql, and, desc, asc, gte, inArray, isNotNull } from 'drizzle-orm';
import { formatMyanmarDateTime } from '@/utils/dateTime';

export async function createUser(email: string, name: string) {
  try {
    const [user] = await db.insert(Users).values({ email, name }).returning().execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    const reward = await getOrCreateReward(userId);
    if (!reward) {
      throw new Error("The reporter's reward account could not be created.");
    }
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getOrCreateReward(userId: number) {
  try {
    let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
    if (!reward) {
      [reward] = await db.insert(Rewards).values({
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
      }).returning().execute();
    }
    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    const rewardAccount = await getOrCreateReward(userId);
    if (!rewardAccount) {
      throw new Error("Reward account could not be created.");
    }
    const [updatedReward] = await db
      .update(Rewards)
      .set({ 
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date()
      })
      .where(eq(Rewards.id, rewardAccount.id))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createCollectedWaste(reportId: number, collectorId: number) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}

export async function getCollectedWastesByCollector(collectorId: number) {
  try {
    return await db.select().from(CollectedWastes).where(eq(CollectedWastes.collectorId, collectorId)).execute();
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}

export async function createNotification(userId: number, message: string, type: string) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db.select().from(Notifications).where(
      and(
        eq(Notifications.userId, userId),
        eq(Notifications.isRead, false)
      )
    ).execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function getPendingReports() {
  try {
    return await db.select().from(Reports).where(eq(Reports.status, "pending")).execute();
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return [];
  }
}

export async function updateReportStatus(reportId: number, status: string) {
  try {
    const [updatedReport] = await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        userId: Reports.userId,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        imageUrl: Reports.imageUrl,
        status: Reports.status,
        date: Reports.createdAt,
        latitude: Reports.latitude,
        longitude: Reports.longitude,
        collectorId: Reports.collectorId,
        caseId: Reports.caseId,
        verifiedAt: CollectedWastes.collectionDate,
      })
      .from(Reports)
      .leftJoin(CollectedWastes, eq(CollectedWastes.reportId, Reports.id))
      .orderBy(asc(Reports.createdAt))
      .limit(Math.max(limit * 5, 100))
      .execute();

    const visibleTasks = tasks.filter(
      (task, index, allTasks) =>
        task.caseId === null ||
        allTasks.findIndex((candidate) => candidate.caseId === task.caseId) === index
    );

    return visibleTasks.slice(0, limit).map(task => {
      const confirmationCount = task.caseId
        ? new Set(
            tasks
              .filter((candidate) => candidate.caseId === task.caseId)
              .map((candidate) => candidate.id)
          ).size
        : 1;

      return {
        ...task,
        createdAt: task.date.toISOString(),
        date: formatMyanmarDateTime(task.date),
        confirmationCount,
        verifiedAt: task.verifiedAt
          ? formatMyanmarDateTime(task.verifiedAt)
          : null,
      };
    });
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number) {
  try {
    const reward = await updateRewardPoints(userId, amount);
    if (!reward) {
      throw new Error("Collection reward could not be saved.");
    }
    
    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId: number, collectorId: number) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: 'verified',
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}

export async function updateTaskStatus(reportId: number, newStatus: string, collectorId?: number) {
  try {
    const [targetReport] = await db
      .select({ reporterId: Reports.userId, caseId: Reports.caseId })
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .limit(1)
      .execute();

    if (!targetReport) {
      throw new Error("Waste report not found.");
    }

    if (collectorId !== undefined) {
      if (targetReport.reporterId === collectorId) {
        throw new Error("You cannot collect waste that you reported.");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const updatedReports = await db
      .update(Reports)
      .set(updateData)
      .where(
        targetReport.caseId
          ? eq(Reports.caseId, targetReport.caseId)
          : eq(Reports.id, reportId)
      )
      .returning()
      .execute();

    if (targetReport.caseId) {
      await db
        .update(WasteCases)
        .set({
          status: newStatus === "verified" ? "verified" : newStatus,
          updatedAt: new Date(),
        })
        .where(eq(WasteCases.id, targetReport.caseId));
    }

    return updatedReports.find((report) => report.id === reportId);
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function getAllRewards() {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        userName: Users.name,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: number) {
  try {
    console.log('Fetching transactions for user ID:', userId)
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    // console.log('Raw transactions from database:', transactions)

    const formattedTransactions = transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    }));

    // console.log('Formatted transactions:', formattedTransactions)
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getAvailableRewards(userId: number) {
  try {
    const userPoints = await getUserRewardBalance(userId);
    return [
      {
        id: 0,
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste"
      }
    ];
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function createTransaction(userId: number, type: 'earned_report' | 'earned_collect' | 'redeemed', amount: number, description: string) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({ userId, type, amount, description })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function redeemReward(userId: number, rewardId: number) {
  try {
    const currentBalance = await getUserRewardBalance(userId);
    if (currentBalance <= 0) {
      throw new Error("No points are available to redeem.");
    }

    if (rewardId === 0) {
      await db
        .update(Rewards)
        .set({
          points: 0,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .execute();

      await createTransaction(
        userId,
        'redeemed',
        currentBalance,
        `Redeemed all points: ${currentBalance}`
      );
      return { points: 0, redeemed: currentBalance };
    }

    throw new Error("Invalid reward selection.");
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function getUserRewardBalance(userId: number): Promise<number> {
  const rewardRows = await db
    .select({ points: Rewards.points })
    .from(Rewards)
    .where(eq(Rewards.userId, userId))
    .execute();

  return Math.max(
    rewardRows.reduce(
      (total, reward) => total + (Number(reward.points) || 0),
      0
    ),
    0
  );
}

export async function getUserBalance(userId: number): Promise<number> {
  return getUserRewardBalance(userId);
}


//Get User Role by email
export async function getUserRoleByEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user.role;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

const DUPLICATE_RADIUS_METRES = 50;
const DUPLICATE_WINDOW_HOURS = 72;
const AUTO_LINK_CONFIDENCE = 0.9;

function distanceInMetres(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMetres = 6_371_000;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMetres * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getDuplicateCandidates(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

  const cutoff = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000);
  const reports = await db
    .select({
      reportId: Reports.id,
      imageUrl: Reports.imageUrl,
      latitude: Reports.latitude,
      longitude: Reports.longitude,
    })
    .from(Reports)
    .where(
      and(
        inArray(Reports.status, ["pending", "in_progress"]),
        gte(Reports.createdAt, cutoff),
        isNotNull(Reports.imageUrl),
        isNotNull(Reports.latitude),
        isNotNull(Reports.longitude)
      )
    )
    .orderBy(desc(Reports.createdAt))
    .limit(100);

  return reports
    .map((report) => ({
      reportId: report.reportId,
      imageUrl: report.imageUrl as string,
      distanceMetres: distanceInMetres(
        latitude,
        longitude,
        report.latitude as number,
        report.longitude as number
      ),
    }))
    .filter((report) => report.distanceMetres <= DUPLICATE_RADIUS_METRES)
    .sort((a, b) => a.distanceMetres - b.distanceMetres)
    .slice(0, 3);
}

export async function attachReportToWasteCase(
  reportId: number,
  latitude: number,
  longitude: number,
  imageUrl: string,
  matchedReportId: number | null,
  confidence: number
) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Valid report coordinates are required.");
  }
  try {
    const imageHost = new URL(imageUrl).hostname;
    if (imageHost !== "res.cloudinary.com") throw new Error();
  } catch {
    throw new Error("A valid stored report image is required.");
  }

  let caseId: number | null = null;
  let shouldLink =
    matchedReportId !== null &&
    matchedReportId !== reportId &&
    confidence >= AUTO_LINK_CONFIDENCE;

  if (shouldLink) {
    const [matchedReport] = await db
      .select({
        caseId: Reports.caseId,
        latitude: Reports.latitude,
        longitude: Reports.longitude,
        status: Reports.status,
        createdAt: Reports.createdAt,
      })
      .from(Reports)
      .where(eq(Reports.id, matchedReportId as number))
      .limit(1);

    const stillPlausible =
      matchedReport &&
      matchedReport.latitude !== null &&
      matchedReport.longitude !== null &&
      ["pending", "in_progress"].includes(matchedReport.status) &&
      matchedReport.createdAt.getTime() >=
        Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000 &&
      distanceInMetres(
        latitude,
        longitude,
        matchedReport.latitude,
        matchedReport.longitude
      ) <= DUPLICATE_RADIUS_METRES;

    if (!stillPlausible) shouldLink = false;

    if (stillPlausible && matchedReport.caseId) {
      caseId = matchedReport.caseId;
    } else if (stillPlausible) {
      const [wasteCase] = await db
        .insert(WasteCases)
        .values({ latitude, longitude })
        .returning();
      caseId = wasteCase.id;
      await db
        .update(Reports)
        .set({ caseId })
        .where(eq(Reports.id, matchedReportId as number));
    }
  }

  if (!caseId) {
    const [wasteCase] = await db
      .insert(WasteCases)
      .values({ latitude, longitude })
      .returning();
    caseId = wasteCase.id;
  }

  const [updatedReport] = await db
    .update(Reports)
    .set({
      latitude,
      longitude,
      imageUrl,
      caseId,
      duplicateConfidence: shouldLink ? confidence : null,
    })
    .where(eq(Reports.id, reportId))
    .returning();

  return { report: updatedReport, linkedToExistingCase: shouldLink };
}
