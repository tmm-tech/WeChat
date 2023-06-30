const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const validateCreateUserSchema = require("../services/RegistrationValidation");

// Function to check if email exists in the Users array
function isEmailExists(email, users) {
  return users.some((user) => user.email === email);
}
// Function to retrieve user details by user ID
function getUserDetails(userId) {
  const userFilePath = path.join(__dirname, "..", "data", "Users.json");

  try {
    const usersData = fs.readFileSync(userFilePath);
    const users = JSON.parse(usersData);

    // Find the user by userId
    const user = users.find((user) => user.id === userId);

    if (!user) {
      return null; // User not found
    }

    return user;
  } catch (error) {
    console.log("Error reading Users.json:", error);
    return null; // Error reading file
  }
}

module.exports = {
  getUserDetails,
  createUser: async (req, res) => {
    const details = req.body;
    console.log(details);
    console.log("Begin Loading");

    try {
      console.log("Loading...");
      // Validate the content
      const value = await validateCreateUserSchema(details);

      const userFilePath = path.join(__dirname, "..", "data", "Users.json"); // Updated file path

      // Read existing users from Users.json
      let users = [];
      try {
        const usersData = fs.readFileSync(userFilePath);
        users = JSON.parse(usersData);
      } catch (error) {
        console.log("Error reading Users.json:", error);
      }

      // Check if email already exists
      if (isEmailExists(value.email, users)) {
        return res.status(400).json({
          success: false,
          message: "Email already exists. Please choose a different email.",
        });
      }

      // Find the maximum id in the existing users
      const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);

      // Increment the ID and assign the next ID
      const id = maxId + 1;

      // Hash the password
      const hashedPwd = await bcrypt.hash(value.password, 8);

      // Create user object with incremented ID
      const user = {
        id,
        fullname: value.fullname,
        email: value.email,
        profile: value.profile,
        status: "offline",
        isLoggedIn: false,
        password: hashedPwd,
      };
      console.log(user);

      // Add the new user to the array
      users.push(user);

      // Save the updated users array back to Users.json
      try {
        fs.writeFileSync(userFilePath, JSON.stringify(users)); // Updated file path
        console.log("User created and stored successfully!");
        res.json({ success: true, message: "Registration successful" });
      } catch (error) {
        console.log("Error writing to Users.json:", error);
        res.status(500).json({
          success: false,
          message: "Error creating user. Please try again.",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: `Invalid user details: ${error.message}`,
      });
    }
  },
  checkEmailExists: async (req, res) => {
    const email = req.params.email;

    const userFilePath = path.join(__dirname, "..", "data", "Users.json");

    try {
      const usersData = fs.readFileSync(userFilePath);
      const users = JSON.parse(usersData);

      const emailExists = isEmailExists(email, users);

      res.json({ exists: emailExists });
    } catch (error) {
      console.log("Error reading Users.json:", error);
      res.status(500).json({
        success: false,
        message: "Error checking email. Please try again.",
      });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // Validate the login credentials
      const value = await validateLoginSchema(req.body);
      
      const userFilePath = path.join(__dirname, "..", "data", "Users.json");
      
      // Read existing users from Users.json
      let users = [];
      try {
        const usersData = fs.readFileSync(userFilePath);
        users = JSON.parse(usersData);
        console.log(`Successful Login ${users}`)
      } catch (error) {
        console.log("Error reading Users.json:", error);
      }
      
      // Find the user with the matching email
      const user = users.find((user) => user.email === email);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password.",
        });
      }
      
      // Compare the password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password.",
        });
      }
      
      // Update user status and isLoggedIn
      user.status = "online";
      user.isLoggedIn = true;
      
      // Save the updated users array back to Users.json
      try {
        fs.writeFileSync(userFilePath, JSON.stringify(users));
        console.log("User logged in successfully!");
        res.json({ success: true, message: "Login successful" });
      } catch (error) {
        console.log("Error writing to Users.json:", error);
        res.status(500).json({
          success: false,
          message: "Error logging in. Please try again.",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: `Invalid login details: ${error.message}`,
      });
    }
  },
  
  updateStatus: async (req, res) => {
    const { userId, status } = req.body;
    
    const userFilePath = path.join(__dirname, "..", "data", "Users.json");
    
    try {
      const usersData = fs.readFileSync(userFilePath);
      const users = JSON.parse(usersData);
      
      // Find the user by userId
      const user = users.find((user) => user.id === userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      
      // Update user status
      user.status = status;
      
      // Save the updated users array back to Users.json
      try {
        fs.writeFileSync(userFilePath, JSON.stringify(users));
        console.log("User status updated successfully!");
        res.json({ success: true, message: "Status updated successfully" });
      } catch (error) {
        console.log("Error writing to Users.json:", error);
        res.status(500).json({
          success: false,
          message: "Error updating status. Please try again.",
        });
      }
    } catch (error) {
      console.log("Error reading Users.json:", error);
      res.status(500).json({
        success: false,
        message: "Error updating status. Please try again.",
      });
    }
  },
  
  logout: async (req, res) => {
    const { userId } = req.body;
    
    const userFilePath = path.join(__dirname, "..", "data", "Users.json");
    
    try {
      const usersData = fs.readFileSync(userFilePath);
      const users = JSON.parse(usersData);
      
      // Find the user by userId
      const user = users.find((user) => user.id === userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
      
      // Update user status and isLoggedIn
      user.status = "offline";
      user.isLoggedIn = false;
      
      // Save the updated users array back to Users.json
      try {
        fs.writeFileSync(userFilePath, JSON.stringify(users));
        console.log("User logged out successfully!");
        res.json({ success: true, message: "Logout successful" });
      } catch (error) {
        console.log("Error writing to Users.json:", error);
        res.status(500).json({
          success: false,
          message: "Error logging out. Please try again.",
        });
      }
    } catch (error) {
      console.log("Error reading Users.json:", error);
      res.status(500).json({
        success: false,
        message: "Error logging out. Please try again.",
      });
    }
  }
};
