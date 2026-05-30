import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    // Check if user exists
    const oldUser = await UserModel.findOne({ username: req.body.username });
    if (oldUser) {
      return res.status(400).json({ message: "Username is already registered!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass;

    // Save new user
    const newUser = new UserModel(req.body);
    const user = await newUser.save();

    // Generate token and send response
    const token = jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Login and existing user
export const loginUser = async (req, res) => {
    const {username, password} = req.body

    try {
        const user = await UserModel.findOne({username: username})


        if(user)
        {
            const validity = await bcrypt.compare(password, user.password)

            if (!validity) {
              res.status(400).json("Wrong password")
            } else {
              const token = jwt.sign(
                { username: user.username, id: user._id },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
              );
              res.status(200).json({user, token})
            }
        }
        else{
            res.status(404).json("User does not exists")
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}