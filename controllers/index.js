// Authenticated client, can make signed calls
const Binance = require("binance-api-node").default;
const mailer = require("../helper/mailer");
const mailerFormatter = require("../helper/emailFormating");

const client = Binance({
  apiKey: process.env.APIKEY,
  apiSecret: process.env.APISECRET,
  //   httpBase: "https://testnet.binance.vision/api",
  // getTime: n,
});
const mongoose = require("mongoose");
const Order = require("../model/order");
const Log = require("../model/log");

exports.login = async (req, res, next) => {
  res.send("Helloe worls");
};

exports.postTradingView = async (req, res, next) => {
  try {
    console.log("REQ DATA", req.body);
    req.body.tradeCurrencyType =
      req.body.ticker[req.body.ticker.length - 1] == "T" ? "USDT" : "BTC";
    // let data = await findPositionSize(req.body);
    await saveAlertFromTv(req, res, next);
    // console.log(await getTotalCapitalVal());
    // console.log(await client.marginAccountInfo());

    // console.log(await findPositionSize(req.body, next));
    if (req.body.message != "EXIT")
      console.log(await findPositionSize(req.body));

    //Buy
    if (req.body.message == "ENTRY LONG") {
      let result = await longEntry(req, res, next);
      // console.log(await getFreeQuantity("IOST"));

      //   await syncPairInfo();
      let message = mailerFormatter.emailFormat("entryOrder", result);
      mailer.sendMail("LONG ENTRY ORDER EXECUTED WITH SL ORDER", message);
    }
    //SELL
    else if (req.body.message == "ENTRY SHORT") {
      let result = await longEntry(req, res, next);
      //   await syncPairInfo();
      let message = mailerFormatter.emailFormat("entryOrder", result);
      mailer.sendMail("SHORT ENTRY ORDER EXECUTED WITH SL ORDER", message);
      // await placeSlOrder();
    } //Exit
    else if (req.body.message == "EXIT") {
      console.log("Inside exit");
      await exitEntry(req, res, next);
    }

    res.status(200).send("Order successfully placed");
  } catch (err) {
    next(err);
    // console.log(err.statusMessage);
  }
};

