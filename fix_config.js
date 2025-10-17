const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/config/config.js', 'utf8');

// Replace the problematic line
content = content.replace(
  'return ${baseURL};',
  'return `${baseURL}${endpoint}`;'
);

// Write back to file
fs.writeFileSync('src/config/config.js', content);

console.log('Fixed config.js');
