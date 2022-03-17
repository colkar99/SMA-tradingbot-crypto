const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // console.log("inside validations");
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.SECRET);

    req.userData = decodedToken;
    // if (req.userData.isAssistant) {
    //     let doctor = await Doctor.findOne({ _id: req.userData.doctorId }).select("plans");

    //     if (doctor.plans.isPremiumDoctor == false)
    //         return res.status(404).json({ message: ['You are not in the premium plan'] });
    //     if (doctor.plans.premiumValidateUpto < new Date())
    //         return res.status(404).json({ message: ['Your premium plan is expired'] });
    // }
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json({
        error: "Token has been expired",
      });
    }
    res.status(401).json({
      error: "You are unauthorized to make this request.",
    });
  }
};
