const request = require('supertest');
const app = require('./app');

describe('DevOps Product Store API', () => {
  test('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.products).toBe(8);
  });

  test('GET /api/products returns all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.products).toHaveLength(8);
    expect(res.body.total).toBe(8);
  });

  test('GET /api/products/:id returns specific product', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Jenkins Pro');
    expect(res.body.price).toBe(299);
  });

  test('GET /api/products/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });

  test('GET /api/categories returns unique categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.categories).toContain('CI/CD');
    expect(res.body.categories).toContain('Containerization');
  });

  test('GET /api/products?category filters by category', async () => {
    const res = await request(app).get('/api/products?category=CI/CD');
    expect(res.statusCode).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].category).toBe('CI/CD');
  });

  test('GET / returns HTML page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('DevOps Product Store');
    expect(res.text).toContain('Jenkins Pro');
  });
});