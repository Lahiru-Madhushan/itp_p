// Basic payment controller
export const pay = async (req, res) => {
  try {
    // Extract payment details from request body
    const { amount, method, userId, cardNumber, cardExpiry, cardCVC, cardName } = req.body;

    // Simulate a successful payment
    const missingFields = [];
    if (!amount) missingFields.push("amount");
    if (!method) missingFields.push("method");
    if (!userId) missingFields.push("userId");

    if (method === "card") {
      if (!cardNumber) missingFields.push("cardNumber");
      if (!cardExpiry) missingFields.push("cardExpiry");
      if (!cardCVC) missingFields.push("cardCVC");
      if (!cardName) missingFields.push("cardName");
    }

    if (missingFields.length > 0) {
      console.error("Missing payment fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing payment details: ${missingFields.join(", ")}`
      });
    }

    // Basic card validation (Luhn check for card number, expiry format, CVC length, and name)
    if (method === "card") {
      // Luhn algorithm
      function luhnCheck(num) {
        let arr = (num + "")
          .split("")
          .reverse()
          .map((x) => parseInt(x));
        let sum = arr.reduce((acc, val, idx) => {
          if (idx % 2) {
            val *= 2;
            if (val > 9) val -= 9;
          }
          return acc + val;
        }, 0);
        return sum % 10 === 0;
      }

      if (!luhnCheck(cardNumber)) {
        return res.status(400).json({ success: false, message: "Invalid card number." });
      }

      // Detect card type
      let detectedType = "";
      if (/^4/.test(cardNumber)) detectedType = "Visa";
      else if (/^5[1-5]/.test(cardNumber)) detectedType = "MasterCard";
      else if (/^3[47]/.test(cardNumber)) detectedType = "Amex";
      else detectedType = "Unknown";

      if (detectedType === "Unknown") {
        return res.status(400).json({ success: false, message: "Unsupported or invalid card type." });
      }

      // Auto-format expiry (MMYY → MM/YY)
      let formattedExpiry = cardExpiry;
      if (/^\d{4}$/.test(cardExpiry)) {
        formattedExpiry = cardExpiry.slice(0, 2) + "/" + cardExpiry.slice(2);
      }

      // Expiry format check
      if (!/^\d{2}\/\d{2}$/.test(formattedExpiry)) {
        return res.status(400).json({ success: false, message: "Invalid card expiry format. Use MM/YY." });
      }

      const [month, year] = formattedExpiry.split("/");
      if (formattedExpiry.replace("/", "").length !== 4 || isNaN(month) || isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be 4 digits in MM/YY format."
        });
      }

      // CVC check
      if (
        (detectedType === "Amex" && !/^\d{4}$/.test(cardCVC)) ||
        ((detectedType === "Visa" || detectedType === "MasterCard") && !/^\d{3}$/.test(cardCVC))
      ) {
        return res.status(400).json({ success: false, message: "Invalid card CVC." });
      }

      // Cardholder name validation
      if (
        typeof cardName !== "string" ||
        cardName.trim().length < 2 ||
        !/^[A-Za-z ]+$/.test(cardName.trim())
      ) {
        return res.status(400).json({ success: false, message: "Cardholder name must contain only letters and spaces." });
      }
    }

    // Simulate success
    return res.status(200).json({ success: true, message: "Payment processed successfully." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Payment failed.",
      error: error.message
    });
  }
};
