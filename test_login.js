const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing admin login API...');
    
    // Use curl-like approach for Node.js testing
    const https = require('https');
    const http = require('http');
    const querystring = require('querystring');

    const postData = JSON.stringify({
      identifier: 'rajesh@ratanjewellers.com',
      password: 'SuperAdmin@2025#RJ'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response data:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('Login test error:', error);
  }
}

testLogin();