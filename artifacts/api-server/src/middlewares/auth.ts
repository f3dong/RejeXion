import { type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const DEV_EMAIL = "dev@rejexion.dev";
let _cachedDevUserId: string | null = null;

export async function getOrCreateDevUser(): Promise<string | null> {
  if (_cachedDevUserId) return _cachedDevUserId;

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, DEV_EMAIL)).limit(1);

  if (!user) {
    const passwordHash = await bcrypt.hash("devpassword123", 12);
    [user] = await db
      .insert(usersTable)
      .values({ email: DEV_EMAIL, name: "Dev User", passwordHash })
      .returning();
  }

  _cachedDevUserId = user.id;
  return user.id;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.userId) {
    return next();
  }

  if (process.env.NODE_ENV !== "production") {
    getOrCreateDevUser()
      .then((userId) => {
        if (userId) {
          req.session.userId = userId;
          next();
        } else {
          res.status(401).json({ error: "Not authenticated" });
        }
      })
      .catch(next);
    return;
  }

  res.status(401).json({ error: "Not authenticated" });
}
