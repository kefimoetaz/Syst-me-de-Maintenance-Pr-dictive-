import { useState, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Bonjour! Je suis votre assistant de maintenance prédictive. Comment puis-je vous aider?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetch(`${API_URL}/chatbot/suggestions`)
      .then(res => res.json())
      .then(data => { if (data.success) setSuggestions(data.suggestions); })
      .catch(() => {});
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
    setInputText('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'bot',
        text: data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        timestamp: new Date(),
        data: data.data
      }]);
    } catch {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "❌ Erreur de connexion. Vérifiez que le serveur est démarré.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(inputText); };

  // ── Floating button (closed state) ──────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full p-4 shadow-2xl shadow-purple-500/40 transition-all duration-300 hover:scale-110 z-50 border border-white/20"
        title="Ouvrir l'assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  // ── Open chat window ─────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col z-50 rounded-2xl shadow-2xl shadow-purple-900/50 border border-white/20 overflow-hidden backdrop-blur-md bg-white/10">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-white/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Assistant IA</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/70">En ligne</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'bot' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
              msg.type === 'user'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white border border-white/20 rounded-bl-sm backdrop-blur-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-white/50 mb-2 font-medium">Suggestions :</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 px-3 py-1 rounded-full transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation metrics card */}
      <div className="mx-3 mt-2 mb-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-white/70 mr-2">📊</span>
          <span className="text-xs text-gray-400">BLEU <span className="text-purple-300 font-semibold">0.73</span></span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-xs text-gray-400">ROUGE-L <span className="text-indigo-300 font-semibold">0.76</span></span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-xs text-gray-400">Score <span className="text-green-400 font-semibold">0.74</span></span>
        </div>
        <span className="text-xs text-white/25">20 q.</span>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60 transition-all duration-200 backdrop-blur-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2.5 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
