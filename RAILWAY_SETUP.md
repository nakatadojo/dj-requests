# Railway Setup Instructions

## Setting Up Persistent Storage for Uploads

Since Railway uses ephemeral filesystems, uploaded cover images need to be stored in a **Railway Volume** to persist across deployments.

### Steps to Add Volume:

1. **Go to your Railway project dashboard**
2. **Click on your service** (the one running this app)
3. **Go to "Variables" tab**
4. **Scroll down to "Volumes" section**
5. **Click "New Volume"**
6. **Set the following:**
   - **Mount Path:** `/app/server/uploads`
   - **Name:** `uploads` (or any name you prefer)
7. **Click "Add"**
8. **Redeploy your service**

### What This Does:

- Creates persistent storage at `/app/server/uploads`
- All uploaded cover images will be stored here
- Images will survive deployments and restarts
- Works alongside your existing database volume

### Verify It's Working:

After setting up the volume:
1. Upload a cover image when creating an event
2. The image should display correctly
3. Redeploy your app - the image should still be there!

### Volume Mount Path:

The volume is already configured in `railway.json`:
```json
"volumeMounts": [
  {
    "mountPath": "/app/server/uploads",
    "name": "uploads"
  }
]
```

### Troubleshooting:

If uploads still aren't working:
- Check Railway logs for permission errors
- Verify the volume is mounted at `/app/server/uploads`
- Make sure the volume size is sufficient (start with 1GB)
