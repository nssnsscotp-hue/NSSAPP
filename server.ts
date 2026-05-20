import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const metadataPath = path.join(uploadDir, "metadata.json");
if (!fs.existsSync(metadataPath)) {
  fs.writeFileSync(metadataPath, JSON.stringify([], null, 2));
}

// Create physical preseeded files so they are actual valid downloads
const preseededFiles = [
  'NSS_Regular_Activities_Manual.pdf',
  'Annual_Special_Camp_Guidelines_2026.pdf',
  'Gram_Vikas_Project_Report_April_2026.docx',
  'Blood_Donation_Camp_Certificate_Template.pdf',
  'Socio_Economic_Survey_Form_Blank.xlsx',
  'Campus_Cleaning_Drive_Snapshots.zip'
];
preseededFiles.forEach(fileName => {
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `This is the official NSS Resource package content for ${fileName}. Thank you for your leadership in the National Service Scheme.`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, systemInstruction } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in the environment.");
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate content", details: error.message });
    }
  });

  // Resources System Endpoints
  app.get("/api/resources", (req, res) => {
    try {
      const data = fs.readFileSync(metadataPath, "utf-8");
      const localFiles = JSON.parse(data);
      res.json({ localFiles });
    } catch (err: any) {
      console.error("Error reading resources metadata:", err);
      res.status(500).json({ error: "Failed to read resource listings" });
    }
  });

  app.post("/api/resources/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file was selected for upload." });
      }

      const { category, customTitle, uploadedBy } = req.body;
      const file = req.file;

      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

      const displayName = customTitle && customTitle.trim() 
        ? `${customTitle.trim().replace(/\.[^/.]+$/, "")}${path.extname(file.originalname)}` 
        : file.originalname;

      const newResource = {
        id: `server-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: displayName,
        category: category || "Other 01",
        uploadedBy: uploadedBy || "Volunteer",
        uploadedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).replace(/ /g, '-'),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        filename: file.filename,
        isLocal: true
      };

      metadata.unshift(newResource);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      res.status(201).json({ success: true, resource: newResource });
    } catch (err: any) {
      console.error("Upload route error:", err);
      res.status(500).json({ error: "Internal Server Error during upload" });
    }
  });

  app.get("/api/resources/download/:id", (req, res) => {
    try {
      const { id } = req.params;

      // Handle preseeded resources first
      const preseededMap: { [key: string]: string } = {
        '1': 'NSS_Regular_Activities_Manual.pdf',
        '2': 'Annual_Special_Camp_Guidelines_2026.pdf',
        '3': 'Gram_Vikas_Project_Report_April_2026.docx',
        '4': 'Blood_Donation_Camp_Certificate_Template.pdf',
        '5': 'Socio_Economic_Survey_Form_Blank.xlsx',
        '6': 'Campus_Cleaning_Drive_Snapshots.zip'
      };

      if (preseededMap[id]) {
        const fileName = preseededMap[id];
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          return res.download(filePath, fileName);
        }
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      const resource = metadata.find((r: any) => r.id === id);

      if (!resource) {
        return res.status(404).json({ error: "Resource item not found in repository." });
      }

      const filePath = path.join(uploadDir, resource.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Physical file was cleared or does not exist." });
      }

      res.download(filePath, resource.name);
    } catch (err: any) {
      console.error("Download route error:", err);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  app.delete("/api/resources/:id", (req, res) => {
    try {
      const { id } = req.params;
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      const resourceIndex = metadata.findIndex((r: any) => r.id === id);

      if (resourceIndex === -1) {
        return res.status(404).json({ error: "Resource not found" });
      }

      const resource = metadata[resourceIndex];
      const filePath = path.join(uploadDir, resource.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      metadata.splice(resourceIndex, 1);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      res.json({ success: true, message: "Resource removed successfully" });
    } catch (err: any) {
      console.error("Delete route error:", err);
      res.status(500).json({ error: "Failed to delete resource entry" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
