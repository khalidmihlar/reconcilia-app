# 🏥 Reconcilia App - Installation Guide for Ubuntu/WSL

## Quick Start (3 Steps)

### Step 1: Download the Setup Script
```bash
curl -fsSL https://raw.githubusercontent.com/khalidmihlar/reconcilia-app/main/setup-reconcilia-ubuntu.sh -o setup-reconcilia-ubuntu.sh
chmod +x setup-reconcilia-ubuntu.sh
```

### Step 2: Run the Setup Script
```bash
./setup-reconcilia-ubuntu.sh
```

### Step 3: Follow the Prompts
The script will automatically:
- ✅ Update package lists
- ✅ Install Git (if needed)
- ✅ Install Node.js v18+ (if needed)
- ✅ Download Reconcilia
- ✅ Install all dependencies
- ✅ Create launch script

**That's it!** Installation takes **5-10 minutes**.

---

## For WSL (Windows Subsystem for Linux)

### What is WSL?
WSL lets you run Linux on Windows. If you're using WSL, this script works perfectly!

### Installation on WSL:

1. **Open WSL Terminal:**
   - Press `Windows Key`
   - Type "Ubuntu" or "WSL"
   - Press Enter

2. **Download and run the script:**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/khalidmihlar/reconcilia-app/main/setup-reconcilia-ubuntu.sh -o setup-reconcilia-ubuntu.sh
   chmod +x setup-reconcilia-ubuntu.sh
   ./setup-reconcilia-ubuntu.sh
   ```

3. **Access from Windows:**
   - The app runs in WSL
   - Access it from your Windows browser
   - Go to: `http://localhost:5173`

---

## What to Expect

### During Installation:
- **Colored terminal output**:
  - 🟢 Green = Success
  - 🟡 Yellow = Warning/Question
  - 🔵 Blue = Information
  - 🔴 Red = Error
- **Progress messages** for each step
- **Questions** you'll be asked:
  - "Do you want to delete existing directory?" - Usually **N**
  - "Do you want to reinstall dependencies?" - Usually **N**
  - "Do you want to reset the database?" - Usually **N**
  - "Start Reconcilia now?" - **Y** to launch immediately

---

## Using Reconcilia

### On Native Ubuntu:
```bash
cd reconcilia-app
./start-reconcilia.sh
```

Browser opens automatically to `http://localhost:5173`

### On WSL:
```bash
cd reconcilia-app
./start-reconcilia.sh
```

**Then:** Open your Windows browser (Chrome, Edge, Firefox) and go to:
```
http://localhost:5173
```

### Logging In
```
Email:    test@example.com
Password: password123
```

---

## Troubleshooting

### Permission Denied
```bash
chmod +x setup-reconcilia-ubuntu.sh
./setup-reconcilia-ubuntu.sh
```

### "sudo: command not found" on WSL
Your WSL user needs sudo access:
```bash
# Run as root user first
wsl -u root
# Add your user to sudoers
usermod -aG sudo $USER
# Exit and restart WSL
```

### Node.js Installation Fails
Manually install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Git Clone Fails
Check internet connection:
```bash
ping -c 3 github.com
```

If blocked, try with HTTPS (script already uses HTTPS):
```bash
git clone https://github.com/khalidmihlar/reconcilia-app.git
```

### npm install Fails
Clear npm cache and retry:
```bash
cd reconcilia-app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port 5173 Already in Use
Find what's using the port:
```bash
lsof -i :5173
```

Kill the process:
```bash
kill -9 <PID>
```

### WSL: Can't Access from Windows Browser
Make sure Windows Firewall allows WSL:
```bash
# In WSL, find your IP
ip addr show eth0 | grep inet

# Access using WSL IP instead
http://<WSL-IP>:5173
```

Or use `localhost`:
```
http://localhost:5173
```

---

## Stopping the Application

Press `Ctrl + C` in the terminal where it's running.

---

## Uninstalling

### Remove Reconcilia:
```bash
rm -rf ~/reconcilia-app
```

### Remove Dependencies (Optional):
```bash
# Only if you don't need them for other projects
sudo apt-get remove nodejs git
sudo apt-get autoremove
```

---

## WSL-Specific Tips

### Accessing Windows Files from WSL:
Your Windows files are at:
```bash
cd /mnt/c/Users/YourName/
```

### Accessing WSL Files from Windows:
In Windows File Explorer, go to:
```
\\wsl$\Ubuntu\home\YourUsername\
```

### WSL Network Tips:
- WSL shares network with Windows
- `localhost` in WSL = `localhost` in Windows
- Apps in WSL are accessible from Windows browsers

### Restarting WSL:
If something isn't working:
```powershell
# In Windows PowerShell
wsl --shutdown
# Then reopen Ubuntu
```

---

## System Requirements

### Ubuntu:
- **Version:** 20.04 LTS or newer
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 1GB free space
- **Internet:** Required for installation

### WSL:
- **Windows:** 10 version 2004+ or Windows 11
- **WSL 2** recommended (faster than WSL 1)
- **Ubuntu** from Microsoft Store

---

## What Gets Installed?

1. **Git** - Version control
   - Location: `/usr/bin/git`

2. **Node.js** (v18+) - JavaScript runtime
   - Location: `/usr/bin/node`
   - Includes npm

3. **Reconcilia App** - Your application
   - Location: `~/reconcilia-app`

All are standard installations and won't interfere with other software.

---

## Updates

When a new version is released:

```bash
cd reconcilia-app
git pull origin main
npm install
./start-reconcilia.sh
```

---

## Common Commands

### Start the app:
```bash
cd reconcilia-app
./start-reconcilia.sh
```

### Stop the app:
```
Ctrl + C
```

### Check if Node.js is installed:
```bash
node --version
npm --version
```

### Check if Git is installed:
```bash
git --version
```

### View app logs:
The terminal shows all logs in real-time

---

## Advanced: One-Line Install

For quick installation (downloads and runs script automatically):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/khalidmihlar/reconcilia-app/main/setup-reconcilia-ubuntu.sh)
```

---

## Differences from Mac/Windows

| Feature | Ubuntu/WSL | macOS | Windows |
|---------|-----------|-------|---------|
| Package Manager | apt | Homebrew | Chocolatey |
| Shell | bash | bash/zsh | cmd/PowerShell |
| Installation Time | 5-10 min | 5-10 min | 10-15 min |
| Admin Required | Yes (sudo) | Sometimes | Yes |
| Browser Access | Direct or WSL→Windows | Direct | Direct |

---

## Need Help?

### Quick Fixes:
1. Restart WSL/Ubuntu
2. Re-run the script
3. Check internet connection
4. Make sure you have sudo privileges

### Still Stuck?
Contact your team lead with:
- Screenshot of error
- Ubuntu/WSL version (`lsb_release -a`)
- What you were doing when error occurred
- Terminal output

---

## Success Checklist

After installation, you should be able to:
- [ ] Run `./start-reconcilia.sh` without errors
- [ ] Access `http://localhost:5173` in browser
- [ ] See Reconcilia login page
- [ ] Log in with test credentials
- [ ] See the dashboard

---

**Ready to install? Copy and paste the install command!** 🚀

```bash
curl -fsSL https://raw.githubusercontent.com/khalidmihlar/reconcilia-app/main/setup-reconcilia-ubuntu.sh -o setup-reconcilia-ubuntu.sh && chmod +x setup-reconcilia-ubuntu.sh && ./setup-reconcilia-ubuntu.sh
```
