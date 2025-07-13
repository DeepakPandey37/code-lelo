const express = require("express");
const app = express();
const path = require("path");


const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const queryRoutes = require("./routes/aiRoute");


const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Connect to Database
database.connect();

// Set EJS as the view engine

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Optionally set the views directory if different from the default './views'
// app.set("views", "path/to/views");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(cookieParser());

// CORS is typically used for APIs; if you're rendering EJS pages, you might remove or adjust it
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Cloudinary Connection
cloudinaryConnect();


// Routes - adjust prefixes if needed for EJS-based pages
app.use("/auth", userRoutes);
app.use("/admin", adminRoutes);
app.use("/complaints", complaintRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/aiRoutes" , queryRoutes);


// Default Route
app.get("/", (req, res) => {
  // For EJS, you could render a homepage template instead of sending JSON
  return res.render("index", {
    title: "Home",
    message: "Your server is up and running....",
  });
});


// Start Server
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
