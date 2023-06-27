const UserRoutes = require('express').Router();
const {
    createUser,
    getAUser,
    loginUser,
    Logout,
} = require('../controllers/UserControllers');

// create and insert data into the table
UserRoutes.post('/register', createUser)
    //read for a specific id
// UserRoutes.get('/user/:id', getAUser)
    // login a user
// UserRoutes.post('/login', loginUser)
    // logout user
// UserRoutes.post('/logout/:email', Logout)


module.exports = UserRoutes