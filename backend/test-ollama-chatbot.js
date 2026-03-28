/**
 * Test Ollama-powered chatbot
 */

const API_URL = 'http://localhost:3000/api/chatbot';

async function testChatbot(question) {
  console.log(`\n📝 Question: "${question}"`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Response: ${data.response}`);
      console.log(`🎯 Intent: ${data.intent}`);
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('🤖 Testing Ollama-powered Chatbot\n');
  console.log('=' .repeat(60));
  
  // Test 1: Greeting
  await testChatbot('bonjour');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Greeting with question
  await testChatbot('salut, comment tu vas?');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Help request
  await testChatbot('comment tu peux aider moi?');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Alerts
  await testChatbot('montre-moi les alertes critiques');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 5: High risk machines
  await testChatbot('quelles machines sont à risque élevé?');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests completed!');
}

runTests();
