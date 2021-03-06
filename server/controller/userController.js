const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class userControll {
  //adding new user
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation } = req.body;
    if (password === password_confirmation) {
      const hashPass = await bcrypt.hash(password, 10);
      const doc = new userModel({
        name: name,
        email: email,
        password: hashPass, // no need to add password confirmation
      });
      await doc.save();
      const savedUser = await userModel.findOne({ email: email });
      //genrate jwt token
      const registerToken = jwt.sign({ userID: savedUser._id }, "jhkhggcghh", {
        expiresIn: "5d",
      });
      //{expiresIn:"5d"} ==> expires in 5 days (m=> min)
      res.send({
        status: "Sucess",
        message: "Registration Sucessfull.",
        token: registerToken,
      });
    } else {
      res.send({
        status: "failed",
        message: "Password and confirm password dose not match.",
      });
    }
  };

  //user login
  static userLogin = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
      if (email && password) {
        const user = await userModel.findOne({ email: email });
        console.log(user);
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            const loginToken = jwt.sign({ userID: user._id }, "jhkhggcghh", {
              expiresIn: "5d",
            });
            res.send({
              status: "sucess",
              message: "Login sucessfull.",
              token: loginToken,
            });
          } else {
            res.send({
              status: "failed",
              message: "E-mail or Password is not valid.",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a registered user.",
          });
        }
      } else {
        res.send({ status: "failed", message: "All filds are required." });
      }
    } catch (err) {
      console.log(err);
      res.send({ status: "failed", message: "Unable to login." });
    }
  };
}

module.exports = userControll;
