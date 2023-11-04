import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../schema/Auth.js";
const AuthRouter = express.Router();

function JwtSignIn(jwtObject) {
  return jwt.sign(jwtObject, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
}

AuthRouter.post("/register", async (req, res) => {
  const user = req.body;
  const { password, firstName, lastName, email } = user;

  if (password != null && password != "" && email != "" && firstName != "") {
    const foundUser = await UserModel.find({ email: email });
    if (foundUser.length != 0) {
      return res.json({ message: "Email already exists", success: false });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.json({
          message: "Error while creating User.",
          success: false,
        });
      }
      const newUser = new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
        blogsLiked: 0,
        blogsPosted: 0,
        Roles: ["admin"],
      });
      newUser.save();
      const { password, ...jwtObject } = newUser._doc;
      const jwt = JwtSignIn(jwtObject);
      if (jwt) {
        return res
          .status(200)
          .cookie("access_token", jwt, {
            maxAge: 3600000,
          })
          .json({ message: "Registration Successfull", success: true });
      }
    });
  } else {
    res.json({ message: "No credentials Provided", success: false });
  }
});

AuthRouter.post("/login", async (req, res) => {
  const { email } = req.body;
  if (email != null && req.body.password != null) {
    const foundUser = await UserModel.findOne({ email: email });
    if (foundUser) {
      bcrypt.compare(
        req.body.password,
        foundUser.password,
        function (err, result) {
          if (err) {
            return res.status(202).json({
              message: "Error while comparing password",
              success: false,
            });
          }
          if (result) {
            const { password, ...jwtObject } = foundUser._doc;
            const jwt = JwtSignIn(jwtObject);
            if (jwt) {
              res.cookie("access_token", jwt, {
                maxAge: 86400000,
                httpOnly: true,
              });
              return res
                .status(200)
                .json({ message: "Logged in Successfull", success: true });
            }
          }
          if (!result) {
            res.status(203).json({
              message: "Email or Password is incorrect",
              success: false,
            });
          }
        }
      );
    } else {
      return res.status(203).json({
        message: "No user found with the email " + email,
        success: false,
      });
    }
  } else {
    return res
      .status(203)
      .json({ message: "Email and Passsword not provided", success: false });
  }
});

AuthRouter.post("/validate", (req, res) => {
  console.log(req.cookies);
  if (req.cookies?.access_token) {
    const verifyData = jwt.verify(
      req.cookies.access_token,
      process.env.JWT_SECRET_KEY
    );
    console.log(verifyData);
    if (verifyData.iat < verifyData.exp) {
      return res.json({ message: "You are authorized", success: true });
    }
  }
  return res.json({ success: false, message: "you are not authorized." });
});

export default AuthRouter;