//function for exit entry
async function exitEntry(req, res, next) {
  return new Promise(async (res, rej) => {
    try {
      let order = await Order.find({
        isActive: true,
        pairName: req.body.ticker,
        slOrderStatus: "OPEN",
        isErrorHappend: false,
      });
      if (order.length == 0)
        throw new Error(
          "No live order present to exit please the orders manually"
        );
      if (order.length >= 2)
        throw new Error(
          "There are more than 1 open orders in our system please look on it"
        );
      console.log(order);
      let openOrder = await client.marginGetOrder({
        symbol: order[0].pairName,
        orderId: order[0].slOrderId,
      });
      console.log(openOrder);
      if (openOrder.status == "NEW") {
        console.log(openOrder.status);
        let result = await cancelSlandPlaceMarketOrder(order[0], openOrder);
        //SEND mail order completed
        let message = mailerFormatter.emailFormat("orderComplete", result);
        mailer.sendMail("ORDER EXIT WITH EXIT SIGNAL", message);
      } else if (openOrder.status == "FILLED") {
        let result = await Order.findOneAndUpdate(
          { _id: order[0]._id },
          // find a document with that filter
          {
            slOrderStatus: "FILLED",
            exitPrice: openOrder.stopPrice,
            exitOrderId: openOrder.orderId,
            exitOrderStatus: "FILLED",
            isActive: false,
            isRead: false,
            exitDate: new Date(),
          }, // document to insert
          { upsert: true, new: true, runValidators: true }
        );
        //Send mail that order closed already
        let message = mailerFormatter.emailFormat("orderCompleteSl", result);
        mailer.sendMail("ORDER EXIT WITH SL HIT", message);

        console.log(openOrder);
      } else if (openOrder.status == "Canceled") {
        let result = await Order.findOneAndUpdate(
          { _id: order[0]._id }, // find a document with that filter
          { slOrderStatus: "CANCELLED", isActive: false, isErrorHappend: true }, // document to insert
          { new: true }
        );
        let message = mailerFormatter.emailFormat("cancelledOrder", result);
        mailer.sendMail("IMPORTANT ATTENTION NEEDED", message);
        //tradingbotcolkar
        //throw error message to user
        //Send mail to update status manually in the system
      }
      //check sl order status

      res(order);
    } catch (err) {
      rej(err);
    }
  });
}
//
async function cancelSlandPlaceMarketOrder(order, openOrder) {
  return new Promise(async (res, rej) => {
    try {
      //cancell existing SL order

      await client.marginCancelOrder({
        symbol: openOrder.symbol,
        orderId: openOrder.orderId,
      });
      let currentPrice = await client.prices();
      let decimalCountLot = await getQuantityFloatNo(order.pairName);
      // console.log(currentPrice[openOrder.symbol]);
      order.slOrderStatus = "CANCELLED";
      let slOqty =
        +order.cummulativeQuoteQty - (0.15 / +order.cummulativeQuoteQty) * 100;
      let marketOrder = {
        newClientOrderId: order._id,
        symbol: order.pairName,
        type: "MARKET",
        side: order.orderType == "BUY" ? "SELL" : "BUY",
        quantity:
          order.orderType == "BUY"
            ? toFixed(order.quantity, +decimalCountLot)
            : toFixed(
                slOqty / currentPrice[openOrder.symbol],
                +decimalCountLot
              ),
        sideEffectType: "AUTO_REPAY",
      };
      let cliRes = await client.marginOrder(marketOrder);
      console.log("Exit order res", cliRes);
      let ePrice = 0;
      let qty = 0;
      // let commission = 0;
      for (let key of cliRes.fills) {
        ePrice += +key.price;
        qty += +key.qty;
        // commission += +key.commission;
      }
      ePrice = ePrice / cliRes.fills.length;
      order.exitPrice = +ePrice;
      order.exitOrderStatus = cliRes.status;
      order.exitOrderId = cliRes.orderId;
      order.exitQuantity = cliRes.executedQty;
      order.isActive = false;
      order.isRead = false;
      order.exitDate = new Date();

      // order.cummulativeQuoteQty = cliRes.cummulativeQuoteQty;
      await marketBuySellOrderLog(order, "EXIT");
      let result = await Order.findOneAndUpdate(
        { _id: order._id }, // find a document with that filter
        order, // document to insert
        { new: true }
      );
      res(result);
      //Place market order
    } catch (err) {
      res(err);
      // console.log(err);
    }
  });
}
//function for Long entry
async function longEntry(req, res, next) {
  return new Promise(async (res, rej) => {
    try {
      let order = await initializeOrderData(req);
      console.log(order);

      let marketOrder = {
        newClientOrderId: order._id,
        symbol: order.pairName,
        type: "MARKET",
        side: order.orderType,
        quoteOrderQty:
          order.tradeCurrencyType == "USDT"
            ? order.positionSizeCurrency
            : order.positionSizeBTC,
        sideEffectType: "MARGIN_BUY",
      };
      //   console.log(test);

      let cliRes = await client.marginOrder(marketOrder);
      let decimalCountLot = await getQuantityFloatNo(order.pairName);

      console.log("Entry order", cliRes);
      let ePrice = 0;
      let qty = 0;
      let commission = 0;
      for (let key of cliRes.fills) {
        ePrice += +key.price;
        qty += +key.qty;
        commission += +key.commission;
      }
      order.baseAsset = await getBaseAndQuote(order.pairName, "base");
      order.quoteAsset = await getBaseAndQuote(order.pairName, "quote");
      ePrice = ePrice / cliRes.fills.length;
      order.entryPrice = ePrice;
      order.entryOrderStatus = cliRes.status;
      order.entryOrderId = cliRes.orderId;
      order.cummulativeQuoteQty = cliRes.cummulativeQuoteQty;
      order.quantity = toFixed(
        +cliRes.executedQty - +commission,
        +decimalCountLot
      );

      await marketBuySellOrderLog(order);

      //Stoploss order practise
      // let slQty = toFixed(
      //   +order.quantity,
      //   pairNames[order.pairName].decimalCountLot
      // );
      // order.quantity = +slQty;

      //   let stopPrice = (0.1 / 100) * +0.08475 + +0.08475;

      let stopPrice;
      let slQty;
      let slOqty =
        +order.cummulativeQuoteQty - (0.15 / +order.cummulativeQuoteQty) * 100;
      if (order.orderType == "BUY") {
        stopPrice = (0.2 / 100) * +order.slPrice + +order.slPrice;
      } else if (order.orderType == "SELL") {
        stopPrice = +order.slPrice - (0.2 / 100) * +order.slPrice;
        slQty = toFixed(+slOqty / +order.slPrice, +decimalCountLot);
      }

      let stopLossOrder = {
        side:
          order.orderType == "BUY"
            ? "SELL"
            : order.orderType == "SELL"
            ? "BUY"
            : "",
        symbol: order.pairName,
        quantity: order.orderType == "BUY" ? order.quantity : slQty,
        type: "STOP_LOSS_LIMIT",
        stopPrice: +toFixed(+stopPrice, +order.slPrice.countDecimals()),
        price: +order.slPrice,
        sideEffectType: "AUTO_REPAY",
      };
      console.log(stopLossOrder);
      let slOrderRes = await client.marginOrder(stopLossOrder);
      await stopLossBuySellOrderLog(order, slOrderRes);
      console.log(slOrderRes);
      order.slOrderId = slOrderRes.orderId;
      let result = await order.save();
      console.log(result);
      res(result);
    } catch (err) {
      rej(err);
      // console.log(err);
    }
  });
}
//Initialize order datas for both long and short
async function initializeOrderData(req) {
  return new Promise((res, rej) => {
    try {
      let side =
        req.body.message == "ENTRY LONG" ? "BUY" : "ENTRY SHORT" ? "SELL" : "";
      res(
        new Order({
          orderType: side,
          pairName: req.body.ticker,
          entryPrice: req.body.entryprice,
          entryOrderStatus: "INITIALIZE",
          entryDate: new Date(),
          slPrice: req.body.stopprice,
          slPercent: req.body.data.sl,
          riskPerTrade: req.body.data.riskPerTrade,
          totalCapital: req.body.data.capital,
          positionSizeCurrency: req.body.data.usdt,
          positionSizeBTC: req.body.data.btc,
          tradeCurrencyType: req.body.tradeCurrencyType,
          timeFrameInMin: req.body.timeFrameInMin,
        })
      );
    } catch (err) {
      rej(err);
      console.log("Line no 90", err);
    }
  });
}
//Save logs market buy and sell order
async function marketBuySellOrderLog(order, type = "") {
  return new Promise(async (res, rej) => {
    try {
      var date = new Date("2021-08-22T01:13:00Z");
      const log = new Log({
        heading: `${type} MARKET ${order.orderType} order is placed`,
        description: `${type} MARKET ${order.orderType} order is placed at ${
          type == "EXIT" ? order.exitPrice : order.entryPrice
        } with qty of ${
          type == "EXIT" ? order.exitQuantity : order.quantity
        } and order status is ${
          type == "EXIT" ? order.exitOrderStatus : order.entryOrderStatus
        } . Date:${date}`,
        ticker: order.pairName,
        log: JSON.stringify(order),
      });
      await log.save();
      //   console.log(log);
      res(true);
    } catch (err) {
      rej(err);
      // console.warn(err);
    }
  });
}
//Save logs Stoploss buy and sell order
async function stopLossBuySellOrderLog(order, slOrder) {
  return new Promise(async (res, rej) => {
    try {
      var date = new Date("2021-08-22T01:13:00Z");
      let side = order.orderType == "BUY" ? "SELL" : "BUY";
      const log = new Log({
        heading: `STOP_LOSS_LIMIT ${side} order is placed for ${order.pairName}`,
        description: `STOP_LOSS_LIMIT ${side} order is placed at ${order.slPrice} with qty of ${order.quantity} and order status is ${order.slOrderStatus} . Date:${date}`,
        ticker: order.pairName,
        log: JSON.stringify(slOrder),
      });
      await log.save();
      //   console.log(log);
      res(true);
    } catch (err) {
      rej(err);
      // console.warn(err);
    }
  });
}
//save alert logs from tradingView
async function saveAlertFromTv(req) {
  return new Promise(async (res, rej) => {
    try {
      var date = new Date("2021-08-22T01:13:00Z");
      let des = "";
      if (
        req.body.message == "ENTRY SHORT" ||
        req.body.message == "ENTRY LONG"
      ) {
        des = `${req.body.message} signal from ${req.body.ticker} at ${
          req.body.entryprice
        } and SL:${req.body.stopprice}. Date:${date.toGMTString()}`;
      } else {
        des = `${req.body.message} signal for ${
          req.body.ticker
        } at Market price. Date:${date.toGMTString()}`;
      }
      const log = new Log({
        heading: req.body.message,
        description: des,
        ticker: req.body.ticker,
        log: JSON.stringify(req.body),
      });
      await log.save();
      //   console.log(log);
      res(true);
    } catch (err) {
      rej(err);
      // console.warn(err);
    }
  });
}
//find position size
async function findPositionSize(val) {
  return new Promise(async (res, rej) => {
    try {
      console.log("inside position");

      //   JSON.parse(JSON.stringify(await getTotalCapitalVal()));
      let capitalBtc = JSON.parse(JSON.stringify(await getTotalCapitalVal()));
      //   console.log(capitalBtc);
      let btcPrice = await client.avgPrice({ symbol: "BTCUSDT" });
      console.log(btcPrice);
      ///REAL//////
      let toatalCapitalUSDT = Math.round(
        capitalBtc.totalNetAssetOfBtc * btcPrice["price"]
      );
      ///Comment this for original capital val//////

      // let toatalCapitalUSDT = 250;
      //   console.log(toatalCapitalUSDT);
      let slPer = await findSlPercentage(val);
      let positionUSDT = Math.round(toatalCapitalUSDT / slPer);
      let positionBTC = positionUSDT / btcPrice["price"];
      let result = {
        usdt: positionUSDT,
        btc: +positionBTC.toFixed(8),
        sl: +slPer.toFixed(3),
        capital: +toatalCapitalUSDT,
        riskPerTrade: (+toatalCapitalUSDT / 100) * 1,
      };
      val.data = result;
      res(result);
    } catch (err) {
      // console.log(err);
      rej(err);
    }
  });
}
//find sl percentage
async function findSlPercentage(val) {
  return new Promise((res, rej) => {
    try {
      if (val.message == "ENTRY LONG") {
        res(((val.entryprice - val.stopprice) / val.entryprice) * 100);
      } else if (val.message == "ENTRY SHORT") {
        res(
          Math.abs(((val.entryprice - val.stopprice) / val.entryprice) * 100)
        );
      }
    } catch (err) {
      rej(err);
    }
  });
}
//get total capital value from binance
async function getTotalCapitalVal() {
  return new Promise(async (res, rej) => {
    try {
      let response = await client.marginAccountInfo();
      res(response);
    } catch (err) {
      rej(err);
      // console.log(err);
    }
  });
}
//Get quantity for placing orders
async function placeSlOrder(pairName) {
  return new Promise(async (res, rej) => {
    try {
      let response = await client.marginAccountInfo();
      console.log(response);
      let data = {
        side: "BUY",
        symbol: "LINKBTC",
        // quantity: 1.2,
        type: "STOP_LOSS_LIMIT",
        stopPrice: 0.00083667,
        price: 0.00083835,
        sideEffectType: "AUTO_REPAY",
      };
      console.log(data);
      // let slOrderRes = await client.marginOrder(data);
      // console.log(slOrderRes);
      let resukt = await client.exchangeInfo();
      console.log(resukt);
      res(true);
    } catch (err) {
      rej(err);
      console.log(err);
    }
  });
}

