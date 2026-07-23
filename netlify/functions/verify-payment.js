const SANDBOX_MERCHANT_ID = "00000000-0000-0000-0000-000000000000";
const ZARINPAL_VERIFY_URL = "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json";

const PRODUCT_PRICES = {
  "class-notebook": 50000,
  "teacher-portfolio": 70000,
  "hormoz-game": 30000
};

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { Authority, Status, productId } = params;

  const amount = PRODUCT_PRICES[productId] || 0;

  if (Status !== "OK" || !Authority || !amount) {
    return {
      statusCode: 302,
      headers: { Location: "/failed.html" }
    };
  }

  try {
    const res = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: SANDBOX_MERCHANT_ID,
        amount: amount,
        authority: Authority
      })
    });

    const data = await res.json();

    if (data.data && (data.data.code === 100 || data.data.code === 101)) {
      return {
        statusCode: 302,
        headers: { Location: `/success.html?productId=${encodeURIComponent(productId || "")}&refId=${data.data.ref_id}` }
      };
    } else {
      return {
        statusCode: 302,
        headers: { Location: "/failed.html" }
      };
    }
  } catch (err) {
    return {
      statusCode: 302,
      headers: { Location: "/failed.html" }
    };
  }
};
