# Deployment Guide for WebChat

## Prerequisites
- Cloudinary account (free tier works)
- MongoDB Atlas database
- Render account (for backend)
- Vercel account (for frontend)

## Backend Deployment (Render)

### Step 1: Prepare for Deployment

The code is now updated to work on serverless platforms using memory storage instead of disk storage.

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: webchat-backend
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Branch**: main

### Step 3: Add Environment Variables on Render

Go to your service → Environment → Add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=saurabh-pasi
CLOUDINARY_API_KEY=762885835915862
CLOUDINARY_API_SECRET=cGnkL4A1D6lbn3DplG8GQnE0EFQ
MAX_FILE_SIZE=104857600
```

**Important Notes:**
- Set `CLIENT_URL` to your actual Vercel frontend URL
- For multiple origins, use comma-separated: `https://app1.vercel.app,https://app2.vercel.app`

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variables

Create/update `client/.env.production`:

```env
VITE_API_URL=https://your-render-backend.onrender.com
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables on Vercel

In your Vercel project settings → Environment Variables:

```
VITE_API_URL=https://your-render-backend.onrender.com
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment Configuration

### 1. Update CORS Settings

After deployment, update the `CLIENT_URL` environment variable on Render with your actual Vercel URL:

```
CLIENT_URL=https://your-actual-frontend.vercel.app
```

Then restart your Render service.

### 2. Test File Upload

1. Log in to your deployed app
2. Select a user to chat with
3. Try uploading a small image (< 5MB first)
4. Check browser console and Render logs for any errors

## Troubleshooting

### File Upload Fails on Render

**Issue**: 500 error when uploading files

**Solutions**:
1. **Check Cloudinary credentials**: Ensure they're correct in Render environment variables
2. **Verify cloud name**: Should be `saurabh-pasi` (without spaces or typos)
3. **Check Render logs**: Go to Render Dashboard → Your Service → Logs
4. **File size limit**: Render free tier has limits - try smaller files first

### CORS Errors

**Issue**: Frontend can't connect to backend

**Solutions**:
1. Ensure `CLIENT_URL` on Render matches your Vercel URL exactly
2. Include both `http://` and `https://` if needed
3. Check Render logs for CORS-related errors

### Socket.IO Connection Issues

**Issue**: Real-time features don't work

**Solutions**:
1. Ensure `VITE_SOCKET_URL` matches your Render backend URL
2. Render may take 30-60 seconds to wake up on free tier
3. Check browser console for WebSocket errors

### Cloudinary Upload Errors

**Issue**: "Invalid cloud_name" or "Unauthorized"

**Solutions**:
1. Double-check cloud name spelling: `saurabh-pasi`
2. Verify API key and secret are correct
3. Log in to Cloudinary dashboard to confirm credentials
4. Ensure no extra spaces in environment variables

## File Upload Limitations

### Render Free Tier
- Request timeout: 30 seconds
- Memory limit: 512MB
- **Recommended max file size**: 10-20MB

### Vercel Free Tier
- Function timeout: 10 seconds (Hobby)
- Request size limit: 4.5MB body
- **Frontend should handle large file warnings**

### Cloudinary Free Tier
- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25,000/month

## Recommended File Size Limits

For production deployment with free tiers:

```javascript
// Update MAX_FILE_SIZE in .env
MAX_FILE_SIZE=20971520  # 20MB instead of 100MB
```

Also update the frontend to warn users:

```javascript
// In FileUpload component
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large! Maximum size is 20MB');
  return;
}
```

## Monitoring

### Check Backend Health
```
https://your-render-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123.45,
  "database": "connected"
}
```

### Check Logs

**Render**: Dashboard → Your Service → Logs
**Vercel**: Dashboard → Your Project → Deployments → View Function Logs

## Important Notes

1. **First request may be slow**: Render free tier spins down after inactivity
2. **WebSocket connections**: May take a few seconds to establish
3. **File uploads**: Test with small files first (< 5MB)
4. **Environment variables**: Must restart service after changes
5. **HTTPS required**: Both Vercel and Render use HTTPS in production

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check Render service logs
3. Verify all environment variables
4. Test with small files first
5. Ensure Cloudinary credentials are correct

## Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set on both platforms
- [ ] CORS configured with correct Vercel URL
- [ ] Health endpoint returns "healthy"
- [ ] Can send/receive text messages
- [ ] Can upload small files (< 5MB)
- [ ] Socket.IO connections working
- [ ] Cloudinary uploads successful

## Performance Tips

1. **Optimize images before upload**: Use client-side compression
2. **Show upload progress**: Users need feedback for large files
3. **Implement retry logic**: For failed uploads
4. **Cache static assets**: Use Cloudinary's CDN features
5. **Monitor usage**: Check Cloudinary/Render dashboards regularly
