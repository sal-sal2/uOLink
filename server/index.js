//import dns from 'dns';
//dns.setServers(['8.8.8.8', '1.1.1.1']);

import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import AuthRoute from "./Routes/AuthRoute.js";
import UserRoute from "./Routes/UserRoute.js";
import PostRoute from "./Routes/PostRoute.js";
import UploadRoute from "./Routes/UploadRoute.js";

const app = express();


// -------------------------
// MongoDB
// -------------------------

let mongoConnectionPromise = null;

const connectToMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    }).catch((error) => {
      mongoConnectionPromise = null;
      throw error;
    });
  }

  await mongoConnectionPromise;
};


// -------------------------
// Middleware
// -------------------------

app.use(express.json());

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allows non-browser tools such as curl/Postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// -------------------------
// Connect DB before routes
// -------------------------

app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


// -------------------------
// Health check
// -------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    message: "UOLink API is running",
  });
});


// -------------------------
// API Routes
// -------------------------

app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/upload", UploadRoute);


// -------------------------
// R2 image serving
// -------------------------

app.get("/images/:filename", async (req, res) => {
  try {
    const object = await env.IMAGES.get(req.params.filename);

    if (!object) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    if (object.httpMetadata?.contentType) {
      res.set(
        "Content-Type",
        object.httpMetadata.contentType
      );
    }

    const arrayBuffer = await object.arrayBuffer();

    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Image retrieval error:", error);

    return res.status(500).json({
      message: "Unable to retrieve image",
    });
  }
});


// -------------------------
// Express -> Cloudflare Worker
// -------------------------

const PORT = 3000;

app.listen(PORT);

export default httpServerHandler({
  port: PORT,
});
