const request = require('supertest');
const app = require('./app');

describe('Animal Save API', () => {
  test('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.animals).toBe(6);
  });

  test('GET /api/animals returns all animals', async () => {
    const res = await request(app).get('/api/animals');
    expect(res.statusCode).toBe(200);
    expect(res.body.animals).toHaveLength(6);
    expect(res.body.total).toBe(6);
  });

  test('GET /api/animals/:id returns specific animal', async () => {
    const res = await request(app).get('/api/animals/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Elephant');
  });

  test('GET /api/animals/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/animals/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Animal not found');
  });

  test('GET /api/species returns unique species', async () => {
    const res = await request(app).get('/api/species');
    expect(res.statusCode).toBe(200);
    expect(res.body.species).toContain('Mammal');
    expect(res.body.species).toContain('Bird');
  });

  test('GET /api/animals?species filters by species', async () => {
    const res = await request(app).get('/api/animals?species=Mammal');
    expect(res.statusCode).toBe(200);
    expect(res.body.animals.length).toBeGreaterThan(0);
    expect(res.body.animals[0].species).toBe('Mammal');
  });

  test('GET / returns HTML page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Animal Save');
    expect(res.text).toContain('Elephant');
  });
});
