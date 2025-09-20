const request = require('supertest');
const app = require('./app');

describe('Travel Explorer API', () => {
  test('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.packages).toBe(8);
  });

  test('GET /api/packages returns all packages', async () => {
    const res = await request(app).get('/api/packages');
    expect(res.statusCode).toBe(200);
    expect(res.body.packages).toHaveLength(8);
    expect(res.body.total).toBe(8);
  });

  test('GET /api/packages/:id returns specific package', async () => {
    const res = await request(app).get('/api/packages/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bali Getaway');
    expect(res.body.price).toBe(899);
  });

  test('GET /api/packages/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/packages/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Package not found');
  });

  test('GET /api/categories returns unique categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.categories).toContain('Beach');
    expect(res.body.categories).toContain('Adventure');
    expect(res.body.categories).toContain('Luxury');
  });

  test('GET /api/packages?category filters by category', async () => {
    const res = await request(app).get('/api/packages?category=Beach');
    expect(res.statusCode).toBe(200);
    expect(res.body.packages.length).toBeGreaterThan(0);
    expect(res.body.packages[0].category).toBe('Beach');
  });

  test('GET / returns HTML page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Travel Explorer');
    expect(res.text).toContain('Bali Getaway');
  });
});
