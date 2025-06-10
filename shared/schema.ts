import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tabs = pgTable("tabs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  favicon: text("favicon"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  favicon: text("favicon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  visitedAt: timestamp("visited_at").defaultNow(),
});

export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  adBlocker: boolean("ad_blocker").default(true),
  trackerProtection: boolean("tracker_protection").default(true),
  malwareProtection: boolean("malware_protection").default(true),
  userAgent: text("user_agent"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTabSchema = createInsertSchema(tabs).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertHistorySchema = createInsertSchema(history).omit({
  id: true,
  visitedAt: true,
});

export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tab = typeof tabs.$inferSelect;
export type InsertTab = z.infer<typeof insertTabSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type History = typeof history.$inferSelect;
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
