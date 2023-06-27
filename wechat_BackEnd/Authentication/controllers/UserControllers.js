const bcrypt = require("bcrypt");
const fs = require("fs");
const validateCreateUserSchema = require("../services/RegistrationValidation");

module.exports = {
  createUser: async (req, res) => {
    const details = req.body;
    console.log(details);
    console.log("Begin Loading")

    try {
      console.log("Loading...");
      // Validate the content
      const value = await validateCreateUserSchema(details);

      // Hash the password
      const hashedPwd = await bcrypt.hash(value.password, 8);
      console.log(hashedPwd);
      // Create user object
      const user = {
        fullname: value.userName,
        email: value.email,
        image: value.profileImage,
        status: "offline",
        isLoggedIn: false,
        password: hashedPwd,
      };
      const userFilePath = path.join(
        __dirname,
        "data",
        "../../Database/Users.json"
      );
      // Read existing users from user.json
      let users = [];
      try {
        const usersData = fs.readFileSync(userFilePath);
        users = JSON.parse(usersData);
      } catch (error) {
        console.log("Error reading user.json:", error);
      }

      // Add the new user to the array
      users.push(user);

      // Save the updated users array back to user.json
      try {
        fs.writeFileSync("../", JSON.stringify(users));
        console.log("User created and stored successfully!");
        res.json({ success: true, message: "Registration successful" });
      } catch (error) {
        console.log("Error writing to user.json:", error);
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
};
