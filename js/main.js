// js/main.js

let selectedStateName = null;
let selectedStateLayer = null;
function getColor(score, min, max) {
  const percent = (score - min) / (max - min);
  const interpolateColor = (start, end) =>
    Math.round(start + (end - start) * percent);

  const r = interpolateColor(204, 106); // de #cce5ff a #6a1b9a
  const g = interpolateColor(229, 27);
  const b = interpolateColor(255, 154);

  return `rgb(${r},${g},${b})`;
}


function renderDashboard(stateData) {
  const getScore = (stateName) => {
    const entry = stateData.find(s => s.name === stateName);
    return entry ? entry.score : 0;
  };

  const leaderboardEl = document.getElementById("leaderboard");
  leaderboardEl.innerHTML = "";
  leaderboardEl.style.maxHeight = "400px";
  leaderboardEl.style.overflowY = "auto";
  let selectedStateLayer = null;

  stateData.sort((a, b) => b.score - a.score).forEach((state, index) => {
  const li = document.createElement("li");
  li.className = index === 0 ? "top" : "";
  li.innerHTML = `<span>${state.name}</span><span>${state.score}</span>`;
  
  li.addEventListener("click", () => {
    // Limpiar selección anterior
    document.querySelectorAll(".leaderboard li").forEach(el => el.classList.remove("selected", "top"));
    li.classList.add("selected");

    // Restaurar estilo del estado anterior en el mapa
    if (selectedStateLayer) {
      window.geoLayer.resetStyle(selectedStateLayer);
    }

    // Encontrar y resaltar nuevo estado en el mapa
    window.geoLayer.eachLayer(layer => {
      if (layer.feature.properties.name === state.name) {
        layer.openPopup();
        window.map.setView(layer.getBounds().getCenter(), 5);
        layer.setStyle({ weight: 3, color: '#ffa726', fillOpacity: 1 });
        selectedStateLayer = layer;
      }
    });
  });

  leaderboardEl.appendChild(li);
});

  const scores = stateData.map(s => s.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  if (!window.mapInitialized) {
    const map = L.map('map').setView([37.8, -96], 4);
    window.map = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(res => res.json())
      .then(data => {
        window.geoLayer = L.geoJson(data, {
          style: feature => {
            const score = getScore(feature.properties.name);
            return {
              fillColor: getColor(score, minScore, maxScore),
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
        window.mapInitialized = true;
      });
  } else {
    window.geoLayer.eachLayer(layer => {
      const score = getScore(layer.feature.properties.name);
      layer.setStyle({ fillColor: getColor(score, minScore, maxScore) });
      layer.bindPopup(`<strong>${layer.feature.properties.name}</strong><br>Points: ${score}`);
    });
  }
}

function refreshDashboard() {
  fetchStateData().then(renderDashboard);
}

refreshDashboard();
setInterval(refreshDashboard, 10000);
