const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const servicesRoutes = require("./routes/services-routes");
const furnizoriRoutes = require("./routes/furnizori-routes");
const organizatoriRoutes = require("./routes/organizatori-routes");
const eventsRoutes =require ("./routes/events-routes")
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join('uploads','images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/services", servicesRoutes);
app.use("/api/furnizori", furnizoriRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/organizatori", organizatoriRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Aceasta cale nu a fost gasita", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    "mongodb+srv://anamariadr:licenta123@cluster0.u7ghf.mongodb.net/planit?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
