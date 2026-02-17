# 🏥 Reconcilia App - Installation Guide for Mac

## Quick Start (3 Steps)

### Step 1: Download the Setup Script
1. Click this link to download: [setup-reconcilia-mac.sh](setup-reconcilia-mac.sh)
2. The file will download to your **Downloads** folder

### Step 2: Open Terminal
1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter
3. A window with a black/white background will open

### Step 3: Run the Setup Script
Copy and paste these commands into Terminal (press Enter after each line):

```bash
cd ~/Downloads
chmod +x setup-reconcilia-mac.sh
./setup-reconcilia-mac.sh
```

**That's it!** The script will automatically:
- ✅ Install everything you need
- ✅ Download the app
- ✅ Set it up completely
- ✅ Create a desktop shortcut

---

## What to Expect

### During Installation:
- You may be asked to install **Xcode Command Line Tools** - click Install
- You may be asked for your Mac password - this is normal
- Installation takes **5-10 minutes** depending on your internet speed
- You'll see progress messages in different colors:
  - 🟢 Green = Success
  - 🟡 Yellow = Warning/Question
  - 🔵 Blue = Information
  - 🔴 Red = Error

### Questions You Might See:
The script will ask you a few yes/no questions:
- **"Do you want to reinstall dependencies?"** - Usually say **N** (No)
- **"Do you want to reset the database?"** - Usually say **N** (No)
- **"Create desktop shortcut?"** - Say **Y** (Yes) for convenience
- **"Start Reconcilia now?"** - Say **Y** (Yes) to launch immediately

---

## Using Reconcilia

### Option 1: Desktop Shortcut (Easiest)
1. Look for **Reconcilia.command** on your Desktop
2. Double-click it
3. Wait 10-15 seconds for the app to start
4. Your browser will open to `http://localhost:5173`

### Option 2: Terminal
```bash
cd reconcilia-app
./start-reconcilia.sh
```

### Logging In
```
Email:    test@example.com
Password: password123
```

---

## Troubleshooting

### "Permission Denied" Error
Run this command:
```bash
chmod +x ~/Downloads/setup-reconcilia-mac.sh
```

### "SSH Key" Error
The script will show you a link to set up SSH keys. Or, you can:
1. Ask your team lead for the ZIP file version instead
2. We'll provide an alternative download method

### App Won't Start
1. Make sure nothing is running on port 5173
2. Try closing the Terminal and running the script again
3. Restart your computer and try again

### Database Issues
If you see database errors:
```bash
cd reconcilia-app
rm -f database/reconcila.db
npm run dev
```
This will create a fresh database.

---

## Stopping the Application

Press `Ctrl + C` in the Terminal window where it's running.

---

## Uninstalling

To completely remove Reconcilia:

```bash
# Remove the application folder
rm -rf ~/reconcilia-app

# Remove the desktop shortcut (if created)
rm -f ~/Desktop/Reconcilia.command

# Optional: Remove dependencies (only if you don't need them for other apps)
# brew uninstall node
```

---

## Need Help?

### Common Issues:

**Q: The browser doesn't open automatically**  
A: Manually open your browser and go to: http://localhost:5173

**Q: I see "Port already in use"**  
A: Something else is using port 5173 or 3001. Close other applications and try again.

**Q: "Module not found" errors**  
A: Run this:
```bash
cd reconcilia-app
rm -rf node_modules
npm install
npm run dev
```

**Q: The app looks broken/weird**  
A: Clear your browser cache:
- Chrome: `Cmd + Shift + Delete`
- Safari: `Cmd + Option + E`

---

## Contact

If you're stuck, contact:
- **Team Lead:** [Your Name]
- **Tech Support:** [Email/Slack]

---

## System Requirements

- **macOS:** 10.15 (Catalina) or newer
- **Storage:** 500MB free space
- **Internet:** Required for initial setup
- **Browser:** Chrome, Safari, Firefox, or Edge

---

## What Gets Installed?

The script installs:
1. **Homebrew** - Package manager for Mac
2. **Git** - Version control system
3. **Node.js** (v18+) - JavaScript runtime
4. **Reconcilia App** - Your medication reconciliation app

All installations are in standard Mac locations and won't interfere with other software.