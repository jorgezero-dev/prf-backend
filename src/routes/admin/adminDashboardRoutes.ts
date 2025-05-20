import express from "express";
import { getDashboardStats } from "../../controllers/admin/dashboardController";
import { protect, admin } from "../../middleware/authMiddleware";

const router = express.Router();

router.route("/stats").get(protect, admin, getDashboardStats);

export default router;
