async function test() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: [{sender:'bot',text:'Ola'}],
      message: 'test'
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
