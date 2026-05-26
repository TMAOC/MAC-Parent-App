# MAC Parent Portal — Proxy Server Setup Guide
## Deploying to Railway.app (Free, ~10 minutes)

---

## What you're doing
You're deploying a small "middleman" server that sits between your parent portal
and Transparent Classroom. Your portal talks to YOUR server, which then securely
talks to TC. This gets around the browser security restriction that was blocking
direct logins.

---

## Step 1 — Create a free GitHub account (if you don't have one)
1. Go to https://github.com
2. Click **Sign up** and create a free account
3. Verify your email

---

## Step 2 — Create a new GitHub repository
1. Once logged in, click the **+** icon (top right) → **New repository**
2. Name it: `mac-tc-proxy`
3. Set it to **Private** (keeps your code secure)
4. Click **Create repository**
5. On the next page, click **uploading an existing file**
6. Upload these 4 files from the zip you downloaded:
   - `server.js`
   - `package.json`
   - `railway.toml`
   - `.gitignore`
7. Click **Commit changes**

---

## Step 3 — Create a free Railway account
1. Go to https://railway.app
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub

---

## Step 4 — Deploy your proxy
1. Once logged into Railway, click **New Project**
2. Select **Deploy from GitHub repo**
3. Select `mac-tc-proxy` from the list
4. Railway will automatically detect it's a Node.js app and deploy it
5. Wait about 60 seconds for the build to finish
6. Click on your project, then click **Settings** → **Networking**
7. Click **Generate Domain** — Railway gives you a free URL like:
   `https://mac-tc-proxy-production.up.railway.app`
8. **Copy this URL** — you'll need it in the next step

---

## Step 5 — Update your parent portal
1. Open `mac_parent_portal.html` in a text editor (Notepad, TextEdit, VS Code)
2. Find this line near the top of the `<script>` section:
   ```
   var PROXY_BASE = 'YOUR_RAILWAY_URL_HERE';
   ```
3. Replace `YOUR_RAILWAY_URL_HERE` with your Railway URL, for example:
   ```
   var PROXY_BASE = 'https://mac-tc-proxy-production.up.railway.app';
   ```
4. Save the file

---

## Step 6 — Update the allowed domain in your proxy
1. Go back to your GitHub repository
2. Click on `server.js` to open it
3. Click the pencil icon (Edit) 
4. Find this section:
   ```
   const ALLOWED_ORIGINS = [
     'https://www.yourdomain.com',    // ← change this
   ```
5. Replace `https://www.yourdomain.com` with your actual FinalSite URL, e.g.:
   ```
   'https://www.montessoriacademyofcolorado.org',
   ```
6. Click **Commit changes** at the bottom
7. Railway will automatically re-deploy (takes ~60 seconds)

---

## Step 7 — Add the portal to your FinalSite website
1. Log in to your FinalSite admin
2. Create a new page (e.g. "Parent Portal")
3. Add an **HTML/Embed block** to the page
4. Paste the contents of `mac_parent_portal.html` into it
   — OR — upload the HTML file and link to it directly
5. Publish the page

---

## Step 8 — Test it
1. Visit your new FinalSite page
2. Click the **Dashboard** tab
3. Enter your Transparent Classroom email and password
4. Click **Connect to Transparent Classroom**
5. If successful, you'll see a green "Connected" banner

---

## Costs
- **GitHub**: Free
- **Railway**: Free tier includes 500 hours/month (enough for ~20 days of 24/7 uptime,
  or effectively unlimited if usage is light). $5/month if you need always-on.
- **FinalSite**: You already pay for this

---

## Troubleshooting

**"Not allowed by CORS" error**
→ Make sure you updated the `ALLOWED_ORIGINS` in `server.js` to match your
  exact FinalSite URL (include https://, no trailing slash)

**"TC authentication failed"**
→ Double-check the email and password are for a Transparent Classroom account
  that has been set up by your school admin

**Railway build failed**
→ Make sure all 4 files were uploaded correctly to GitHub.
  Check the Railway build logs for details.

**Need help?**
→ Email Railway support: support@railway.app
→ GitHub docs: https://docs.github.com
