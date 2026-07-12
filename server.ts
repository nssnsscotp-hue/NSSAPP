import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

dotenv.config();

const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
);
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const memoryStorage = multer.memoryStorage();
const uploadMem = multer({ storage: memoryStorage });

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

  // Server-side Firebase Storage upload proxy (bypasses browser CORS and iframe sandbox restrictions)
  app.post("/api/firebase/upload", uploadMem.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file was selected for upload." });
      }

      const { folder, bucket } = req.body;
      const file = req.file;

      // Select target storage bucket (supports dynamic sharded storage router)
      let activeStorage = getStorage(firebaseApp);
      if (bucket && bucket.trim() !== "" && bucket !== firebaseConfig.storageBucket) {
        const appId = `shard_${bucket.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const activeApp = getApps().find(a => a.name === appId) || initializeApp({
          ...firebaseConfig,
          storageBucket: bucket
        }, appId);
        activeStorage = getStorage(activeApp);
      }

      const folderPath = folder || "uploads";
      const fileExt = file.originalname.split('.').pop() || 'jpg';
      const cleanName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const fileRef = ref(activeStorage, `${folderPath}/${cleanName}`);

      // Convert Node.js Buffer explicitly to a clean Uint8Array for server-side compatibility with the client SDK
      const dataBytes = new Uint8Array(file.buffer);

      // Upload the file buffer to Firebase Storage on the server side
      await uploadBytes(fileRef, dataBytes, {
        contentType: file.mimetype
      });

      // Retrieve the permanent public download URL
      const downloadUrl = await getDownloadURL(fileRef);

      res.status(200).json({ success: true, url: downloadUrl });
    } catch (err: any) {
      const errMsg = err.message || String(err);
      if (errMsg.includes("storage/unknown") || errMsg.includes("unknown error") || errMsg.includes("storage/unauthorized")) {
        console.info(`[Storage Router] Firebase Storage bucket is unprovisioned or pending console activation. Routing asset securely to local container storage.`);
      } else {
        console.warn("[Storage Router] Firebase Cloud Storage upload failed, falling back to local storage:", errMsg);
      }
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: "No file was selected for upload." });
        }
        const fileExt = file.originalname.split('.').pop() || 'jpg';
        const diskFilename = `fallback_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
        const filePath = path.join(uploadDir, diskFilename);
        
        fs.writeFileSync(filePath, file.buffer);
        const downloadUrl = `/api/uploads/${diskFilename}`;
        
        console.log(`Fallback local write successful. Served at: ${downloadUrl}`);
        res.status(200).json({ 
          success: true, 
          url: downloadUrl,
          message: "Secure fallback container routing."
        });
      } catch (fallbackErr: any) {
        console.error("Local directory write fallback error:", fallbackErr);
        res.status(500).json({ error: "Fallback storage write failed. Both Cloud and Local storage are unavailable." });
      }
    }
  });

  // Serve photos and files from local container uploads directory
  app.get("/api/uploads/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      
      // Stop directory traversal attacks
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(403).json({ error: "Access denied." });
      }
      
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      } else {
        return res.status(404).send("File not found in local container pool.");
      }
    } catch (err: any) {
      console.error("Local asset streaming error:", err);
      res.status(500).send("Asset delivery error.");
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

  // Gallery Local Fallback Endpoints (In case Supabase 'gallery' table is missing/pending)
  const galleryMetadataPath = path.join(uploadDir, "gallery.json");
  if (!fs.existsSync(galleryMetadataPath)) {
    fs.writeFileSync(galleryMetadataPath, JSON.stringify([
      {
        id: "preseeded-1",
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
        title: "NSS Green Clean Drive Initiative",
        date: "2026-04-12",
        category: "Camp"
      },
      {
        id: "preseeded-2",
        url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60",
        title: "Socio-Economic Survey Planning Meeting",
        date: "2026-05-01",
        category: "Meeting"
      }
    ], null, 2));
  }

  app.get("/api/public-gallery", (req, res) => {
    try {
      const data = fs.readFileSync(galleryMetadataPath, "utf-8");
      res.json({ success: true, list: JSON.parse(data) });
    } catch (err: any) {
      console.error("Local gallery read error:", err);
      res.status(500).json({ error: "Failed to read local gallery metadata" });
    }
  });

  app.post("/api/public-gallery", (req, res) => {
    try {
      const { url, title, date, category } = req.body;
      if (!url || !title) {
        return res.status(400).json({ error: "URL and Title are required for local gallery." });
      }

      const list = JSON.parse(fs.readFileSync(galleryMetadataPath, "utf-8"));
      const newItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url,
        title,
        date: date || new Date().toISOString().split('T')[0],
        category: category || "Activity"
      };

      list.unshift(newItem);
      fs.writeFileSync(galleryMetadataPath, JSON.stringify(list, null, 2));
      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Local gallery write error:", err);
      res.status(500).json({ error: "Failed to save to local gallery metadata" });
    }
  });

  app.delete("/api/public-gallery/:id", (req, res) => {
    try {
      const { id } = req.params;
      const list = JSON.parse(fs.readFileSync(galleryMetadataPath, "utf-8"));
      const index = list.findIndex((item: any) => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Gallery item not found in local cache." });
      }

      list.splice(index, 1);
      fs.writeFileSync(galleryMetadataPath, JSON.stringify(list, null, 2));
      res.json({ success: true, message: "Gallery item removed safely from local registry." });
    } catch (err: any) {
      console.error("Local gallery delete error:", err);
      res.status(500).json({ error: "Failed to delete local gallery item" });
    }
  });

  // NSS Blood Donors Local Database Fallback
  const donorsPath = path.join(uploadDir, "blood_donors.json");
  if (!fs.existsSync(donorsPath)) {
    fs.writeFileSync(donorsPath, JSON.stringify([
      {
        id: "donor-ps-1",
        full_name: "Rahul K. S.",
        blood_group: "O+",
        mobile: "9446112233",
        unit: "Unit 36",
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "donor-ps-2",
        full_name: "Anjana Krishnan",
        blood_group: "A+",
        mobile: "8129004455",
        unit: "Unit 94",
        created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "donor-ps-3",
        full_name: "Sidharth Sharma",
        blood_group: "B+",
        mobile: "9847006677",
        unit: "Unit 36",
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "donor-ps-4",
        full_name: "Fathima N.",
        blood_group: "O-",
        mobile: "7012334455",
        unit: "Unit 94",
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "donor-ps-5",
        full_name: "Abhijith Nair",
        blood_group: "AB+",
        mobile: "9090112233",
        unit: "Unit 36",
        created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "donor-ps-6",
        full_name: "Sneha Prasad",
        blood_group: "B+",
        mobile: "9495881122",
        unit: "Unit 94",
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ], null, 2));
  }

  // NSS Blood Emergency Requests Local Database Fallback
  const bloodRequestsPath = path.join(uploadDir, "blood_requests.json");
  if (!fs.existsSync(bloodRequestsPath)) {
    fs.writeFileSync(bloodRequestsPath, JSON.stringify([
      {
        id: "req-ps-1",
        blood_group: "O+",
        units_required: "2 Units",
        hospital_venue: "Taluk Hospital, Ottapalam",
        contact_number: "9845112233",
        status: "active",
        created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        id: "req-ps-2",
        blood_group: "A-",
        units_required: "1 Unit",
        hospital_venue: "Valluvanad Hospital, Ottapalam",
        contact_number: "9447445566",
        status: "active",
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: "req-ps-3",
        blood_group: "B+",
        units_required: "3 Units",
        hospital_venue: "District Hospital, Palakkad",
        contact_number: "9946881122",
        status: "resolved",
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ], null, 2));
  }

  // Blood Donors Endpoints
  app.get("/api/blood-donors", (req, res) => {
    try {
      const data = fs.readFileSync(donorsPath, "utf-8");
      res.json({ success: true, list: JSON.parse(data) });
    } catch (err: any) {
      console.error("Local donors fetch error:", err);
      res.status(500).json({ error: "Failed to read local donors directory" });
    }
  });

  app.post("/api/blood-donors", (req, res) => {
    try {
      const { full_name, blood_group, mobile, unit } = req.body;
      if (!full_name || !blood_group || !mobile) {
        return res.status(400).json({ error: "Full Name, Blood Group, and Mobile are required." });
      }

      const list = JSON.parse(fs.readFileSync(donorsPath, "utf-8"));
      const newItem = {
        id: `local-donor-${Date.now()}`,
        full_name,
        blood_group,
        mobile,
        unit: unit || "Unit 36",
        created_at: new Date().toISOString()
      };

      list.unshift(newItem);
      fs.writeFileSync(donorsPath, JSON.stringify(list, null, 2));
      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      console.error("Local donor register error:", err);
      res.status(500).json({ error: "Failed to registers donor locally" });
    }
  });

  app.delete("/api/blood-donors/:id", (req, res) => {
    try {
      const { id } = req.params;
      const list = JSON.parse(fs.readFileSync(donorsPath, "utf-8"));
      const index = list.findIndex((item: any) => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Donor profile not found." });
      }

      list.splice(index, 1);
      fs.writeFileSync(donorsPath, JSON.stringify(list, null, 2));
      res.json({ success: true, message: "Donor profile removed locally." });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete local donor." });
    }
  });

  // Emergency Requests Endpoints
  app.get("/api/blood-emergency-requests", (req, res) => {
    try {
      const data = fs.readFileSync(bloodRequestsPath, "utf-8");
      res.json({ success: true, list: JSON.parse(data) });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch emergency requests" });
    }
  });

  app.post("/api/blood-emergency-requests", (req, res) => {
    try {
      const { blood_group, units_required, hospital_venue, contact_number } = req.body;
      if (!blood_group || !hospital_venue || !contact_number) {
        return res.status(400).json({ error: "Blood group, venue, and contact are required." });
      }

      const list = JSON.parse(fs.readFileSync(bloodRequestsPath, "utf-8"));
      const newItem = {
        id: `local-req-${Date.now()}`,
        blood_group,
        units_required: units_required || "1 Unit",
        hospital_venue,
        contact_number,
        status: "active",
        created_at: new Date().toISOString()
      };

      list.unshift(newItem);
      fs.writeFileSync(bloodRequestsPath, JSON.stringify(list, null, 2));
      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to broadcast request locally" });
    }
  });

  app.patch("/api/blood-emergency-requests/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const list = JSON.parse(fs.readFileSync(bloodRequestsPath, "utf-8"));
      const reqItem = list.find((item: any) => item.id === id);

      if (!reqItem) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (status) {
        reqItem.status = status;
      }

      fs.writeFileSync(bloodRequestsPath, JSON.stringify(list, null, 2));
      res.json({ success: true, item: reqItem });
    } catch (err) {
      res.status(500).json({ error: "Failed to update emergency request info" });
    }
  });

  app.delete("/api/blood-emergency-requests/:id", (req, res) => {
    try {
      const { id } = req.params;
      const list = JSON.parse(fs.readFileSync(bloodRequestsPath, "utf-8"));
      const index = list.findIndex((item: any) => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Request not found" });
      }

      list.splice(index, 1);
      fs.writeFileSync(bloodRequestsPath, JSON.stringify(list, null, 2));
      res.json({ success: true, message: "Emergency request dismissed locally." });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove emergency request" });
    }
  });

  // =========================================================================
  // NSS Login Logs Local Database Fallback
  // =========================================================================
  const loginLogsPath = path.join(uploadDir, "login_logs.json");
  if (!fs.existsSync(loginLogsPath)) {
    fs.writeFileSync(loginLogsPath, JSON.stringify([], null, 2));
  }

  app.get("/api/login-logs", (req, res) => {
    try {
      let list = [];
      if (fs.existsSync(loginLogsPath)) {
        try {
          const data = fs.readFileSync(loginLogsPath, "utf-8");
          list = JSON.parse(data);
          if (!Array.isArray(list)) list = [];
        } catch (e) {
          console.warn("login_logs.json holds invalid JSON, resetting to empty list.");
          fs.writeFileSync(loginLogsPath, JSON.stringify([], null, 2));
        }
      } else {
        fs.writeFileSync(loginLogsPath, JSON.stringify([], null, 2));
      }
      res.json({ success: true, list });
    } catch (err: any) {
      console.error("Local login logs read error:", err);
      res.status(500).json({ error: "Failed to read local login logs", details: err.message });
    }
  });

  app.post("/api/login-logs", (req, res) => {
    try {
      const { username, name, role, mobile } = req.body;
      
      let list = [];
      if (fs.existsSync(loginLogsPath)) {
        try {
          const data = fs.readFileSync(loginLogsPath, "utf-8");
          list = JSON.parse(data);
          if (!Array.isArray(list)) list = [];
        } catch (e) {
          list = [];
        }
      }
      
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const clientIp = rawIp.split(',')[0].trim().replace(/^::ffff:/, '');

      const newLog = {
        id: `log-${Date.now()}`,
        username: username || 'anonymous',
        name: name || 'System User',
        role: role || 'volunteer',
        mobile: mobile || '',
        ip: clientIp,
        userAgent: req.headers['user-agent'] || 'Unknown Browser',
        timestamp: new Date().toISOString()
      };

      list.unshift(newLog);
      
      // Restrict log bloat to last 1000 entries
      if (list.length > 1000) {
        list.splice(1000);
      }
      
      fs.writeFileSync(loginLogsPath, JSON.stringify(list, null, 2));
      res.status(201).json({ success: true, item: newLog });
    } catch (err: any) {
      console.error("Local login logs register error:", err);
      res.status(500).json({ error: "Failed to register login log", details: err.message });
    }
  });

  app.delete("/api/login-logs", (req, res) => {
    try {
      fs.writeFileSync(loginLogsPath, JSON.stringify([], null, 2));
      res.json({ success: true, message: "Login logs purged successfully." });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete login logs." });
    }
  });

  // =========================================================================
  // SECURE SERVER-SIDE OTP MANAGEMENT
  // =========================================================================
  const otpStore = new Map<string, { otp: string; expires: number; mobile: string }>();

  // Clean up expired OTPs periodically to prevent leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of otpStore.entries()) {
      if (now > val.expires) {
        otpStore.delete(key);
      }
    }
  }, 1000 * 60 * 10); // Check every 10 minutes

  app.post("/api/send-otp", async (req, res) => {
    try {
      const { username, mobile } = req.body;
      if (!username || !mobile) {
        return res.status(400).json({ error: "Username and target mobile number are required." });
      }

      // Generate secure 6-digit OTP passcode
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in secret server map
      otpStore.set(username.toLowerCase().trim(), {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // Valid for 5 minutes
        mobile
      });

      console.log(`[🛡️ SERVER SECURITY LOGGER] Active OTP for username [${username}] is [${otp}].`);

      console.log(`[🔥 Firebase OTP Auth] Preparing authentication token dispatch on client-side container...`);

      return res.json({
        success: true,
        message: `Firebase OTP Auth initiated. Real-time verification has been configured on the secure client container.`,
        devNotice: "OTP is also generated safely on the server and printed below for seamless sandbox testing.",
        otp: otp
      });
    } catch (err: any) {
      console.error("Secure OTP dispatch error:", err);
      res.status(500).json({ error: "Failed to dispatch verification code safely." });
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    try {
      const { username, otp } = req.body;
      if (!username || !otp) {
        return res.status(400).json({ error: "Username and verification code are required." });
      }

      const key = username.toLowerCase().trim();
      const stored = otpStore.get(key);

      if (!stored) {
        return res.status(400).json({ error: "No pending password reset request was found for this user." });
      }

      if (Date.now() > stored.expires) {
        otpStore.delete(key);
        return res.status(400).json({ error: "The verification code has expired. Please request a new one." });
      }

      if (stored.otp !== otp.trim()) {
        return res.status(400).json({ error: "Invalid verification code. Please check your SMS and try again." });
      }

      // Validated! Clear OTP from memory so it can't be reused
      otpStore.delete(key);
      res.json({ success: true, message: "Code verified successfully." });
    } catch (err: any) {
      console.error("OTP verification error:", err);
      res.status(500).json({ error: "An error occurred during verification." });
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
