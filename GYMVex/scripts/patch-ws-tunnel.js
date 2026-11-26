const fs = require('fs');
const path = 'node_modules/@expo/ws-tunnel/build/index.js';
if (fs.existsSync(path)) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes('new n.WebSocket(e,')) {
    content = content.replace('new n.WebSocket(e,', 'new (n.WebSocket || n)(e,');
    fs.writeFileSync(path, content);
    console.log('[GYMVex] Applied ws-tunnel Node 22 compatibility fix');
  }
}
