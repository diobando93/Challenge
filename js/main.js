// js/main.js

fetchStateData().then(stateData => {
  const getScore = (stateName) => {
    const entry = stateData.find(s => s.name === stateName);
    return entry ? entry.score : 0;
  };

  const getColor = (score) => {
    return score > 18000 ? '#d32f2f' :
           score > 15000 ? '#f57c00' :
           score > 12000 ? '#388e3c' :
           score > 0      ? '#1976d2' :
                           '#2c2c2c';
  };

  const leaderboardEl = document.getElementById("leaderboard");
  leaderboardEl.style.maxHeight = "400px";
  leaderboardEl.style.overflowY = "auto";

  stateData.sort((a, b) => b.score - a.score).forEach((state, index) => {
    const li = document.createElement("li");
    li.className = index === 0 ? "top" : "";
    li.innerHTML = `<span>${state.name}</span><span>${state.score}</span>`;
    leaderboardEl.appendChild(li);
  });

  const map = L.map('map').setView([37.8, -96], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
    .then(res => res.json())
    .then(data => {
      L.geoJson(data, {
        style: feature => {
          const score = getScore(feature.properties.name);
          return {
            fillColor: getColor(score),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const score = getScore(feature.properties.name);
          layer.bindPopup(`<strong>${feature.properties.name}</strong><br>Points: ${score}`);
        }
      }).addTo(map);
    });
});
