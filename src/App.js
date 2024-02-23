import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [planets, setPlanets] = useState([]);
  const [nextPage, setNextPage] = useState('');

  const fetchPlanets = async (url) => {
    try {
      const response = await axios.get(url);
      const fetchedPlanets = response.data.results;
      const planetsWithResidents = await Promise.all(
        fetchedPlanets.map(async (planet) => {
          const residents = await Promise.all(
            planet.residents.map(async (residentUrl) => {
              try {
                const residentResponse = await axios.get(residentUrl);
                return residentResponse.data;
              } catch (error) {
                console.error('Error fetching resident:', error);
                return null;
              }
            })
          );
          return { ...planet, residents };
        })
      );
      setPlanets(planetsWithResidents);
      setNextPage(response.data.next);
    } catch (error) {
      console.error('Error fetching planets:', error);
    }
  };

  useEffect(() => {
    fetchPlanets('https://swapi.dev/api/planets/?format=json');
  }, []);

  const handleLoadMore = () => {
    if (nextPage) {
      fetchPlanets(nextPage);
    }
  };

  return (
    <div className="App">
      <h1>Star Wars Planets Directory</h1>
      <div className="planets-container">
        {planets.map((planet) => (
          <div key={planet.name} className="planet-card">
            <h2>{planet.name}</h2>
            <p>Climate: {planet.climate}</p>
            <p>Population: {planet.population}</p>
            <p>Terrain: {planet.terrain}</p>
            <h3>Residents:</h3>
            <ul>
              {planet.residents.length > 0 ? (
                planet.residents.map((resident) => (
                  <li key={resident.name}>
                    {resident.name} - {resident.height}cm, {resident.mass}kg, {resident.gender}
                  </li>
                ))
              ) : (
                <li>No residents</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={handleLoadMore} disabled={!nextPage}>
        Load More
      </button>
    </div>
  );
}

export default App;