Number.prototype.countDecimals = function () {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0;
};
function toFixed(num, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)[0];
}

//get base and quote asset name
async function getBaseAndQuote(pairName, type) {
  try {
    // throw new Error("Manual error by karthik");
    // await testError2(req, res, next);
    let base = "";
    let quote = "";
    if (pairName[pairName.length - 1] == "T") {
      let lengthToSplice = pairName.length - 4;
      base = pairName.slice(0, lengthToSplice);
      quote = "USDT";
    } else {
      let lengthToSplice = pairName.length - 3;
      base = pairName.slice(0, lengthToSplice);
      quote = "BTC";
    }
    if (type == "base") return base;
    if (type == "quote") return quote;
    // console.log(await client.marginAccountInfo());
  } catch (err) {
    console.log(err);
    // next(err);
  }
}
//Error testing function
async function getFreeQuantity(name) {
  return new Promise(async (res, rej) => {
    try {
      let val = await client.marginAccountInfo();
      res(val.userAssets.find((a) => a.asset == name).free);
      // console.log(await client.marginAccountInfo());
    } catch (err) {
      next(err);
    }
  });
}
//GET quantity float numbers
async function getQuantityFloatNo(name) {
  return new Promise(async (res, rej) => {
    try {
      const pairs = await client.exchangeInfo();
      if (!pairs.symbols) {
        rej(false);
      }
      pairs.symbols.forEach((pair) => {
        // console.log(pair);
        let pairInfo = {};
        if (pair.symbol == name) {
          const lotSize = pair.filters.find((f) => f.filterType === "LOT_SIZE");
          pairInfo.lot_size = parseFloat(lotSize.stepSize);
          pairInfo.decimalCountLot = parseFloat(
            lotSize.stepSize
          ).countDecimals();
          res(pairInfo.decimalCountLot);
        }
      });
    } catch {
      console.log(err);
    }
  });
}
//Error testing function
exports.testError = async (req, res, next) => {
  try {
    // let resr = await Order.updateMany({ isRead: false });
    res.send("success");
    // console.log(await getQuantityFloatNo("ETCUSDT"));
  } catch (err) {
    next(err);
  }
};

