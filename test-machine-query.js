async function test() {
  const response = await fetch('http://localhost:3000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'PC-LEGACY-15' })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
