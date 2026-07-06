import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'grading' | 'analytics' | 'admin'>('grading');

  const previewContent = {
    grading: {
      title: "AI Grading Assistant",
      desc: "Scans essays and open-ended exams to provide instant rubric-based evaluation drafts, saving educators up to 15 hours per week.",
      stat: "70% reduction in grading turnaround"
    },
    analytics: {
      title: "Predictive Student Insights",
      desc: "Analyzes early drops in submission velocity and attendance patterns, flagging at-risk students weeks before final exams.",
      stat: "Identify learning risks 3-4 weeks earlier"
    },
    admin: {
      title: "Smart Administration",
      desc: "Optimizes complex master timetables across departments, automates parent FAQs, and models seasonal cash flows.",
      stat: "85% administrative workflows automated"
    }
  };

  return (
    <div className="landing-container">
      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="logo-icon">🧠</span>
          <strong>brainCampus</strong>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#preview">Product Tour</a>
          <a href="#pricing">Pricing</a>
        </div>

        <a href="#demo" className="btn-primary">Request Access</a>
      </nav>

      {/* HERO */}
      <header className="hero-section">
        <div className="badge">✨ AI-First School OS</div>

        <h1>
          The Operating System<br />
          <span className="gradient-text">for Modern Education</span>
        </h1>

        <p className="hero-subtext">
          Automate administration, personalize learning pathways, and predict institutional outcomes with secure, 
          compliant AI infrastructure built for K-12 and higher education.
        </p>

        <div className="cta-group">
          <a href="#demo" className="btn-primary">Book Institutional Demo</a>
          <a href="#preview" className="btn-secondary">Watch 2-min Tour</a>
        </div>

        <div className="hero-social-proof">
          <span className="stars">★★★★★</span>
          <span>Trusted by 2,000+ academies worldwide</span>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="hero-banner-container">
          <div className="banner-window-frame">
            <div className="frame-header">
              <div className="frame-dots">
                <span className="frame-dot"></span>
                <span className="frame-dot"></span>
                <span className="frame-dot"></span>
              </div>
              <div className="frame-url">app.braincampus.com/dashboard</div>
            </div>
            <div className="banner-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                alt="brainCampus Dashboard"
                className="actual-product-banner"
              />
              <div className="banner-overlay-card">
                <span className="pulse-dot"></span>
                <strong>Live Campus Intelligence</strong>
                <p>Real-time insights across students, staff, and operations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* INTERACTIVE PREVIEW */}
      <section id="preview" className="preview-section">
        <div className="section-header">
          <h2>See the Intelligence in Action</h2>
          <p>Switch between core AI engines powering modern schools</p>
        </div>

        <div className="preview-box">
          <div className="preview-tabs">
            {Object.keys(previewContent).map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab as 'grading' | 'analytics' | 'admin')}
              >
                {previewContent[tab as keyof typeof previewContent].title.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="preview-display">
            <div className="mock-window">
              <div className="mock-header">
                <div className="frame-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <div className="mock-url">braincampus.edu/ai-{activeTab}</div>
              </div>

              <div className="mock-body">
                <h3>{previewContent[activeTab].title}</h3>
                <p>{previewContent[activeTab].desc}</p>
                <div className="mock-metric">
                  <strong>Impact:</strong> {previewContent[activeTab].stat}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Built for Every Layer of Education</h2>
          <p>One unified platform replacing fragmented legacy systems</p>
        </div>

        <div className="features-grid">
          {[
            { icon: "📊", title: "Predictive Student Models", desc: "Cross-references engagement metrics to identify at-risk students early." },
            { icon: "🗓️", title: "Intelligent Scheduling", desc: "Automatically generates conflict-free timetables respecting all constraints." },
            { icon: "💳", title: "Cash Flow Intelligence", desc: "Dynamic forecasting and automated receivables management." },
            { icon: "💬", title: "Smart Family Communication", desc: "Handles routine inquiries 24/7 with contextual, accurate responses." }
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feat-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <footer id="demo" className="footer-cta">
        <h2>Ready to transform your institution?</h2>
        <p>Schedule a personalized demo with our education systems experts.</p>
        <button 
          className="btn-primary"
          onClick={() => alert('Demo scheduling modal would open here')}
        >
          Schedule a Demo
        </button>
      </footer>
    </div>
  );
}

export default App;