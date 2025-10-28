# Vercel Deployment Fix for File Upload

## The Problem

When deployed on Vercel, file upload returns **405 Method Not Allowed** because:
- Frontend tries to send files to `/api/file/upload` 
- Vercel intercepts this as a local API route (not proxied to Render backend)
- Vercel's static hosting doesn't support file uploads

## The Solution

Configure frontend to use Render backend URL directly.

## Step 1: Update Environment Variables on Vercel

Go to your Vercel project → Settings → Environment Variables

Add these variables:

### For Production
```
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_SOCKET_URL=https://your-backend-name.onrender.com
```

**Replace `your-backend-name` with your actual Render service name!**

Example:
```
VITE_API_URL=https://webchat-backend-xyz.onrender.com/api
VITE_SOCKET_URL=https://webchat-backend-xyz.onrender.com
```

### For Preview/Development (Optional)
If you want different URLs for preview deployments:
```
VITE_API_URL=https://webchat-staging.onrender.com/api
VITE_SOCKET_URL=https://webchat-staging.onrender.com
```

## Step 2: Redeploy Frontend

After adding environment variables:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots on the latest deployment → "Redeploy"
3. Make sure "Use existing Build Cache" is **UNCHECKED**
4. Click "Redeploy"

**Or** trigger a new deployment by pushing to Git.

## Step 3: Update CORS on Render Backend

Your Render backend needs to allow requests from Vercel:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://web-chat-lac.vercel.app
   ```
3. **Or for multiple domains:**
   ```
   CLIENT_URL=https://web-chat-lac.vercel.app,https://www.your-custom-domain.com
   ```
4. Click "Save Changes"
5. Wait for service to restart

## Step 4: Verify Environment Variables

After redeployment, verify the variables are loaded:

### Check in Browser Console:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
```

Should show:
```
API URL: https://your-backend-name.onrender.com/api
Socket URL: https://your-backend-name.onrender.com
```

If it shows `undefined`, the environment variables weren't loaded. Redeploy without cache.

## Step 5: Test File Upload

1. Open your deployed app: `https://web-chat-lac.vercel.app`
2. Log in
3. Select a user
4. Try uploading a small file (< 5MB first)
5. Check browser console for errors
6. Check Render logs for backend errors

## Common Issues & Fixes

### Issue 1: Still getting 405 Error

**Cause**: Environment variables not loaded

**Fix**:
1. Verify variables in Vercel dashboard
2. Redeploy **without** build cache
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh page (Ctrl+F5)

### Issue 2: CORS Error

**Cause**: Backend not allowing Vercel domain

**Fix**:
1. Check `CLIENT_URL` on Render matches exactly
2. Include protocol: `https://` not just domain
3. No trailing slash: `https://app.vercel.app` not `https://app.vercel.app/`
4. Restart Render service after changing env vars

### Issue 3: Socket Connection Failed

**Cause**: `VITE_SOCKET_URL` incorrect or not set

**Fix**:
1. Ensure `VITE_SOCKET_URL` set on Vercel
2. Must be same domain as backend: `https://backend.onrender.com`
3. No `/api` at the end for socket URL
4. Redeploy without cache

### Issue 4: File Upload Timeout

**Cause**: Render free tier limitations or large files

**Fix**:
1. Reduce max file size to 20MB
2. Show upload progress to users
3. Consider upgrading Render plan
4. Optimize images before upload

### Issue 5: Environment Variables Not Working

**Cause**: Not prefixed with `VITE_`

**Fix**:
- Vite only exposes vars starting with `VITE_`
- Must use: `VITE_API_URL` not `API_URL`
- Must use: `VITE_SOCKET_URL` not `SOCKET_URL`

## Verification Checklist

Before testing, verify:

- [ ] `VITE_API_URL` set on Vercel
- [ ] `VITE_SOCKET_URL` set on Vercel  
- [ ] Both point to Render backend URL
- [ ] `CLIENT_URL` on Render points to Vercel URL
- [ ] Frontend redeployed without cache
- [ ] Backend restarted after env changes
- [ ] Browser cache cleared
- [ ] Console shows correct URLs

## Testing Checklist

- [ ] Can load the app
- [ ] Can log in
- [ ] Can send text messages
- [ ] Can receive messages
- [ ] Can see online/offline status
- [ ] **Can upload small file (< 5MB)**
- [ ] **Can upload medium file (< 20MB)**
- [ ] Can download uploaded files
- [ ] Can delete messages with files
- [ ] Real-time updates work

## File Size Recommendations

### Render Free Tier
- **Max recommended**: 20MB per file
- **Timeout**: 30 seconds
- **Memory**: 512MB

### Good Limits for Production
```javascript
// In your code
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large! Maximum size is 20MB');
  return;
}
```

## Monitoring

### Check if Backend is Sleeping (Render Free Tier)
```bash
curl https://your-backend-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

If it takes >5 seconds, backend was sleeping (normal on free tier).

### Check Logs

**Frontend (Vercel)**:
- Dashboard → Project → Deployments → View Function Logs
- Or browser console (F12)

**Backend (Render)**:
- Dashboard → Service → Logs
- Look for upload-related errors

## Example URLs

If your Render backend is: `webchat-api.onrender.com`

Then your Vercel environment variables should be:
```bash
VITE_API_URL=https://webchat-api.onrender.com/api
VITE_SOCKET_URL=https://webchat-api.onrender.com
```

And your Render environment variable should be:
```bash
CLIENT_URL=https://web-chat-lac.vercel.app
```

## Quick Fix Script

If still having issues, try this:

1. **On Render:**
   ```
   CLIENT_URL=https://web-chat-lac.vercel.app
   ```
   → Save → Wait for restart

2. **On Vercel:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
   → Redeploy (no cache)

3. **Clear browser:**
   - Ctrl+Shift+Delete
   - Clear all cached images and files
   - Hard refresh (Ctrl+F5)

4. **Test:**
   - Upload a small image
   - Check browser console
   - Check Render logs

## Success Indicators

When working correctly:

1. Browser console shows:
   ```
   📤 Uploading file: image.jpg
   📤 Request data: {...}
   ✅ File uploaded successfully
   ```

2. Render logs show:
   ```
   📥 Upload request received
   📁 File upload initiated
   ☁️ Uploading to Cloudinary...
   ✅ File uploaded to Cloudinary
   💾 Message saved to database
   ```

3. File appears in chat immediately
4. Other user receives file in real-time
5. Can download file by clicking
6. File stored in Cloudinary dashboard

## Still Not Working?

1. **Check exact error message** in browser console
2. **Check Render logs** for backend errors
3. **Verify Cloudinary credentials** in Render env vars
4. **Test health endpoint**: `https://backend.onrender.com/api/health`
5. **Try uploading very small file** (< 1MB) to rule out size issues
6. **Check file type** - ensure it's in allowed list

## Need More Help?

Share these details:
1. Exact error message from browser console
2. Backend logs from Render during upload attempt
3. Your environment variable values (without secrets)
4. File type and size you're trying to upload
5. Whether text messages work fine

---

**Remember**: After changing any environment variable, you must:
- Redeploy/restart the service
- Clear browser cache
- Hard refresh the page
