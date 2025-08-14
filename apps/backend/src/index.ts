import express from "express";
import multer from "multer";
import cors from "cors"
import { Queue } from "bullmq";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files are saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({storage})

const app = express();
app.use(cors())

const queue = new Queue('fileUploadQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});


app.get("/", (req,res) => {
    return res.status(200).json({
        message: "Backend is up, working and serving requests"
    })
})

app.post("/fileUpload",upload.single("file"), async (req, res) => {
    if(!req.file) {
        console.log("File upload failed");
        return res.status(300).json({
            message: "File upload failed"
        })
    }
    await queue.add("file-upload-ready",JSON.stringify({
        filePath: req.file?.path
    }))
    res.status(200).json({
        message:"File upload successfull",
        filePath: req.file?.path
    })
})

app.listen(8000, () => {
    console.log("Server listening on http://localhost:8000")
})