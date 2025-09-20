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
  { id: 6, name: 'Panda', species: 'Mammal', habitat: 'Forest', description: 'Black and white bear from China', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Gro
