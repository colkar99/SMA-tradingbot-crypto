exports.emailFormat = (format, data) => {
  switch (format) {
    case "longEntryOrder": {
      let temp = `Long Entry order executed with SL order please check below for reference
          ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "songEntryOrder": {
      let temp = `Short Entry order executed with SL order please check below for reference
            ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "orderComplete": {
      let temp = `Your order was successfully completed with exit signal Please check below to calculate loss
        ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "orderCompleteSl": {
      let temp = `Your order was successfully completed with stop Loss hit Please check below to calculate loss
      ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "cancelledOrder": {
      let temp = `STOP_LOSS order was cancelled .Please check edit it manually.
      ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
    case "errorHandler": {
      let temp = `Some Error happened please check the stack below.
        ${data}`;
      return temp;
      //  return "<p>Your email otp is @emailOtp. This will expire with in @validateminutes hours.</p>"
    }
  }
};
