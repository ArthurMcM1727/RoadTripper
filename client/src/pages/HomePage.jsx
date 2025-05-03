import React from 'react';
import TripForm from '../components/TripForm';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleTripSubmit = (tripData) => {
    // Store trip data in state management (to be implemented)
    console.log('Trip Data:', tripData);
    navigate('/plan');
  };

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Plan Your Next Adventure</h1>
        <p>Enter your route details and preferences to get started</p>
      </section>
      
      <section className="trip-planner">
        <TripForm onSubmit={handleTripSubmit} />
      </section>
    </div>
  );
};

export default HomePage;