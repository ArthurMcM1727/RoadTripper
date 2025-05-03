import React, { useState } from 'react';

const TripForm = ({ onSubmit }) => {
  const [tripData, setTripData] = useState({
    startLocation: '',
    endLocation: '',
    preferences: {
      scenic: false,
      food: false,
      historical: false
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTripData(prev => ({
      ...prev,
      ...(type === 'checkbox' 
        ? { preferences: { ...prev.preferences, [name]: checked } }
        : { [name]: value }
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(tripData);
  };

  return (
    <form onSubmit={handleSubmit} className="trip-form">
      <div className="form-group">
        <label htmlFor="startLocation">Start Location:</label>
        <input
          type="text"
          id="startLocation"
          name="startLocation"
          value={tripData.startLocation}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endLocation">End Location:</label>
        <input
          type="text"
          id="endLocation"
          name="endLocation"
          value={tripData.endLocation}
          onChange={handleChange}
          required
        />
      </div>

      <div className="preferences">
        <h3>Preferences:</h3>
        <label>
          <input
            type="checkbox"
            name="scenic"
            checked={tripData.preferences.scenic}
            onChange={handleChange}
          />
          Scenic Routes
        </label>
        <label>
          <input
            type="checkbox"
            name="food"
            checked={tripData.preferences.food}
            onChange={handleChange}
          />
          Food Stops
        </label>
        <label>
          <input
            type="checkbox"
            name="historical"
            checked={tripData.preferences.historical}
            onChange={handleChange}
          />
          Historical Sites
        </label>
      </div>

      <button type="submit">Plan Trip</button>
    </form>
  );
};

export default TripForm;