exports.emailFormat = (format, data) => {
  switch (format) {
    case "entryOrder": {
      let type = data.orderType == "BUY" ? "Long" : "Short";
      let temp = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Order note</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
 
      </head>
      <body>
      
      <div class="container">
        <h2>${type} entry order executed with SLL order please check the details below</h2>
        <table border='1' style='border-collapse:collapse'>
          <thead>
            <tr>
              <th class="header">Name</th>
              <th class="header">Side</th>
              <th class="header">Time</th>
              <th class="header">Capital</th>
              <th class="header">SL%</th>
              <th class="header">SL$</th>
              <th class="header">Position size$</th>
              <th class="header">Position size(BTC)</th>
              <th class="header">Entry</th>
              <th class="header">Quantity</th>
              <th class="header">C-Quantity</th>
              <th class="header">MOS</th>
              <th class="header">SLLOS</th>
              <th class="header">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.pairName}</td>
              <td>${data.orderType}</td>
              <td>${data.timeFrameInMin} Mins</td>
              <td>${data.totalCapital}$</td>
              <td>${data.slPercent.toFixed(2)}%</td>
              <td>${data.riskPerTrade}$</td>
              <td>${data.positionSizeCurrency}$</td>
              <td>${data.positionSizeBTC}</td>
              <td>${data.entryPrice}</td>
              <td>${data.quantity}</td>
              <td>${data.cummulativeQuoteQty}</td>
              <td>${data.entryOrderStatus}</td>
              <td>${data.slOrderStatus}</td>
              <td>${new Date(data.entryDate).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <strong>Note</strong>
        <p>MOS - Market order status(Entry order)</p>
        <p>SLLOS - Stoploss limit order status</p>
        <p>SL - Stoploss</p>
        <p>C-Quantity - Consider this as quantity for sell orders</p>

      </div>
      
      </body>
      </html>
      `;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "orderComplete": {
      let temp = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Order note</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
 
      </head>
      <body>
      
      <div class="container">
        <h2>Your order was successfully completed with exit signal Please check below to calculate loss</h2>
        <table border='1' style='border-collapse:collapse'>
          <thead>
            <tr>
              <th class="header">Name</th>
              <th class="header">Side</th>
              <th class="header">Time</th>
              <th class="header">Capital</th>
              <th class="header">SL%</th>
              <th class="header">SL$</th>
              <th class="header">Position size$</th>
              <th class="header">Position size(BTC)</th>
              <th class="header">Entry</th>
              <th class="header">Exit</th>
              <th class="header">Quantity</th>
              <th class="header">C-Quantity</th>
              <th class="header">MOS</th>
              <th class="header">SLLOS</th>
              <th class="header">EOS</th>
              <th class="header">Entry Date<th>
              <th class="header">Exit Date<th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.pairName}</td>
              <td>${data.orderType}</td>
              <td>${data.timeFrameInMin} Mins</td>
              <td>${data.totalCapital}$</td>
              <td>${data.slPercent.toFixed(2)}%</td>
              <td>${data.riskPerTrade}$</td>
              <td>${data.positionSizeCurrency}$</td>
              <td>${data.positionSizeBTC}</td>
              <td>${data.entryPrice}</td>
              <td>${data.exitPrice}</td>
              <td>${data.quantity}</td>
              <td>${data.cummulativeQuoteQty}</td>
              <td>${data.entryOrderStatus}</td>
              <td>${data.slOrderStatus}</td>
              <td>${data.exitOrderStatus}</td>
              <td>${new Date(data.entryDate).toLocaleString()}</td>
              <td>${new Date(data.exitDate).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <strong>Note</strong>
      <p>MOS - Market order status(Entry order)</p>
      <p>SLLOS - Stoploss limit order status</p>
      <p>SL - Stoploss</p>
      <p>C-Quantity - Consider this as quantity for sell orders</p>
      <p>EOS - Exit order status</p>
      </body>
      </html>
        `;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "orderCompleteSl": {
      let temp = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Order note</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
 
      </head>
      <body>
      
      <div class="container">
        <h2>Your order was successfully completed with stop Loss hit Please check below to calculate loss</h2>
        <table border='1' style='border-collapse:collapse'>
          <thead>
            <tr>
              <th class="header">Name</th>
              <th class="header">Side</th>
              <th class="header">Time</th>
              <th class="header">Capital</th>
              <th class="header">SL%</th>
              <th class="header">SL$</th>
              <th class="header">Position size$</th>
              <th class="header">Position size(BTC)</th>
              <th class="header">Entry</th>
              <th class="header">Exit</th>
              <th class="header">Quantity</th>
              <th class="header">C-Quantity</th>
              <th class="header">MOS</th>
              <th class="header">SLLOS</th>
              <th class="header">EOS</th>
              <th class="header">Entry Date</th>
              <th class="header">Exit Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.pairName}</td>
              <td>${data.orderType}</td>
              <td>${data.timeFrameInMin} Mins</td>
              <td>${data.totalCapital}$</td>
              <td>${data.slPercent.toFixed(2)}%</td>
              <td>${data.riskPerTrade}$</td>
              <td>${data.positionSizeCurrency}$</td>
              <td>${data.positionSizeBTC}</td>
              <td>${data.entryPrice}</td>
              <td>${data.exitPrice}</td>
              <td>${data.quantity}</td>
              <td>${data.cummulativeQuoteQty}</td>
              <td>${data.entryOrderStatus}</td>
              <td>${data.slOrderStatus}</td>
              <td>${data.exitOrderStatus}</td>
              <td>${new Date(data.entryDate).toLocaleString()}</td>
              <td>${new Date(data.exitDate).toLocaleString()}</td>

            </tr>
          </tbody>
        </table>
      </div>
      <strong>Note</strong>
      <p>MOS - Market order status(Entry order)</p>
      <p>SLLOS - Stoploss limit order status</p>
      <p>SL - Stoploss</p>
      <p>C-Quantity - Consider this as quantity for sell orders</p>
      <p>EOS - Exit order status</p>
      </body>
      </html>
        `;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "cancelledOrder": {
      let temp = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Order note</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
 
      </head>
      <body>
      
      <div class="container">
        <h2>STOP_LOSS order was cancelled .Please check edit it manually</h2>
        <table border='1' style='border-collapse:collapse'>
          <thead>
            <tr>
              <th class="header">Name</th>
              <th class="header">Side</th>
              <th class="header">Time</th>
              <th class="header">Capital</th>
              <th class="header">SL%</th>
              <th class="header">SL$</th>
              <th class="header">Position size$</th>
              <th class="header">Position size(BTC)</th>
              <th class="header">Entry</th>
              <th class="header">Quantity</th>
              <th class="header">C-Quantity</th>
              <th class="header">MOS</th>
              <th class="header">SLLOS</th>
              <th class="header">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.pairName}</td>
              <td>${data.orderType}</td>
              <td>${data.timeFrameInMin} Mins</td>
              <td>${data.totalCapital}$</td>
              <td>${data.slPercent.toFixed(2)}%</td>
              <td>${data.riskPerTrade}$</td>
              <td>${data.positionSizeCurrency}$</td>
              <td>${data.positionSizeBTC}</td>
              <td>${data.entryPrice}</td>
              <td>${data.quantity}</td>
              <td>${data.cummulativeQuoteQty}</td>
              <td>${data.entryOrderStatus}</td>
              <td>${data.slOrderStatus}</td>
              <td>${new Date(data.entryDate).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      </body>
      </html>
        `;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "errorHandler": {
      let temp = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Order note</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
   
        </head>
        <body>
        
        <div class="container">
          <h2>Some Error happened please check the stack below</h2>
          <code>${data}</code>
        </div>
        
        </body>
        </html>
          `;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
  }
};
