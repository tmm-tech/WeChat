const UserRoutes = require('express').Router();
const {
    createUser,
    checkEmailExists,
    login,
    updateStatus,
    logout,
    getUserDetails,
} = require('../controllers/UserControllers');

// create and insert data into the table
UserRoutes.post('/register', createUser)
    //check email existence
UserRoutes.get('/check-email/:email', checkEmailExists)
// Login route
UserRoutes.post("/login", login);

// Update status route
UserRoutes.put("/update-status", updateStatus);

// Get user details route
UserRoutes.get("/:userId", getUserDetails);
// Logout route
UserRoutes.post("/logout", logout);


module.exports = UserRoutes