//test trading view logs
exports.tradingViewSignal = async (req, res, next) => {
  try {
    let result = {
      entryOrderStatus: "FILLED",
      orderType: "SELL",
      entryPrice: 2.865,
      slOrderStatus: "OPEN",
      exitOrderStatus: "NOT_STARTED",
      feesInPercent: 0.15,
      tradeCurrencyType: "USDT",
      globalCurrency: "$",
      isActive: true,
      isDelete: false,
      isErrorHappend: false,
      _id: "612ab1e566fece0016acf645",
      pairName: "ADAUSDT",
      entryDate: "2021-08-28T22:00:05.431Z",
      slPrice: 2.47,
      slPercent: 13.697,
      riskPerTrade: 10.15,
      totalCapital: 1015,
      positionSizeCurrency: 74,
      positionSizeBTC: 0.00151209,
      timeFrameInMin: "60",
      baseAsset: "ADA",
      quoteAsset: "USDT",
      entryOrderId: "2211713214",
      cummulativeQuoteQty: 73.917,
      quantity: 26,
      slOrderId: "2211713426",
      createdAt: "2021-08-28T22:00:06.633Z",
      updatedAt: "2021-08-28T22:00:06.633Z",
      __v: 0,
    };
    let message = mailerFormatter.emailFormat("longEntryOrder", result);
    mailer.sendMail("LONG ENTRY ORDER EXECUTED WITH SL ORDER", message);

    res.status(200).send("Success");
  } catch {
    next(err);
  }
};

