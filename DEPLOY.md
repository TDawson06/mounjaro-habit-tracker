# Access Mounjaro Tracker on Your Phone (Anywhere)

You have two options: **deploy as a web app** (use from any phone, install to home screen) or **package as a store app** (Apple/Google).

---

## Option A: Deploy the Web App (Recommended First)

Deploy once, then open the link on your phone. You can **Add to Home Screen** for an app-like icon and full-screen experience. Data stays in your phone’s browser (localStorage).

### 1. Push your project to GitHub

```bash
cd c:\Cursor\mounjaro-habit-tracker
git init
git add .
git commit -m "Initial Mounjaro Tracker app"
```

Create a new repo on [github.com](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mounjaro-habit-tracker.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import your `mounjaro-habit-tracker` repo.
3. Leave defaults: **Build Command** `npm run build`, **Output Directory** `dist`.
4. Click **Deploy**. In a minute you’ll get a URL like `https://mounjaro-habit-tracker-xxx.vercel.app`.

### 3. Use it on your phone

- Open that URL in your phone’s browser (Chrome or Safari).
- **Android (Chrome):** Menu (⋮) → **Add to Home screen** or **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen** → name it “Mounjaro Tracker” → Add.

After that, open it from your home screen like any app. It runs in standalone mode (no URL bar). Your data is stored on that device (localStorage); it doesn’t sync across devices unless you add a backend later.

---

## Option B: Netlify (alternative to Vercel)

1. Go to [netlify.com](https://netlify.com) and sign in.
2. **Add new site** → **Import an existing project** → connect GitHub → select your repo.
3. Build command: `npm run build`, publish directory: `dist`.
4. Deploy. You’ll get a URL like `https://random-name.netlify.app`.

Then use the same “Add to Home Screen” / “Install app” steps on your phone as above.

---

## Option C: Turn It Into a “Real” App Store / Play Store App

To ship it as an installable app in the **Apple App Store** or **Google Play Store**, you wrap the same web app with **Capacitor**. You still deploy the site for updates; the app is essentially a full-screen browser pointing at your site (or at bundled files).

### 1. Build the web app

```bash
npm run build
```

### 2. Add Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Mounjaro Tracker" com.yourname.mounjarotracker
```

### 3. Add a platform (e.g. Android first)

```bash
npm install @capacitor/android
npx cap add android
npx cap sync
```

### 4. Open in Android Studio and run / publish

```bash
npx cap open android
```

In Android Studio you can run on a device/emulator or create a signed bundle for **Google Play**.

### 5. For iPhone (Apple Developer account required)

```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios
```

Open the project in Xcode, then run on a device or archive for **App Store Connect**. You need a paid Apple Developer account ($99/year) to publish to the App Store.

---

## Summary

| Goal                         | What to do |
|-----------------------------|------------|
| Use on phone anywhere       | Deploy to Vercel or Netlify (Option A or B), open URL on phone, then Add to Home Screen. |
| App-like icon, full screen  | Same as above; the PWA manifest already enables “Install app” / “Add to Home Screen”. |
| Listed in App Store/Play     | Use Capacitor (Option C), then submit the built app to Apple/Google. |

For most people, **Option A (Vercel + Add to Home Screen)** is enough: one link, works on any phone, and it behaves like an app when installed.
