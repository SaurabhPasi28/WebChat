const fs = require('fs');
const path = require('path');

// Create .env file for server if it doesn't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/webchat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Client URL
CLIENT_URL=http://localhost:5173

# Optional: Redis for production
USE_REDIS=false
`;

if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env file');
} else {
  console.log('ℹ️  server/.env file already exists');
}

// Create .env file for client if it doesn't exist
const clientEnvPath = path.join(__dirname, 'client', '.env');
const clientEnvContent = `# Client Configuration
VITE_API_URL=http://localhost:5000/api
`;

if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env file');
} else {
  console.log('ℹ️  client/.env file already exists');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on localhost:27017');
console.log('2. Run "npm install" in both server and client directories');
console.log('3. Start the server: cd server && npm start');
console.log('4. Start the client: cd client && npm run dev');
console.log('5. Open http://localhost:5173 in your browser'); 