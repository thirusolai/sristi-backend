const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Your Zoho credentials
const CLIENT_ID = "1000.N58LPHY6A9M78ED0187QO2ULNW00VN";
const CLIENT_SECRET = "1345aeb4c788ff2186c113dcdb504a5c3b18584df2";
const REFRESH_TOKEN = "1000.7b548c729e1690be6a180b09a150ad35.9693d941446bb3fa4ac73e75e248b409";

// Function to get access token from refresh token
async function getAccessToken() {
  const res = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
    params: {
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token"
    }
  });
  return res.data.access_token;
}

// API endpoint to receive form data from React
app.post("/submit-form", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    // Prepare Zoho Lead data
    const leadData = {
      data: [
        {
          Last_Name: req.body.name,
          Email: req.body.email,
          Company: req.body.company,
          Phone: req.body.phone,
          Description: req.body.message,
          Lead_Source: "Website Form",
          Custom_Project_Type: req.body.projectType, // custom field in Zoho
          Custom_Budget_Range: req.body.budget,
          Custom_Timeline: req.body.timeline
        }
      ]
    };

    // Send to Zoho CRM
    const response = await axios.post(
      "https://www.zohoapis.com/crm/v2/Leads",
      leadData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`
        }
      }
    );

    res.json({ success: true, zohoResponse: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




