const Binance = require("node-binance-api");
require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");

const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());

var server = http.createServer(app);
const mailer = require("./helper/mailer");
const mailerFormatter = require("./helper/emailFormating");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// create application/x-www-form-urlencoded parser
// Server listening code
mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((res) => console.log("db connected successfully"))
  .catch((err) => console.log(err));

app.get("/pingTest", (req, res) => {
  console.log("Cron-job pinged!!!!!!!");
  res.send("Pinged Successfully");
});
app.use("/api", indexRouter);
app.use("/api/v1/user", userRouter);
app.use((err, req, res, next) => {
  console.error("Error stack", err.stack);
  let message = mailerFormatter.emailFormat("errorHandler", err.stack);
  mailer.sendMail("ERROR HAPPENED IMMIDIATE ATTENTION NEEDED", message);
  //SEND ERROR TO MAIL
  // res.status(500).json(err);

  res.status(500).send(err);
});
server.listen(process.env.PORT || 3000, () => {
  mailer.pingMailServer();
  // mailer.sendMail("Hello World");
  console.log(`Server running at :${3000}`);
  console.log(`Doctor Backend running environment is ${process.env.NODE_ENV}`);
});

// const binance = new Binance().options({
//   APIKEY: process.env.APIKEY,
//   APISECRET: process.env.APISECRET,
// });
// console.log(process.env.APIKEY);

// binance.mgAccount((error, response) => {
//   if (error) return console.warn(error);
//   console.info("Account details response:", response);
// });
