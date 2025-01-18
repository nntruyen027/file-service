var express =  require("express");
var multer =  require("multer");
var cors = require("cors");
var dotenv = require("dotenv");
var path = require("path");
var fs = require("fs");

dotenv.config();
const app = express();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 28 * 1024 * 1024 }, // 28MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.post("/", upload.array("files", 2), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    const files = req.files.map((file) => ({
        filename: file.filename,
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));

    res.json({ message: "Upload successful", files });
});

app.delete("/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.json({ message: "File deleted successfully" });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting file" });
        }
        res.json({ message: "File deleted successfully" });
    });
});

module.exports = app;
