// Aquí podrás cargar los datos desde Google Sheets usando fetch o APIs como Sheet.best
async function fetchStateData() {
  const res = await fetch("https://script.google.com/macros/s/AKfycbz-9K2zMiSNsH_8iBrJQxAY9bi2B0Ki-_uSrD1NcNYVdxSQ0LWclIyA61H_GNwXROmy5g/exec");
  const data = await res.json();
  return data.map(d => ({
    name: d.State,
    score: parseInt(d.Points)
  }));
}