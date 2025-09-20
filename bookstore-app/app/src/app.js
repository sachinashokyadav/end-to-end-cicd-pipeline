const express = require('express');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Animals data
const animals = [
  { id: 1, name: 'Elephant', species: 'Mammal', habitat: 'Savannah', description: 'Large herbivorous mammal', image: 'https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg' },
  { id: 2, name: 'Tiger', species: 'Mammal', habitat: 'Jungle', description: 'Big cat, apex predator', image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Tiger.50.jpg' },
  { id: 3, name: 'Giraffe', species: 'Mammal', habitat: 'Savannah', description: 'Tallest land animal', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Giraffe_standing.jpg' },
  { id: 4, name: 'Penguin', species: 'Bird', habitat: 'Antarctica', description: 'Flightless bird adapted to cold', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Adelie_Penguin_chick.JPG' },
  { id: 5, name: 'Dolphin', species: 'Mammal', habitat: 'Ocean', description: 'Intelligent marine mammal', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dolphin_in_Hawaii.jpg' },
  { id: 6, name: 'Panda', species: 'Mammal', habitat: 'Forest', description: 'Black and white bear from China', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Grosser_Panda.JPG' }
];

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', animals: animals.length }));

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Home Page - Animal Save UI
app.get('/', (req, res) => {
  const html = `
    <html><head><title>🦁 Animal Save</title><style>
      body{font-family:Arial;margin:0;background:#f0fff0;color:#333}
      .header{background:#27ae60;color:white;text-align:center;padding:40px 20px}
      .header h1{margin:0;font-size:40px}
      .header p{margin:10px 0 0;font-size:18px}
      .animals{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;padding:30px}
      .animal{background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:transform .2s}
      .animal:hover{transform:translateY(-5px)}
      .animal img{width:100%;height:200px;object-fit:cover}
      .info{padding:15px}
      .info h3{margin:0;font-size:22px}
      .info p{font-size:14px;color:#666}
      .species{background:#2ecc71;color:white;padding:5px 10px;border-radius:20px;font-size:12px;display:inline-block;margin-top:8px}
    </style></head><body>
      <div class="header">
        <h1>🌿 Animal Save</h1>
        <p>Protecting endangered and vulnerable animals 🐾</p>
      </div>
      <div class="animals">
        ${animals.map(a => `
          <div class="animal">
            <img src="${a.image}" alt="${a.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Animal'">
            <div class="info">
              <h3>${a.name}</h3>
              <p>${a.description}</p>
              <span class="species">${a.species}</span>
              <div>Habitat: ${a.habitat}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </body></html>
  `;
  res.send(html);
});

// API endpoints
app.get('/api/animals', (req, res) => {
  const { species } = req.query;
  const filtered = species ? animals.filter(a => a.species.toLowerCase().includes(species.toLowerCase())) : animals;
  res.json({ animals: filtered, total: filtered.length });
});

app.get('/api/animals/:id', (req, res) => {
  const animal = animals.find(a => a.id === parseInt(req.params.id));
  animal ? res.json(animal) : res.status(404).json({ error: 'Animal not found' });
});

app.get('/api/species', (req, res) => {
  const speciesList = [...new Set(animals.map(a => a.species))];
  res.json({ species: speciesList });
});

module.exports = app;
