/**
 * Test chatbot response speed
 */

const API_URL = 'http://localhost:3000/api/chatbot';

async function testSpeed(question) {
  console.log(`\n📝 Testing: "${question}"`);
  const start = Date.now();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    
    if (data.success) {
      console.log(`✅ Response (${duration}s): ${data.response}`);
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('⚡ Testing Chatbot Speed\n');
  
  await testSpeed('bonjour');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testSpeed('salut');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testSpeed('montre les alertes');
  
  console.log('\n✅ Done!');
}

runTests();
