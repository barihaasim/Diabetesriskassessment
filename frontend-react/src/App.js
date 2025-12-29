/* Path: diabetes-project/frontend-react/src/App.js */
import React, { useState, useEffect } from 'react';
import './App.css';
import { questions } from './questions';

function App() {
  const [view, setView] = useState('home'); // 'home', 'bmi', 'quiz', 'result', 'history'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // BMI state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');




  // Start Assessment - go to BMI input first
  const startQuiz = () => {
    setView('bmi');
    setHeight('');
    setWeight('');
    setAnswers(new Array(questions.length).fill(null));
  };

  // Proceed from BMI to questions
  const proceedToQuestions = () => {
    setView('quiz');
    setCurrentQIndex(0);
  };

  // Handle Option Click
  const handleOptionSelect = (val) => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = val;
    setAnswers(newAnswers);
  };

  // Navigation
  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      submitAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  // Submit to Backend
  const submitAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          height: parseFloat(height) || 0,
          weight: parseFloat(weight) || 0
        })
      });
      const data = await response.json();
      setResult(data);
      setView('result');
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend server.");
    }
    setLoading(false);
  };




  // Determine Result Class and Icon for 6-tier risk system
  const getRiskInfo = (text) => {
    if (!text) return { className: "", icon: "" };
    if (text.includes("CRITICAL")) return { className: "risk-critical", icon: "🚨" };
    if (text.includes("HIGH")) return { className: "risk-high", icon: "⚠️" };
    if (text.includes("ELEVATED")) return { className: "risk-elevated", icon: "📈" };
    if (text.includes("MODERATE")) return { className: "risk-moderate", icon: "⚡" };
    if (text.includes("LOW")) return { className: "risk-low", icon: "✅" };
    return { className: "risk-minimal", icon: "🌟" };
  };

  // Parse risk factor to show question text instead of question number
  const formatRiskFactor = (factor) => {
    const match = factor.match(/Question (\d+) \(Points: (\d+)\)/);
    if (match) {
      const questionNum = parseInt(match[1]);
      const points = match[2];
      const question = questions[questionNum - 1];
      if (question) {
        return `${question.text} (Risk Points: ${points})`;
      }
    }
    return factor;
  };

  // Calculate progress percentage
  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="header-logo">🩺</span>
          <span className="header-title">Diabetes Risk Assessment</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'home' ? 'active' : ''}`}
            onClick={() => setView('home')}
          >
            Home
          </button>

        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">

        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="home-view">
            <div className="hero-section">
              {/* REMOVED STETHOSCOPE ICON */}
              <h1 className="gradient-text">Diabetes Risk Assessment</h1>
              <p>
                Discover your diabetes risk level with our intelligent assessment tool.
                Answer a few questions about your health and lifestyle to receive
                personalized insights powered by advanced algorithms.
              </p>

              <div className="hero-tags">
                <span className="hero-tag">⏱ Takes 3–5 minutes</span>
                <span className="hero-tag">📝 10 short questions</span>
              </div>
            </div>

            {/* NEW INFO SECTION */}
            <div className="info-section">
              <h2>Why Should You Take the Test?</h2>

              <div className="info-grid">
                <div className="info-card">
                  <h3>1. Understand Your Risk Early</h3>
                  <p>
                    Diabetes often develops slowly, and many people don’t notice symptoms at first.
                    This test helps you understand whether you may be at low, moderate, or higher risk,
                    so you’re not guessing about your health.
                  </p>
                </div>

                <div className="info-card">
                  <h3>2. Take Control of Your Health</h3>
                  <p>
                    Knowledge is power. By assessing your risk today, you can take proactive steps
                    towards a healthier lifestyle and prevent future complications. Early detection
                    is key to effective management.
                  </p>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button className="btn primary-btn" onClick={startQuiz}>
                Start Assessment
              </button>

            </div>
          </div>
        )}

        {/* BMI INPUT VIEW */}
        {view === 'bmi' && (
          <div className="bmi-view">
            <div className="content-card">
              <span className="bmi-header-icon">⚖️</span>
              <h1>Body Measurements</h1>
              <p>
                Enter your height and weight to calculate your BMI.
                This helps provide a more accurate risk assessment.
              </p>

              <div className="bmi-inputs">
                <div className="input-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    placeholder="e.g., 170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="100"
                    max="250"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    placeholder="e.g., 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="30"
                    max="300"
                  />
                </div>
              </div>

              {height && weight && (
                <div className="bmi-preview">
                  <span>Your BMI: </span>
                  <strong>
                    {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                  </strong>
                </div>
              )}

              <div className="nav-buttons">
                <button className="btn secondary-btn" onClick={() => setView('home')}>
                  ← Back
                </button>
                <button className="btn primary-btn" onClick={proceedToQuestions}>
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ VIEW */}
        {view === 'quiz' && (
          <div className="quiz-view">
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="progress-text">
                Question {currentQIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="content-card">
              <div className="question-container">
                <span className="question-number">Q{currentQIndex + 1}</span>
                <h2>{questions[currentQIndex].text}</h2>
              </div>

              <div className="options-container">
                {questions[currentQIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`option-btn ${answers[currentQIndex] === opt.val ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(opt.val)}
                  >
                    {opt.txt}
                    <span className="check-icon">✓</span>
                  </button>
                ))}
              </div>

              <div className="nav-buttons">
                <button
                  className="btn secondary-btn"
                  onClick={prevQuestion}
                  disabled={currentQIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  className="btn primary-btn"
                  onClick={nextQuestion}
                  disabled={answers[currentQIndex] === null || loading}
                >
                  {loading && <span className="loading-spinner"></span>}
                  {currentQIndex === questions.length - 1
                    ? (loading ? "Analyzing..." : "Complete ✓")
                    : "Next →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {view === 'result' && result && (
          <div className="result-view">
            <div className="result-header">
              <span className="result-icon">📊</span>
              <h1>Your Results</h1>
            </div>

            <div className="result-grid">
              {/* Score Card */}
              <div className="score-card">
                <div className="score-display">
                  <h2>Total Risk Score</h2>
                  <span className="score-value">{result.score}</span>
                </div>

                {/* BMI Display */}
                {result.bmi > 0 && (
                  <div className="bmi-result">
                    <span className="bmi-label">BMI:</span>
                    <span className="bmi-value">{result.bmi.toFixed(1)}</span>
                    <span className="bmi-category">({result.bmiCategory})</span>
                  </div>
                )}

                <div className={`risk-box ${getRiskInfo(result.assessment).className}`}>
                  <span className="risk-icon">{getRiskInfo(result.assessment).icon}</span>
                  <h3>{result.assessment}</h3>
                </div>
              </div>

              {/* Details Card */}
              <div className="details-card">
                {/* Statistical Comparison */}
                {result.averageScore > 0 && (
                  <div className="comparison-section">
                    <h3>📈 Comparison to Average</h3>
                    <div className="comparison-bars">
                      <div className="comparison-bar">
                        <span className="bar-label">Your Score</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill your-score"
                            style={{ width: `${Math.min((result.score / 30) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="bar-value">{result.score}</span>
                      </div>
                      <div className="comparison-bar">
                        <span className="bar-label">Average</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill avg-score"
                            style={{ width: `${Math.min((result.averageScore / 30) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="bar-value">{result.averageScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="comparison-note">
                      Based on {result.totalAssessments} total assessments
                    </p>
                  </div>
                )}

                <div className="risk-factors">
                  <h3>📌 Key Risk Factors</h3>
                  <ul>
                    {result.riskFactors.length > 0 ? (
                      result.riskFactors.map((factor, i) => (
                        <li key={i}>{formatRiskFactor(factor)}</li>
                      ))
                    ) : (
                      <li className="no-risk">
                        No significant individual risk factors identified.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="recommendations">
                  <h3>💊 Personalized Recommendations</h3>
                  <ul>
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-actions">
                <button className="btn primary-btn" onClick={startQuiz}>
                  🔄 Retake Assessment
                </button>
                <button className="btn secondary-btn" onClick={() => setView('home')}>
                  🏠 Home
                </button>
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

export default App;