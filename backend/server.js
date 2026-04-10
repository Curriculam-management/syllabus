const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db"); // import DB
const governanceRoutes = require("./routes/governanceRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// route
app.get("/", (req, res) => {
    res.json({
        message: "Academic governance server is running.",
        database: app.locals.databaseMode || "unknown",
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        database: app.locals.databaseMode || "unknown",
    });
});

app.use("/api/governance", governanceRoutes);

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        message: error.message || "Something went wrong.",
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    const databaseConnected = await connectDB();
    app.locals.databaseMode = databaseConnected ? "mongodb" : "memory-fallback";

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
