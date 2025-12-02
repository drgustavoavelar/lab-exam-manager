import express from "express";
import multer from "multer";
import { storagePut } from "./storage";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadRouter = express.Router();

uploadRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const key = req.body.key || `uploads/${Date.now()}-${req.file.originalname}`;
    const contentType = req.body.contentType || req.file.mimetype;

    const result = await storagePut(key, req.file.buffer, contentType);

    res.json(result);
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
  }
});
