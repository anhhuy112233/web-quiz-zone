/**
 * Script test server đơn giản để debug
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

console.log('🚀 Starting simple test server...');

try {
  console.log('1. Creating Express app...');
  const app = express();
  const httpServer = createServer(app);
  console.log('✅ Express app created');

  console.log('2. Setting up CORS...');
  app.use(cors());
  console.log('✅ CORS configured');

  console.log('3. Setting up JSON middleware...');
  app.use(express.json());
  console.log('✅ JSON middleware configured');

  console.log('4. Setting up basic routes...');
  app.get('/', (req, res) => {
    res.json({
      message: 'Simple test server is running!',
      timestamp: new Date().toISOString()
    });
  });
  console.log('✅ Basic routes configured');

  console.log('5. Testing auth route import...');
  const authRoutes = await import('./src/routes/auth.js');
  console.log('✅ Auth routes imported successfully');
  console.log('Auth routes object:', typeof authRoutes.default);

  console.log('6. Setting up auth routes...');
  app.use('/api/auth', authRoutes.default);
  console.log('✅ Auth routes configured at /api/auth');

  console.log('7. Setting up error handler...');
  const { errorHandler, notFound } = await import('./src/middleware/errorHandler.js');
  app.use(notFound);
  app.use(errorHandler);
  console.log('✅ Error handlers configured');

  console.log('8. Starting server...');
  const PORT = 5002;
  httpServer.listen(PORT, () => {
    console.log(`✅ Simple test server is running on port ${PORT}`);
    console.log('🎉 Simple test server started successfully!');
    console.log(`🌐 Test URL: http://localhost:${PORT}`);
    console.log(`🔐 Test auth: http://localhost:${PORT}/api/auth/login`);
  });

} catch (error) {
  console.error('❌ Error during server startup:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
} 