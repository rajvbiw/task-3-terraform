import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    game: 'Tic-Tac-Toe'
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Standalone Tic-Tac-Toe Game running on port ${PORT}`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/health`);
  console.log(`🌐 Play Game: http://localhost:${PORT}`);
  console.log(`==================================================`);
});

export default server;
