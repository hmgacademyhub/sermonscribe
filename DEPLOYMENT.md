# Deployment Guide - HMG SermonScribe v4

## Prerequisites
- A GitHub account (free)
- Chrome, Edge, or Safari browser

## Option 1: GitHub Pages (FREE - Recommended)

1. Create a new repository on GitHub named `sermonscribe`
2. Set visibility to **Public**
3. Push all files from this folder:
   ```bash
   cd /path/to/sermon
   git init
   git add .
   git commit -m "Initial commit: SermonScribe v4"
   git remote add origin https://github.com/YOUR_USERNAME/sermonscribe.git
   git branch -M main
   git push -u origin main
   ```
4. Go to repository Settings > Pages > Source > Deploy from branch > main > /(root)
5. Wait 2-3 minutes. Your app is live at: `https://YOUR_USERNAME.github.io/sermonscribe/`

## Option 2: Netlify (FREE - Easiest)
1. Go to netlify.com and sign up
2. Click Sites > Add new site > Deploy manually
3. Drag and drop the entire `sermon/` folder
4. Your site is live instantly

## Option 3: Vercel (FREE)
1. Go to vercel.com and sign up with GitHub
2. Click Add New > Project > Import repository
3. Set Framework Preset to "Other", Build Command to empty, Output Directory to "."
4. Click Deploy

## Option 4: Cloudflare Pages (FREE)
1. Go to pages.cloudflare.com
2. Create a project, connect GitHub
3. Set build command to empty, output directory to "."
4. Deploy

## Option 5: Local Testing
```bash
cd /path/to/sermon
python -m http.server 8000
# Open http://localhost:8000
```

## Post-Deployment
1. Test the recording button (requires Chrome/Edge/Safari)
2. Verify all navigation links work
3. Test offline mode
4. Test all export formats

## Troubleshooting
- Recording not working: Use Chrome or Edge (Firefox has limited Speech Recognition)
- App not loading: Clear browser cache, check all files uploaded
- Files not found: File names are case-sensitive on GitHub Pages
