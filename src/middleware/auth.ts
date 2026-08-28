import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebase-admin.ts";
import { DecodedIdToken } from "firebase-admin/auth";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: typeof users.$inferSelect;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If no token or header, return 401
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    // 1. Try Firebase Auth verification
    let decodedToken: DecodedIdToken | null = null;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
    } catch {
      // If token is a direct custom session token or email-based UID for custom demo logins
      decodedToken = null;
    }

    const uid = decodedToken?.uid || token;
    const email = decodedToken?.email || (token.includes("@") ? token : `${token}@sehatsaathi.gov.in`);

    // Look up or sync user in Cloud SQL
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existingUser.length > 0) {
      req.dbUser = existingUser[0];
    } else {
      // Create user record in Cloud SQL
      const inserted = await db
        .insert(users)
        .values({
          uid,
          email,
          name: decodedToken?.name || (email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase())),
          role: "user",
          preferredLanguage: "te",
        })
        .returning();
      req.dbUser = inserted[0];
    }

    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
