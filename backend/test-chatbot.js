/**
 * Test script for chatbot API
 */

const API_URL = 'http://localhost:3000/api/chatbot';

async function testChatbot() {
  console.log('=== Testing Chatbot API ===\n');

  const testQuestions = [
    "Quelles machines sont à risque élevé?",
    "Montre-moi les alertes critiques",
    "Quel est l'état de la machine Mori?",
    "Combien de machines sont surveillées?"
  ];

  for (const question of testQuestions) {
    console.log(`\n📝 Question: "${question}"`);
    console.log('─'.repeat(60));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Success');
        console.log(`🤖 Response: ${data.response}`);
        if (data.data) {
          console.log(`📊 Data: ${JSON.stringify(data.data, null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log('❌ Error:', data.error);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }

  console.log('\n=== Test Complete ===\n');
}

testChatbot();
