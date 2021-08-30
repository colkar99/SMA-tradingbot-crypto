const User = require("../model/user");
const bcrypt = require("bcrypt");
const saltRounds = +process.env.SALT;
var jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  try {
    const slt = await bcrypt.genSalt(saltRounds);
    const passHash = await bcrypt.hash(req.body.password, slt);
    console.log(passHash);
    const user = new User({
      name: req.body.name,
      password: passHash,
      email: req.body.email,
    });
    await user.save();
    res.status(201).json({ message: "Success" });
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("Invalid email ID");
    const pass = await bcrypt.compare(req.body.password, user.password);
    if (!pass) return res.status(404).json("Incorrect passsword");
    let jwToken = jwt.sign({ ...user }, process.env.SECRET);
    user.token = jwToken;
    await user.save();
    console.log(jwToken);
    res.status(201).json({ message: "Success", token: jwToken });
  } catch (err) {
    next(err);
  }
};
