import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import {
  submitCode,
  getCodeHistory,
  deleteCodeHistory,
  deleteCodeHistoryOfUser,
  deleteAllCodeHistory,
} from "../controllers/code.controller.js";

router.post("/submit", auth, submitCode);
router.get("/history", auth, getCodeHistory);
router.delete("/history/:codeId", auth, deleteCodeHistory);
router.delete("/history", auth, deleteAllCodeHistory);
router.delete("/history/:userId", auth, deleteCodeHistoryOfUser);

export default router;