exports.getPairFilters = async (req, res, next) => {
  try {
    const pairNames = [
      "BTCUSDT",
      "AAVEBTC",
      "ADABTC",
      "AVAXBTC",
      "BCHBTC",
      "BNBBTC",
      "CHZBTC",
      "EGLDBTC",
      "ETCBTC",
      "ETHBTC",
      "LINKBTC",
      "LTCBTC",
      "NEOBTC",
      "SOLBTC",
      "VETBTC",
      "XLMBTC",
      "XRPBTC",
      "ZECBTC",
      "ADAUSDT",
      "ALGOUSDT",
      "BNBUSDT",
      "CHZUSDT",
      "EGLDUSDT",
      "ETCUSDT",
      "ETHUSDT",
      "IOSTUSDT",
      "IOTAUSDT",
      "LINKUSDT",
      "LTCUSDT",
      "NEARUSDT",
      "NEOUSDT",
      "ONTUSDT",
      "QTUMUSDT",
      "SOLUSDT",
      "THETAUSDT",
      "VETUSDT",
      "XRPUSDT",
      "XTZUSDT",
      "ZILUSDT",
      "TRXUSDT",
    ];
    const pairs = await client.exchangeInfo();

    if (!pairs.symbols) {
      return;
    }

    const exchangePairs = {};
    pairs.symbols.forEach((pair) => {
      if (pairNames.includes(pair.symbol)) {
        const pairInfo = {};

        const priceFilter = pair.filters.find(
          (f) => f.filterType === "PRICE_FILTER"
        );
        if (priceFilter) {
          pairInfo.tick_size = parseFloat(priceFilter.tickSize);
          //   pairInfo.decimalCountPrice = parseFloat(
          //     priceFilter.tickSize
          //   ).countDecimals();
        }

        const lotSize = pair.filters.find((f) => f.filterType === "LOT_SIZE");
        if (priceFilter) {
          pairInfo.lot_size = parseFloat(lotSize.stepSize);
          pairInfo.decimalCountLot = parseFloat(
            lotSize.stepSize
          ).countDecimals();
        }

        exchangePairs[pair.symbol] = pairInfo;
      }
    });

    console.log(`Binance Margin: pairs synced: ${pairs.symbols.length}`);
    console.log(exchangePairs);
    res.send(exchangePairs);
    //   exchangePairs = exchangePairs;
  } catch (err) {
    next(err);
  }
};
