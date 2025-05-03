import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Road Trip Planner</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<div>Home Page - Coming Soon</div>} />
            <Route path="/plan" element={<div>Trip Planner - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;