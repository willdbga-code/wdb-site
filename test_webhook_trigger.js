const axios = require("axios");

const payload = {
  event: "messages.upsert",
  instance: "william",
  data: {
    key: {
      remoteJid: "5512999999999@s.whatsapp.net",
      fromMe: false,
      id: "TEST_MESSAGE_ID_123"
    },
    message: {
      conversation: "Olá, gostaria de saber os preços dos ensaios fotográficos."
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
    pushName: "Cliente Teste"
  }
};

async function runTest() {
  try {
    console.log("Sending mock webhook request...");
    const resp = await axios.post("https://us-central1-williamdelbarrio-5a342.cloudfunctions.net/whatsappWebhook", payload);
    console.log("Response:", resp.status, resp.data);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message, err.response ? err.response.status + " " + JSON.stringify(err.response.data) : "");
    process.exit(1);
  }
}

runTest();
