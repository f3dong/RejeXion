import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, passwordResetsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/auth/register", async (req, res, next): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase(), name, passwordHash })
      .returning();

    req.session.userId = user.id;
    req.log.info({ userId: user.id }, "User registered");

    req.session.save((err) => {
      if (err) logger.error({ err }, "Session save error on register");
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    req.session.userId = user.id;
    req.log.info({ userId: user.id }, "User logged in");

    req.session.save((err) => {
      if (err) logger.error({ err }, "Session save error on login");
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", async (req, res, next): Promise<void> => {
  try {
    req.session.destroy((err) => {
      if (err) {
        logger.error({ err }, "Session destroy error");
      }
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", async (req, res, next): Promise<void> => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/forgot-password", async (req, res, next): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetsTable).values({
        userId: user.id,
        token,
        expiresAt,
      });

      req.log.info({ userId: user.id }, "Password reset token created");
    }

    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/reset-password", async (req, res, next): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const [reset] = await db
      .select()
      .from(passwordResetsTable)
      .where(eq(passwordResetsTable.token, token))
      .limit(1);

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, reset.userId));

    await db
      .update(passwordResetsTable)
      .set({ used: true })
      .where(eq(passwordResetsTable.id, reset.id));

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
