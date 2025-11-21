# DigitalOcean App Platform Deployment Guide

This guide walks you through deploying the UGC Script Splitter application to DigitalOcean App Platform.

## Prerequisites

- DigitalOcean account (sign up at https://www.digitalocean.com)
- GitHub/GitLab/Bitbucket account with your code repository
- Git installed on your local machine
- API keys ready:
  - OpenAI API key (required)
  - Optional: Google Gemini API key or Vertex AI credentials
  - Optional: Kie.ai API key

## Step 0: Set Up Git Repository

If you haven't already set up Git for this project, follow these steps:

### Option A: Initialize a New Git Repository

1. **Open terminal** in your project directory (`veo3-script-splitter`)

2. **Check if Git is initialized**:
   ```bash
   git status
   ```
   If you see "not a git repository", continue to step 3. If Git is already initialized, skip to Option B.

3. **Initialize Git repository**:
   ```bash
   git init
   ```

4. **Create or verify `.gitignore` file**:
   
   **Check if `.gitignore` exists**:
   ```bash
   ls -la .gitignore
   ```
   
   **If the file doesn't exist**, create it:
   ```bash
   cat > .gitignore << 'EOF'
   # Dependencies
   node_modules/
   /.pnp
   .pnp.js
   
   # Testing
   /coverage
   
   # Production
   /build
   /client/build
   
   # Environment variables (CRITICAL - never commit these!)
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   
   # Service account keys (CRITICAL - never commit these!)
   service-account-key.json
   *-key.json
   
   # Logs
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   lerna-debug.log*
   server.log
   
   # Editor directories and files
   .idea
   .vscode
   *.swp
   *.swo
   *~
   
   # OS files
   .DS_Store
   Thumbs.db
   
   # React
   client/.eslintcache
   EOF
   ```
   
   **If the file already exists**, verify it includes these critical entries:
   ```bash
   grep -E "(\.env|node_modules|/build)" .gitignore
   ```
   
   You should see `.env`, `node_modules/`, and `/build` listed. If not, add them manually or use the command above to recreate the file.

5. **Add all files**:
   ```bash
   git add .
   ```

6. **Create initial commit**:
   ```bash
   git commit -m "Initial commit: UGC Script Splitter with DigitalOcean deployment config"
   ```

### Option B: Connect to Existing Remote Repository

If you already have a Git repository initialized:

1. **Check current Git status**:
   ```bash
   git status
   ```

2. **Add new files** (app.yaml, DEPLOYMENT.md, updated server.js):
   ```bash
   git add app.yaml DEPLOYMENT.md server.js
   ```

3. **Commit the changes**:
   ```bash
   git commit -m "Add DigitalOcean App Platform deployment configuration"
   ```

### Push to GitHub/GitLab/Bitbucket

1. **Create a new repository** on GitHub/GitLab/Bitbucket:
   - Go to your Git hosting service
   - Click "New Repository" or "Create Repository"
   - Name it (e.g., `ugc-script-splitter`)
   - **Don't** initialize with README, .gitignore, or license (if you already have these)
   - Copy the repository URL (e.g., `https://github.com/yourusername/ugc-script-splitter.git`)

2. **Add remote repository** (if not already added):
   ```bash
   git remote add origin https://github.com/yourusername/ugc-script-splitter.git
   ```
   Replace with your actual repository URL.

3. **Check remote**:
   ```bash
   git remote -v
   ```
   Should show your repository URL.

4. **Push to remote**:
   ```bash
   git branch -M main
   git push -u origin main
   ```
   
   If you get authentication errors:
   - **GitHub**: Use a Personal Access Token instead of password, or set up SSH keys
   - **GitLab**: Use a Personal Access Token or SSH keys
   - **Bitbucket**: Use an App Password or SSH keys

5. **Verify files are pushed**:
   - Visit your repository on GitHub/GitLab/Bitbucket
   - Confirm you see: `app.yaml`, `DEPLOYMENT.md`, `server.js`, `package.json`, etc.

### Important: Never Commit Sensitive Files

Before pushing, verify these files are **NOT** in your repository:
- `.env` (should be in `.gitignore`)
- `service-account-key.json` (should be in `.gitignore`)
- `node_modules/` (should be in `.gitignore`)

Check what will be committed:
```bash
git status
```

If you see `.env` or other sensitive files, remove them:
```bash
git rm --cached .env
git commit -m "Remove sensitive files"
```

## Step 1: Prepare Your Repository

1. **Verify your code is committed and pushed** to your Git repository
2. **Verify the following files exist** in your repository:
   - `app.yaml` - App Platform configuration (already created)
   - `package.json` - Root package.json with build scripts
   - `server.js` - Express server (with updated CORS configuration)
   - `client/` - React frontend directory
   - `DEPLOYMENT.md` - This deployment guide

## Step 2: Create App on DigitalOcean

1. **Log in to DigitalOcean** and navigate to App Platform
2. **Click "Create App"** or "New App"
3. **Choose "GitHub"** (or GitLab/Bitbucket) as your source
4. **Authorize DigitalOcean** to access your repository if prompted
5. **Select your repository** containing the UGC Script Splitter code
6. **Select the branch** (usually `main` or `master`)

## Step 3: Configure Build Settings

DigitalOcean should auto-detect the `app.yaml` file. Verify these settings:

- **Build Command**: `npm run install-all && npm run build`
- **Run Command**: `npm start`
- **Environment**: Production
- **Node.js Version**: Latest LTS (18.x or 20.x)

If auto-detection doesn't work, manually set:
- **Type**: Web Service
- **Build Command**: `npm run install-all && npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: 8080 (App Platform sets PORT automatically)

## Step 4: Configure Environment Variables

In the App Platform dashboard, navigate to **Settings > App-Level Environment Variables** and add:

### Required Variables

```
NODE_ENV=production
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Optional Variables (choose based on your needs)

**For Google Gemini API:**
```
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

**For Google Vertex AI (instead of Gemini):**
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
```

**For Kie.ai video generation:**
```
KIEAI_API_KEY=sk-your-kieai-api-key
```

**For CORS (set after deployment):**
```
ALLOWED_ORIGIN=https://your-app-name.ondigitalocean.app
```

> **Note**: After your first deployment, DigitalOcean will provide your app URL. Update `ALLOWED_ORIGIN` with your actual app URL to restrict CORS properly.

## Step 5: Configure Health Check

The `app.yaml` file already includes health check configuration:
- **Path**: `/api/health`
- **Initial Timeout**: 10 seconds
- **Period**: 10 seconds
- **Timeout**: 5 seconds

Verify this is set correctly in the App Platform dashboard under **Settings > Health Checks**.

## Step 6: Choose Instance Size

For initial deployment, the `app.yaml` specifies:
- **Instance Size**: `basic-xxs` (512MB RAM, 1 vCPU)
- **Instance Count**: 1

You can upgrade later if needed. Estimated cost: ~$5/month.

## Step 7: Deploy

1. **Review all settings** in the App Platform dashboard
2. **Click "Create Resources"** or "Deploy"
3. **Wait for deployment** (typically 5-10 minutes)
4. **Monitor the build logs** for any errors

## Step 8: Post-Deployment Configuration

### Update CORS Origin

After deployment, DigitalOcean will provide your app URL (e.g., `https://ugc-script-splitter-xyz123.ondigitalocean.app`):

1. Go to **Settings > App-Level Environment Variables**
2. Add or update: `ALLOWED_ORIGIN=https://your-actual-app-url.ondigitalocean.app`
3. Save and redeploy (or wait for auto-redeploy)

### Verify Deployment

1. **Check health endpoint**: `https://your-app-url.ondigitalocean.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Test the application**:
   - Visit your app URL in a browser
   - Try generating a script segment
   - Verify API endpoints work

3. **Check logs**:
   - In App Platform dashboard, go to **Runtime Logs**
   - Verify no errors and that environment variables are loaded

## Troubleshooting

### Build Fails

**Error**: "npm run build failed"
- **Solution**: Check that `client/package.json` exists and has correct build scripts
- Verify Node.js version compatibility

**Error**: "Cannot find module"
- **Solution**: Ensure `npm run install-all` runs successfully
- Check that all dependencies are in `package.json`

### App Won't Start

**Error**: "Port already in use" or "EADDRINUSE"
- **Solution**: App Platform sets PORT automatically - ensure `server.js` uses `process.env.PORT`

**Error**: "Cannot find build directory"
- **Solution**: Verify `npm run build` creates `build/` directory
- Check build logs for errors

### CORS Errors

**Error**: "Not allowed by CORS" in browser console
- **Solution**: 
  1. Set `ALLOWED_ORIGIN` environment variable to your app URL
  2. Ensure `NODE_ENV=production` is set
  3. Redeploy the app

### API Keys Not Working

**Error**: "API key not found" or "Unauthorized"
- **Solution**: 
  1. Verify environment variables are set correctly in App Platform dashboard
  2. Check for typos in variable names (case-sensitive)
  3. Ensure no extra spaces in API key values
  4. Redeploy after adding environment variables

### Health Check Failing

**Error**: Health check returns 404 or 500
- **Solution**: 
  1. Verify `/api/health` endpoint exists in `server.js`
  2. Check that routes are configured before the catch-all handler
  3. Review runtime logs for errors

## Security Considerations

### Environment Variables
- ✅ API keys are stored securely in App Platform (encrypted at rest)
- ✅ Never commit `.env` files to Git (already in `.gitignore`)
- ✅ Use different API keys for production vs development

### CORS Protection
- ✅ Production CORS is restricted to your app domain
- ✅ Development allows all origins (for local testing)
- ⚠️ Update `ALLOWED_ORIGIN` after first deployment

### Rate Limiting
- ✅ API routes have rate limiting: 10 requests/minute per IP
- ✅ Configured in `api/routes/generate.js`

### Data Privacy
- ⚠️ User scripts are sent to external APIs (OpenAI, Google, Kie.ai)
- ⚠️ Scripts are logged server-side (check logs for sensitive data)
- ✅ No persistent storage of user data (stateless application)

## Monitoring and Maintenance

### View Logs
- **Runtime Logs**: App Platform dashboard > Your App > Runtime Logs
- **Build Logs**: App Platform dashboard > Your App > Build Logs

### Update Application
1. Push changes to your Git repository
2. App Platform will auto-deploy if `deploy_on_push: true` is set
3. Or manually trigger deployment from the dashboard

### Scaling
- **Vertical Scaling**: Upgrade instance size in Settings
- **Horizontal Scaling**: Increase instance count (requires App Platform Pro plan)

### Cost Management
- Monitor usage in DigitalOcean dashboard
- Set up billing alerts
- Consider upgrading/downgrading based on traffic

## Additional Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Node.js on App Platform](https://docs.digitalocean.com/products/app-platform/how-to/use-buildpacks/)
- [Environment Variables Guide](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)

## Support

If you encounter issues:
1. Check App Platform logs (Runtime and Build)
2. Verify all environment variables are set
3. Review this deployment guide
4. Consult DigitalOcean support documentation

