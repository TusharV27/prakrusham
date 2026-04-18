async function getIPLocation(ip = "") {
  try {
    const url = ip
      ? `https://api.ipbot.com/${ip}`
      : `https://api.ipbot.com/`;

    const res = await fetch(url);

    // Check if response is JSON
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error("API did not return JSON: " + text.slice(0, 100));
    }

    const data = await res.json();

    // Extract only what you want
    const result = {
      ip: data.ip,
      postal: data.location.postal,
      city: data.location.city,
      region: data.location.region,
      country: data.location.country,
      country_code: data.location.country_code,
    };

    console.log(result);
    return result;

  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ✅ Use public IP OR leave empty for your own IP
getIPLocation();