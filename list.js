async function getModels() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCg1QGM49--SyXX9Acm5pkWDR9Cy--Qu_s');
  const data = await res.json();
  const names = data.models ? data.models.map(m => m.name).filter(n => n.includes('gemini')) : data;
  console.log("AVAILABLE MODELS:\n", JSON.stringify(names, null, 2));
}
getModels();
