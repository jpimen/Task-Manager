#!/usr/bin/env node
/**
 * Simple HTTP Server for Task Manager
 * Run: node server.js
 * Access: http://localhost:8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = 'localhost';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Default to index.html for root
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Build full file path
  filePath = path.join(__dirname, filePath);

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();

  // Read file from file system
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        // Server error
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
      }
    } else {
      // Success
      const contentType = mimeTypes[ext] || 'text/plain';
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n`);
  console.log(`╔════════════════════════════════════════╗`);
  console.log(`║  Task Manager Server Running! 🚀      ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`\n`);
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`\n`);
  console.log(`✨ Features:`);
  console.log(`   📁 Categories - Organize tasks by category`);
  console.log(`   📋 Activity Log - Track all changes`);
  console.log(`   📊 Analytics - Performance insights`);
  console.log(`   🎯 Subtasks - Decompose complex tasks`);
  console.log(`\n`);
  console.log(`📚 Documentation:`);
  console.log(`   Start with: QUICK_START.md`);
  console.log(`\n`);
  console.log(`Press Ctrl+C to stop the server\n`);
});

process.on('SIGINT', () => {
  console.log('\n\n✋ Server stopped by user');
  process.exit(0);
});
