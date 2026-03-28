/**
 * Test Ollama API directly
 */

async function testOllama() {
  console.log('🤖 Testing Ollama API directly...\n');
  
  const payload = {
    model: 'llama3.2:1b',
    prompt: 'Bonjour! Comment vas-tu?',
    system: 'You are a helpful assistant. Respond in French.',
    stream: false
  };
  
  console.log('📤 Request:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('\n📥 Response status:', response.status, response.statusText);
    
    const text = await response.text();
    console.log('\n📄 Response body:', text.substring(0, 500));
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ Ollama response:', data.response);
    } else {
      console.log('\n❌ Error response');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testOllama();
