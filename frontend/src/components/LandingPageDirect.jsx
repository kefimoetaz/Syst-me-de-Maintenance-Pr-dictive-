import { useNavigate } from 'react-router-dom';

// DIRECT VERSION WITH ROUTER
function LandingPageDirect() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3F1D94] via-[#5B3DF5] to-[#6A3DE8] relative overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="relative z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">PC Technician</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Accueil</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">À propos</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Actualités</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Blog</a>
          </div>

          
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-[calc(100vh-100px)]">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src="/page1.png" 
            alt="Plateforme de maintenance prédictive par IA" 
            className="w-full h-full object-contain object-center"
          />
        </div>

        <div className="relative z-20 flex items-center min-h-[calc(100vh-100px)] px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div 
              className="max-w-2xl"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '1.5rem',
                padding: '3rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Logo */}
              <div style={{ marginBottom: '2rem' }}>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(to bottom right, #5B3DF5, #6A3DE8)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>PC Technician</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 style={{ 
                fontSize: '3.75rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                lineHeight: '1.1',
                marginBottom: '1.5rem'
              }}>
                Prédire et prévenir les pannes système
              </h1>

              {/* Description */}
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#4B5563', 
                marginBottom: '2.5rem',
                lineHeight: '1.75'
              }}>
                Plateforme de maintenance prédictive alimentée par l'IA qui surveille l'infrastructure informatique et anticipe les pannes avant qu'elles ne surviennent.
              </p>

              {/* Get Started Button */}
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '1.25rem 2.5rem',
                  background: 'linear-gradient(to right, #FF4D9D, #FF6B9D)',
                  color: 'white',
                  fontSize: '1.125rem',
                  borderRadius: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPageDirect;