# 🏥 Reconcilia App - Installation Guide for Windows

## Quick Start (3 Steps)

### Step 1: Download the Setup Script
1. Right-click this link: [setup-reconcilia-windows.bat](setup-reconcilia-windows.bat)
2. Select "Save link as..."
3. Save to your **Downloads** folder

### Step 2: Run as Administrator
1. Go to your **Downloads** folder
2. Find `setup-reconcilia-windows.bat`
3. **Right-click** on it
4. Select **"Run as administrator"**
5. Click **"Yes"** when Windows asks for permission

### Step 3: Follow the Prompts
The script will automatically:
- ✅ Install Chocolatey (Windows package manager)
- ✅ Install Git
- ✅ Install Node.js
- ✅ Download Reconcilia
- ✅ Install all dependencies
- ✅ Create desktop shortcut
- ✅ Launch the app

**That's it!** Installation takes **10-15 minutes** depending on your internet speed.

---

## What to Expect

### During Installation:
- A **black Command Prompt window** will appear
- You'll see **colored messages**:
  - 🟢 Green = Success
  - 🟡 Yellow = Warning/Question
  - 🔵 Blue = Information
  - 🔴 Red = Error
- You may see **PowerShell windows** pop up briefly - this is normal
- Your antivirus might ask for permission - click **Allow**

### Questions You'll Be Asked:
- **"Do you want to delete existing directory?"** - Usually say **N**
- **"Do you want to reinstall dependencies?"** - Usually say **N**
- **"Do you want to reset the database?"** - Usually say **N**
- **"Create desktop shortcut?"** - Say **Y** for convenience
- **"Start Reconcilia now?"** - Say **Y** to launch immediately

---

## Using Reconcilia

### Option 1: Desktop Shortcut (Easiest)
1. Look for **Reconcilia.lnk** on your Desktop
2. Double-click it
3. Wait 10-15 seconds
4. Browser opens to `http://localhost:5173`

### Option 2: Start Menu
1. Press **Windows Key**
2. Type **"cmd"**
3. Press **Enter**
4. Type: `cd reconcilia-app`
5. Type: `start-reconcilia.bat`

### Logging In
```
Email:    test@example.com
Password: password123
```

---

## Troubleshooting

### "Windows protected your PC" Warning
1. Click **"More info"**
2. Click **"Run anyway"**
3. This is normal for downloaded scripts

### "Access Denied" or Permission Errors
**Solution:** Run the script as Administrator:
1. Right-click `setup-reconcilia-windows.bat`
2. Select **"Run as administrator"**

### Chocolatey Installation Fails
**Manual Installation:**
1. Open **PowerShell as Administrator**
2. Run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```
3. Close PowerShell and re-run the setup script

### Port Already in Use
If you see "Port 5173 is already in use":
1. Press **Ctrl+Shift+Esc** (Task Manager)
2. Find any Node.js or npm processes
3. Right-click → **End Task**
4. Try starting again

### Antivirus Blocking Installation
Some antivirus software may block the installation:
1. Temporarily disable antivirus
2. Run the setup script
3. Re-enable antivirus after installation
4. Add `reconcilia-app` folder to exclusions

### Database Errors
If you see database errors:
```batch
cd reconcilia-app
del database\reconcila.db
npm run dev
```

### "npm not found" Error
**Solution:**
1. Close all Command Prompt windows
2. Open a **new** Command Prompt
3. Try again (npm should now be in PATH)

---

## Stopping the Application

In the Command Prompt window where it's running:
1. Press **Ctrl + C**
2. Press **Y** when asked to terminate
3. Close the window

---

## Uninstalling

### Remove Reconcilia:
```batch
rmdir /s /q reconcilia-app
del "%USERPROFILE%\Desktop\Reconcilia.lnk"
```

### Remove Dependencies (Optional):
Only if you don't need them for other applications:
```batch
choco uninstall nodejs git -y
```

---

## Alternative: PowerShell One-Liner

If the BAT file doesn't work, try this PowerShell command:

1. Press **Windows Key**
2. Type **"PowerShell"**
3. **Right-click** → **"Run as Administrator"**
4. Paste this:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; Invoke-WebRequest -Uri "https://raw.githubusercontent.com/khalidmihlar/reconcilia-app/main/setup-reconcilia-windows.bat" -OutFile "$env:TEMP\setup-reconcilia.bat"; & "$env:TEMP\setup-reconcilia.bat"
```

---

## Common Issues & Solutions

### Issue: Script Closes Immediately
**Cause:** Not running as Administrator  
**Fix:** Right-click → "Run as administrator"

### Issue: "Git is not recognized"
**Cause:** PATH not updated  
**Fix:** Close all windows, open new Command Prompt

### Issue: Browser Doesn't Open
**Cause:** App is running but browser didn't auto-open  
**Fix:** Manually go to `http://localhost:5173`

### Issue: Chocolatey Installation Hangs
**Cause:** Network or permissions issue  
**Fix:** 
1. Press **Ctrl+C** to cancel
2. Run script again
3. Or install Chocolatey manually first

### Issue: "Module not found" Errors
**Fix:**
```batch
cd reconcilia-app
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

### Issue: Firewall Blocking
Windows Firewall may ask about Node.js:
- Click **"Allow access"**
- Select both **Private** and **Public** networks

---

## System Requirements

- **Windows:** 10 or 11 (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 1GB free space
- **Internet:** Required for installation
- **Administrator:** Required for installation

---

## What Gets Installed?

1. **Chocolatey** - Windows package manager
   - Location: `C:\ProgramData\chocolatey`

2. **Git** - Version control
   - Location: `C:\Program Files\Git`

3. **Node.js** (v18+) - JavaScript runtime
   - Location: `C:\Program Files\nodejs`

4. **Reconcilia App** - Your application
   - Location: `reconcilia-app` (in same folder as script)

All are standard installations and won't interfere with other software.

---

## Security Notes

### Why Run as Administrator?
- Chocolatey requires admin to install system-wide packages
- Git and Node.js need admin to modify PATH
- After installation, the app runs without admin rights

### Is This Safe?
- ✅ Script only installs from official sources
- ✅ Chocolatey is a trusted Windows package manager
- ✅ All packages are verified and widely used
- ✅ You can review the script before running

### Antivirus False Positives
Some antivirus software may flag the script because:
- It downloads files from the internet
- It modifies system PATH
- It installs software

This is normal for installation scripts. You can:
1. Review the script content first
2. Temporarily allow the installation
3. Add the reconcilia-app folder to exclusions

---

## Need Help?

### Quick Fixes (Try These First):
1. **Close everything and restart your computer**
2. **Run the script again as Administrator**
3. **Check your internet connection**
4. **Temporarily disable antivirus**

### Still Stuck?
Contact:
- **Team Lead:** [Your Name]
- **Tech Support:** [Email/Slack]

Include:
- Screenshot of error
- Windows version (Win + Pause/Break)
- What you were doing when error occurred

---

## Video Tutorial

[Optional: Add link to screen recording of installation]

---

## For Advanced Users

### Manual Installation:
If the automatic script doesn't work:

```batch
REM Install Chocolatey
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"

REM Install dependencies
choco install git nodejs -y

REM Clone and setup
git clone https://github.com/khalidmihlar/reconcilia-app.git
cd reconcilia-app
npm install
npm run dev
```

---

## Differences from Mac Version

| Feature | Windows | Mac |
|---------|---------|-----|
| Package Manager | Chocolatey | Homebrew |
| Admin Required | Yes (initial) | Sometimes |
| Script Type | .bat | .sh |
| Installation Time | 10-15 min | 5-10 min |

---

## After Installation

### First Time Setup:
1. Launch Reconcilia
2. Log in with test credentials
3. Change password (recommended)
4. Create your first patient
5. Explore the features!

### Daily Use:
- Double-click desktop shortcut
- Or run `start-reconcilia.bat`
- App opens in default browser
- Stop with Ctrl+C when done

---

## Updates

When a new version is released:

```batch
cd reconcilia-app
git pull origin main
npm install
start-reconcilia.bat
```

Or just re-run the setup script (it will ask about re-cloning).

---

## Support Matrix

| Windows Version | Supported | Notes |
|----------------|-----------|-------|
| Windows 11 | ✅ Yes | Fully tested |
| Windows 10 | ✅ Yes | Recommended |
| Windows 8.1 | ⚠️ Maybe | Not tested |
| Windows 7 | ❌ No | Too old |

---

**Ready to install? Download the setup script and run it as Administrator!** 🚀