
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAAdPbPhK7mzLC2k4Bp7M76mnpdbDZoqFE");
  // The official way to get models is usually rest API or SDK, but SDK doesn't always expose listModels clearly.
  // We can just fetch via raw REST.
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAAdPbPhK7mzLC2k4Bp7M76mnpdbDZoqFE`);
  const data = await res.json();
  console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
}
check();
