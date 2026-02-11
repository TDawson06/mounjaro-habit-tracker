# Push to GitHub and Deploy — Step-by-Step

Your project is already committed locally. Follow these steps in order.

---

## Step 1: Create a new repo on GitHub (if you haven’t)

1. Go to **https://github.com** and sign in.
2. Click the **+** (top right) → **New repository**.
3. Set **Repository name** to: `mounjaro-habit-tracker` (or any name you like).
4. Leave it **Public**.
5. **Do not** check "Add a README" or "Add .gitignore" — you already have code.
6. Click **Create repository**.

---

## Step 2: Connect your folder and push

GitHub will show you "…or push an existing repository from the command line." Use **your** repo URL in the commands below.

**If your GitHub username is `YourUsername`**, run in Cursor’s terminal (or PowerShell in the project folder):

```powershell
cd c:\Cursor\mounjaro-habit-tracker
git remote add origin https://github.com/YourUsername/mounjaro-habit-tracker.git
git push -u origin main
```

**Replace `YourUsername`** with your actual GitHub username.  
If you chose a different repo name, use that instead of `mounjaro-habit-tracker` in the URL.

- You may be asked to sign in (browser or token). Complete the login.
- After `git push`, your code will be on GitHub.

---

## Step 3: Deploy on Netlify

1. Go to **https://netlify.com** and sign in (e.g. **Sign up / Log in with GitHub**).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorize Netlify if asked.
4. Select your **mounjaro-habit-tracker** repo (or your repo name).
5. On the configure screen:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Branch to deploy:** `main` (default)
6. Click **Deploy site**.
7. Wait 1–2 minutes. When it’s done, you’ll get a URL like:
   - **https://random-name.netlify.app**

You can change the site name under **Site settings** → **Domain management** → **Edit site name** (e.g. `mounjaro-tracker` → `https://mounjaro-tracker.netlify.app`).

That’s your live app. Open it on your phone to use it and install it.

---

## Step 4: Use it on your phone

1. On your phone, open **Chrome** (Android) or **Safari** (iPhone).
2. Go to your Netlify URL (e.g. `https://your-site-name.netlify.app`).
3. **Android (Chrome):** Tap Menu (⋮) → **Install app** or **Add to Home screen**.
4. **iPhone (Safari):** Tap the Share icon → **Add to Home Screen** → name it **Mounjaro Tracker** → **Add**.

Open the app from your home screen. It will run full screen like an app. Data is stored on that device (localStorage).

---

## Later: update the live app after code changes

After you change code and want the live site to update:

```powershell
cd c:\Cursor\mounjaro-habit-tracker
git add .
git commit -m "Describe your change"
git push
```

Netlify will automatically rebuild and update your site in about a minute.
