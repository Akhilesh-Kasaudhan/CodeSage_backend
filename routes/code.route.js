import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import { submitCode, getCodeHistory } from "../controllers/code.controller.js";

router.post("/submit", auth, submitCode);
router.get("/history", auth, getCodeHistory);

export default router;
