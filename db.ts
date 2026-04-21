import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, documents, aiHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Document operations
export async function createDocument(userId: number, title: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values({ userId, title, content });
  return result;
}

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.updatedAt));
}

export async function getDocumentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  
  if (result.length === 0) return undefined;
  if (result[0].userId !== userId) return undefined; // Security check
  
  return result[0];
}

export async function updateDocument(id: number, userId: number, updates: { title?: string; content?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Security check: verify ownership
  const doc = await getDocumentById(id, userId);
  if (!doc) throw new Error("Document not found or access denied");
  
  await db.update(documents)
    .set(updates)
    .where(eq(documents.id, id));
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Security check: verify ownership
  const doc = await getDocumentById(id, userId);
  if (!doc) throw new Error("Document not found or access denied");
  
  await db.delete(documents).where(eq(documents.id, id));
}

// AI History operations
export async function saveAiHistory(
  userId: number,
  documentId: number | null,
  functionType: string,
  originalText: string,
  processedText: string,
  parameters?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(aiHistory).values({
    userId,
    documentId,
    functionType,
    originalText,
    processedText,
    parameters: parameters ? JSON.stringify(parameters) : null,
  });
}

export async function getUserAiHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(aiHistory)
    .where(eq(aiHistory.userId, userId))
    .orderBy(desc(aiHistory.createdAt))
    .limit(limit);
}
