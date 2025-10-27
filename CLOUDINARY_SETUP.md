# Cloudinary File Upload Setup

## Step 1: Install Dependencies

### Backend (Server)
```bash
cd server
npm install cloudinary multer multer-storage-cloudinary
```

### Frontend (Client)
```bash
cd client
npm install axios
```

## Step 2: Get Cloudinary Credentials

1. Go to https://cloudinary.com/
2. Sign up or login
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Add to Environment Variables

Add these to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Run Installation Commands

Now run the installation commands above in the respective directories.
