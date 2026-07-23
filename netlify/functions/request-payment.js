const SANDBOX_MERCHANT_ID = "00000000-0000-0000-0000-000000000000";
const ZARINPAL_REQUEST_URL = "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  try {
    const { amount, description, productId } = JSON.parse(event.body);

    if (!amount || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "amount و description الزامی است" })
      };
    }

    const siteUrl = process.env.URL || `https://${event.headers.host}`;
    const callbackUrl = `${siteUrl}/.netlify/functions/verify-payment?productId=${encodeURIComponent(productId || "")}`;

    const zarinpalRes = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: SANDBOX_MERCHANT_ID,
        amount: amount,
        description: description,
        callback_url: callbackUrl
      })
    });

    const data = await zarinpalRes.json();

    if (data.data && data.data.code === 100) {
      const authority = data.data.authority;
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false, error: JSON.stringify(data.errors || data) })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
