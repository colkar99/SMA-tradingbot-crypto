const User = require("../model/user");
const Order = require("../model/order");
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
    if (!user) return res.status(404).json({ message: "Invalid email ID" });
    const pass = await bcrypt.compare(req.body.password, user.password);
    if (!pass) return res.status(404).json({ message: "Incorrect passsword" });
    let jwToken = jwt.sign({ _id: user._id }, process.env.SECRET);
    user.token = jwToken;
    await user.save();
    console.log(jwToken);
    res.status(201).json({ message: "Success", token: jwToken });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    // console.log(req.userData);
    let start = req.query.start;
    let end = req.query.end;
    let dateFilter = {};
    if (req.query.type == "open") {
      dateFilter["exitOrderStatus"] = "NOT_STARTED";
    }
    if (req.query.type == "closed") {
      dateFilter["exitOrderStatus"] = "FILLED";
    }
    if (req.query.start && req.query.end) {
      if (req.query.type == "open") {
        dateFilter["exitOrderStatus"] = "NOT_STARTED";
        console.log("tset", dateFilter);
      }
      if (req.query.type == "closed") {
        dateFilter["exitOrderStatus"] = "FILLED";
      }
      dateFilter["createdAt"] = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    let orders = await Order.find(dateFilter).sort({ createdAt: -1 });
    if (!orders) return res.status(404).json({ message: "No Orders found" });
    res.status(200).json({ message: "success", data: orders });
  } catch (err) {
    next(err);
  }
};

exports.isRead = async (req, res, next) => {
  try {
    let order = await Order.findByIdAndUpdate(
      { _id: req.body._id },
      { isRead: true }
    );
    if (!order) return res.status(404).json({ message: "No Orders found" });

    res.status(201).json({ message: "Success" });
  } catch (err) {
    next(err);
  }
};
