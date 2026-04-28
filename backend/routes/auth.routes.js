import express from "express";
import { auth } from "../middlewares/auth.middleware.js"
import { loginUsuario } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/whoami", auth, (req, res) => {
  return res.json({ok: true, user: req.user})
});

router.post("/", loginUsuario);

export default router;
