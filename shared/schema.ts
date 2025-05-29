import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // addition, subtraction, multiplication, division, percentage
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced, expert
  problemsSolved: integer("problems_solved").default(0),
  correctAnswers: integer("correct_answers").default(0),
  totalTime: integer("total_time").default(0), // in seconds
  bestTime: integer("best_time"), // in seconds
  streak: integer("streak").default(0),
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Practice sessions
export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull(), // timed, accuracy, audio
  operation: text("operation").notNull(),
  difficulty: text("difficulty").notNull(),
  problemsSolved: integer("problems_solved").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  sessionTime: integer("session_time").notNull(), // in seconds
  accuracy: real("accuracy").notNull(),
  avgTimePerProblem: real("avg_time_per_problem"),
  completedAt: timestamp("completed_at").defaultNow()
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // accuracy, speed, streak, milestone
  requirement: text("requirement").notNull(), // JSON string of requirement criteria
  unlockedAt: timestamp("unlocked_at")
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  dyslexiaMode: boolean("dyslexia_mode").default(false),
  highContrast: boolean("high_contrast").default(false),
  largeText: boolean("large_text").default(false),
  soundEffects: boolean("sound_effects").default(true),
  voiceFeedback: boolean("voice_feedback").default(true),
  voiceSpeed: real("voice_speed").default(1.0),
  darkMode: boolean("dark_mode").default(false),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions).omit({
  id: true,
  completedAt: true
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
