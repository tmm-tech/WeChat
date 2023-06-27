// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserRoutes = require('./routes/UserRoutes');
const app = express();
const port = 3030;

app.use(express.json());
app.use(cors());


// Routes
app.use('/users', UserRoutes);
// Define your routes here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
