# MongoDB Setup Guide

## Installing MongoDB

### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a service and start automatically

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verify Installation

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Connect to MongoDB:**
   ```bash
   mongosh
   ```

3. **Create the database:**
   ```javascript
   use webchat
   ```

## Alternative: MongoDB Atlas (Cloud)

If you prefer a cloud solution:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update the `MONGODB_URI` in your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webchat
   ```

## Troubleshooting

### MongoDB won't start
- Check if the data directory exists and has proper permissions
- Ensure no other process is using port 27017
- Check MongoDB logs for errors

### Connection refused
- Verify MongoDB service is running
- Check if firewall is blocking port 27017
- Ensure the connection string is correct

### Permission denied
- Run MongoDB with appropriate permissions
- Check file system permissions for data directory 