async function test(message) {
  console.log(`\nTesting: "${message}"`);
  const response = await fetch('http://localhost:3000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  console.log('Response:', data.response);
  console.log('Intent:', data.intent);
  if (data.data) {
    console.log('Data:', JSON.stringify(data.data, null, 2));
  }
}

async function run() {
  await test('PC-LEGACY-15');
  await test('état de PC-LEGACY-15');
  await test('comment va PC-LEGACY-15');
}

run().catch(console.error);
