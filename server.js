const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use environment variables (Render → Settings → Environment)
// Don’t hardcode secrets in code!
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// ⚠️ Choose correct domain depending on Zoho account region
// US/global: .com   | India: .in   | EU: .eu
const ZOHO_ACCOUNTS_DOMAIN = "https://accounts.zoho.in";
const ZOHO_API_DOMAIN = "https://www.zohoapis.in";


// Function to get access token from refresh token
async function getAccessToken() {
  try {
    const res = await axios.post(`${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`, null, {
      params: {
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token"
      }
    });

    return res.data.access_token;
  } catch (err) {
    console.error("❌ Error fetching Zoho access token:", err.response?.data || err.message);
    throw new Error("Failed to get Zoho access token");
  }
}

// API endpoint to receive form data from React
app.post("/submit-form", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    // Prepare Zoho Lead data
    const leadData = {
      data: [
        {
          Last_Name: req.body.name || "Website Lead",
          Email: req.body.email,
          Company: req.body.company || "N/A",
          Phone: req.body.phone,
          Description: req.body.message,
          Lead_Source: "Website Form",
          Custom_Project_Type: req.body.projectType,
          Custom_Budget_Range: req.body.budget,
          Custom_Timeline: req.body.timeline
        }
      ]
    };

    const response = await axios.post(
      `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
      leadData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, zohoResponse: response.data });
  } catch (error) {
    console.error("❌ Error sending lead to Zoho:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
