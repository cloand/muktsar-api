const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/config/config.js', 'utf8');

// Split into lines
let lines = content.split('\n');

// Find and fix the problematic line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return ${baseURL};')) {
    lines[i] = '  return `${baseURL}${endpoint}`;';
    console.log(`Fixed line ${i + 1}: ${lines[i]}`);
    break;
  }
}

// Join back and write
content = lines.join('\n');
fs.writeFileSync('src/config/config.js', content);

console.log('Config file fixed successfully!');
