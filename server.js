const express = require("express");
const cors = require("cors");
const app = express();
const Renters = require("./routes/authRoute");
const Owners = require("./routes/authOwner");
const Global = require("./routes/routes");
const Property = require("./routes/propertyRoute");
const Admin = require("./routes/adminRoute");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./config/database')
const crypto = require('crypto');

const PORT = 8080 || process.env.PORT;

app.use(express.json());

app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Include cookies and other credentials in CORS requests
};

app.use(cors(corsOptions));


// Use the routes with their prefixes
app.use("/api", Global);
app.use("/api/user", Renters);
app.use("/api/manager", Owners);
app.use("/api/property", Property);
app.use("/api/admin", Admin);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
