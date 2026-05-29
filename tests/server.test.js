import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';

process.env.PORT = '3001';
const BASE_URL = 'http://localhost:3001';
let server;

describe('Tic-Tac-Toe Game Server Tests', () => {
  
  // Wait a small buffer to ensure server is listening
  before(async () => {
    const module = await import('../server.js');
    server = module.default;
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  // Close the server after running the tests
  after(() => {
    if (server) {
      server.close();
    }
  });

  // Test 1: Health probe check
  test('GET /health should return 200 OK and valid JSON health details', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    
    const data = await res.json();
    assert.strictEqual(data.status, 'UP');
    assert.ok(data.uptime >= 0);
    assert.strictEqual(data.game, 'Tic-Tac-Toe');
  });

  // Test 2: Verify static serving
  test('GET / should serve the home page', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('<!DOCTYPE html>'));
  });
});
