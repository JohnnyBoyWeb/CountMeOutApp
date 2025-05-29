import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";

// Validation schemas for API endpoints
const progressQuerySchema = z.object({
  operation: z.enum(['addition', 'subtraction', 'multiplication', 'division', 'percentage']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  timeframe: z.enum(['week', 'month', 'year']).optional().default('week'),
  limit: z.coerce.number().min(1).max(100).optional().default(10)
});

const sessionDataSchema = z.object({
  mode: z.enum(['timed', 'accuracy', 'audio']),
  operation: z.enum(['addition', 'subtraction', 'multiplication', 'division', 'percentage']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  problemsSolved: z.number().min(0),
  correctAnswers: z.number().min(0),
  sessionTime: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  avgTimePerProblem: z.number().min(0).optional()
});

const settingsUpdateSchema = z.object({
  dyslexiaMode: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  largeText: z.boolean().optional(),
  soundEffects: z.boolean().optional(),
  voiceFeedback: z.boolean().optional(),
  voiceSpeed: z.number().min(0.5).max(2).optional(),
  darkMode: z.boolean().optional()
});

const achievementCheckSchema = z.object({
  sessionData: sessionDataSchema.optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      success: true, 
      message: "Count Me Out API is running",
      timestamp: new Date().toISOString()
    });
  });

  // Get user progress statistics
  app.get("/api/progress", async (req, res) => {
    try {
      const query = progressQuerySchema.parse(req.query);
      const progressData = await storage.getProgressStats(query);
      
      res.json({
        success: true,
        data: progressData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? "Invalid query parameters" : "Failed to fetch progress",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get progress for specific operation
  app.get("/api/progress/:operation", async (req, res) => {
    try {
      const { operation } = req.params;
      const { difficulty, timeframe = 'week' } = req.query;
      
      if (!['addition', 'subtraction', 'multiplication', 'division', 'percentage'].includes(operation)) {
        return res.status(400).json({
          success: false,
          error: "Invalid operation type",
          timestamp: new Date().toISOString()
        });
      }

      const operationData = await storage.getOperationProgress(
        operation as any, 
        difficulty as any,
        timeframe as any
      );
      
      res.json({
        success: true,
        data: operationData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching operation progress:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch operation progress",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Save practice session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = sessionDataSchema.parse(req.body);
      const savedSession = await storage.savePracticeSession(sessionData);
      
      // Update user progress
      await storage.updateUserProgress(sessionData);
      
      res.json({
        success: true,
        data: savedSession,
        message: "Practice session saved successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving session:", error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? "Invalid session data" : "Failed to save session",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get practice sessions history
  app.get("/api/sessions", async (req, res) => {
    try {
      const query = progressQuerySchema.parse(req.query);
      const sessions = await storage.getPracticeSessions(query);
      
      res.json({
        success: true,
        data: sessions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(400).json({
        success: false,
        error: "Failed to fetch sessions",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const { category, unlocked } = req.query;
      const achievements = await storage.getAchievements({
        category: category as string,
        unlocked: unlocked === 'true'
      });
      
      res.json({
        success: true,
        data: achievements,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch achievements",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Check and unlock achievements
  app.post("/api/achievements/check", async (req, res) => {
    try {
      const { sessionData } = achievementCheckSchema.parse(req.body);
      const newAchievements = await storage.checkAndUnlockAchievements(sessionData);
      
      res.json({
        success: true,
        data: newAchievements,
        message: newAchievements.length > 0 ? "New achievements unlocked!" : "No new achievements",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(400).json({
        success: false,
        error: "Failed to check achievements",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings();
      
      res.json({
        success: true,
        data: settings,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch settings",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update user settings
  app.put("/api/settings", async (req, res) => {
    try {
      const settingsUpdate = settingsUpdateSchema.parse(req.body);
      const updatedSettings = await storage.updateUserSettings(settingsUpdate);
      
      res.json({
        success: true,
        data: updatedSettings,
        message: "Settings updated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? "Invalid settings data" : "Failed to update settings",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get daily goal progress
  app.get("/api/daily-goal", async (req, res) => {
    try {
      const dailyGoal = await storage.getDailyGoalProgress();
      
      res.json({
        success: true,
        data: dailyGoal,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching daily goal:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch daily goal",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Export user data
  app.get("/api/export", async (req, res) => {
    try {
      const exportData = await storage.exportUserData();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="count-me-out-data-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to export data",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Clear all user data
  app.delete("/api/data", async (req, res) => {
    try {
      await storage.clearAllUserData();
      
      res.json({
        success: true,
        message: "All user data cleared successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({
        success: false,
        error: "Failed to clear data",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get app statistics (for admin/debug purposes)
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getAppStatistics();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching app stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch app statistics",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle 404 for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
      timestamp: new Date().toISOString()
    });
  });

  // Error handler for API routes
  app.use("/api/*", (err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
