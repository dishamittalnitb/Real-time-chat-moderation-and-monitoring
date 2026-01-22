import express from "express";
import Message from "../models/message.model.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* =====================
   🔹 OVERVIEW STATS
===================== */
router.get("/overview", adminAuth, async (req, res) => {
  const total = await Message.countDocuments();

  const stats = await Message.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgToxicity: { $avg: "$toxicityScore" },
      },
    },
  ]);

  const avgToxicityGlobal = await Message.aggregate([
    { $group: { _id: null, avg: { $avg: "$toxicityScore" } } },
  ]);

  res.json({
    total,
    stats,
    avgToxicity: avgToxicityGlobal[0]?.avg || 0,
  });
});

/* =====================
   🔹 DAILY ANALYTICS
===================== */
router.get("/daily", adminAuth, async (req, res) => {
  const data = await Message.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        total: { $sum: 1 },

        approved: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },

        rephrased: {
          $sum: { $cond: [{ $eq: ["$status", "rephrased"] }, 1, 0] },
        },

        unmoderated: {
          $sum: { $cond: [{ $eq: ["$status", "unmoderated"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
});

/* =====================
   🔹 TOP MODERATED DAYS
===================== */
router.get("/insights/top-days", adminAuth, async (req, res) => {
  const data = await Message.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        rephrased: {
          $sum: { $cond: [{ $eq: ["$status", "rephrased"] }, 1, 0] },
        },
      },
    },
    { $sort: { rephrased: -1 } },
    { $limit: 5 },
  ]);

  res.json(data);
});

export default router;
