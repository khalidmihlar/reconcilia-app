@echo off
REM ============================================================================
REM Reconcilia App - Automated Setup Script for Windows
REM This script will install all dependencies and launch the application
REM ============================================================================

REM Force the window to stay open
title Reconcilia App - Installation

setlocal enabledelayedexpansion

REM Configuration
set "REPO_URL=https://github.com/khalidmihlar/reconcilia-app.git"
set "APP_DIR=reconcilia-app"
set "REQUIRED_NODE_VERSION=18"

REM ============================================================================
REM Print Functions
REM ============================================================================

:print_header
echo.
echo ================================================================
echo   %~1
echo ================================================================
echo.
goto :eof

:print_success
echo [32m[+] %~1[0m
goto :eof

:print_error
echo [91m[X] %~1[0m
goto :eof

:print_warning
echo [93m[!] %~1[0m
goto :eof

:print_info
echo [94m[i] %~1[0m
goto :eof

REM ============================================================================
REM Main Script Start
REM ============================================================================

cls
call :print_header "RECONCILIA APP - AUTOMATED SETUP"

echo This script will:
echo   1. Check and install required dependencies
echo   2. Clone the Reconcilia repository
echo   3. Install application dependencies
echo   4. Set up the database
echo   5. Create launch scripts
echo.
echo All operations will be visible in this window.
echo The window will stay open so you can see all progress.
echo.
echo Press any key to continue or close this window to cancel...
pause >nul

REM ============================================================================
REM Check if running as Administrator
REM ============================================================================

call :print_header "Checking Administrator Privileges"

net session >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Running with administrator privileges"
    echo.
) else (
    call :print_warning "Not running as administrator"
    call :print_info "Some installations may require administrator privileges"
    call :print_info "If installations fail, close this and re-run as administrator"
    call :print_info "Right-click the file and select 'Run as administrator'"
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

REM ============================================================================
REM Check for Chocolatey
REM ============================================================================

call :print_header "Checking Chocolatey Installation"

where choco >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Chocolatey is already installed"
    echo.
    echo Version:
    choco --version
    echo.
) else (
    call :print_warning "Chocolatey not found. Installing..."
    echo.
    call :print_info "Installation output will appear below"
    call :print_info "This may take 1-2 minutes..."
    echo.
    echo ----------------------------------------------------------------
    
    REM Install Chocolatey with visible output - Using cmd to keep output visible
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& {Write-Host 'Starting Chocolatey installation...' -ForegroundColor Cyan; Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Write-Host 'Downloading installer...' -ForegroundColor Yellow; try { Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')); Write-Host 'Chocolatey installed successfully!' -ForegroundColor Green } catch { Write-Host 'Installation failed!' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }}"
    
    echo ----------------------------------------------------------------
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Chocolatey installed successfully"
        echo.
        call :print_info "Refreshing environment variables..."
        REM Manually add to PATH for this session
        set "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
        echo.
    ) else (
        echo.
        call :print_error "Failed to install Chocolatey"
        call :print_info "Please install manually from: https://chocolatey.org/install"
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

REM ============================================================================
REM Check for Git
REM ============================================================================

call :print_header "Checking Git Installation"

where git >nul 2>&1
if %errorLevel! == 0 (
    call :print_success "Git is already installed"
    echo.
    echo Version:
    git --version
    echo.
) else (
    call :print_warning "Git not found. Installing..."
    echo.
    call :print_info "Installation output will appear below"
    call :print_info "This may take 2-3 minutes..."
    echo.
    echo ----------------------------------------------------------------
    
    REM Install Git with visible output
    choco install git -y --no-progress
    
    echo ----------------------------------------------------------------
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Git installed successfully"
        echo.
        call :print_info "Refreshing environment variables..."
        set "PATH=%PATH%;C:\Program Files\Git\cmd"
        echo.
    ) else (
        echo.
        call :print_error "Failed to install Git"
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

REM ============================================================================
REM Check for Node.js
REM ============================================================================

call :print_header "Checking Node.js Installation"

where node >nul 2>&1
if !errorLevel! == 0 (
    call :print_info "Node.js is installed"
    echo.
    echo Version:
    node --version
    npm --version
    echo.
    
    REM Check version
    for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
        set NODE_MAJOR=%%b
    )
    
    if !NODE_MAJOR! GEQ %REQUIRED_NODE_VERSION% (
        call :print_success "Node.js version is sufficient (^>= v%REQUIRED_NODE_VERSION%)"
        echo.
    ) else (
        call :print_warning "Node.js version is too old. Upgrading..."
        echo.
        call :print_info "Upgrade output will appear below"
        echo.
        echo ----------------------------------------------------------------
        
        choco upgrade nodejs -y --no-progress
        
        echo ----------------------------------------------------------------
        echo.
        set "PATH=%PATH%;C:\Program Files\nodejs"
    )
) else (
    call :print_warning "Node.js not found. Installing..."
    echo.
    call :print_info "Installation output will appear below"
    call :print_info "This may take 3-5 minutes (it's a large download)..."
    echo.
    echo ----------------------------------------------------------------
    
    REM Install Node.js with visible output
    choco install nodejs -y --no-progress
    
    echo ----------------------------------------------------------------
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Node.js installed successfully"
        echo.
        call :print_info "Refreshing environment variables..."
        set "PATH=%PATH%;C:\Program Files\nodejs"
        echo.
    ) else (
        echo.
        call :print_error "Failed to install Node.js"
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

REM Verify npm
where npm >nul 2>&1
if !errorLevel! == 0 (
    call :print_success "npm is available"
    echo.
    echo Version:
    npm --version
    echo.
) else (
    call :print_error "npm installation failed"
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

REM ============================================================================
REM Clone Repository
REM ============================================================================

call :print_header "Setting Up Application"

if exist "%APP_DIR%" (
    call :print_warning "Directory '%APP_DIR%' already exists"
    echo.
    set /p "DELETE=Do you want to delete it and re-clone? (y/N): "
    if /i "!DELETE!"=="y" (
        echo.
        call :print_info "Removing existing directory..."
        rmdir /s /q "%APP_DIR%"
        echo.
        call :print_info "Cloning repository from GitHub..."
        call :print_info "URL: %REPO_URL%"
        echo.
        echo ----------------------------------------------------------------
        
        REM Clone with visible output
        git clone %REPO_URL%
        
        echo ----------------------------------------------------------------
        
        if !errorLevel! == 0 (
            echo.
            call :print_success "Repository cloned successfully"
            echo.
        ) else (
            echo.
            call :print_error "Failed to clone repository"
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    ) else (
        echo.
        call :print_info "Using existing directory"
        echo.
    )
) else (
    call :print_info "Cloning repository from GitHub..."
    call :print_info "URL: %REPO_URL%"
    echo.
    echo ----------------------------------------------------------------
    
    REM Clone with visible output
    git clone %REPO_URL%
    
    echo ----------------------------------------------------------------
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Repository cloned successfully"
        echo.
    ) else (
        echo.
        call :print_error "Failed to clone repository"
        call :print_info "Make sure the repository is accessible"
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

REM ============================================================================
REM Install Dependencies
REM ============================================================================

call :print_header "Installing Application Dependencies"

cd "%APP_DIR%"

if exist "node_modules\" (
    call :print_warning "Dependencies already installed"
    echo.
    set /p "REINSTALL=Do you want to reinstall? (y/N): "
    if /i "!REINSTALL!"=="y" (
        echo.
        call :print_info "Removing existing node_modules..."
        rmdir /s /q node_modules
        if exist "package-lock.json" del package-lock.json
        echo Done!
        echo.
        call :print_info "Installing dependencies..."
        call :print_info "This will take several minutes. All output shown below:"
        echo.
        echo ================================================================
        
        REM Install with full visible output
        npm install
        
        echo ================================================================
        
        if !errorLevel! == 0 (
            echo.
            call :print_success "Dependencies installed successfully"
            echo.
        ) else (
            echo.
            call :print_error "Failed to install dependencies"
            cd ..
            echo.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
    ) else (
        echo.
        call :print_info "Skipping dependency installation"
        echo.
    )
) else (
    call :print_info "Installing dependencies..."
    call :print_info "This will take several minutes. All output shown below:"
    echo.
    echo ================================================================
    
    REM Install with full visible output
    npm install
    
    echo ================================================================
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Dependencies installed successfully"
        echo.
    ) else (
        echo.
        call :print_error "Failed to install dependencies"
        cd ..
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

cd ..

REM ============================================================================
REM Setup Database
REM ============================================================================

call :print_header "Setting Up Database"

cd "%APP_DIR%"

if exist "database\reconcila.db" (
    call :print_success "Database already exists"
    echo.
    set /p "RESET_DB=Do you want to reset the database? (y/N): "
    if /i "!RESET_DB!"=="y" (
        echo.
        call :print_warning "Removing existing database..."
        del database\reconcila.db
        call :print_info "Database will be created on first run"
        echo.
    ) else (
        echo.
    )
) else (
    call :print_info "Database will be created automatically on first run"
    echo.
)

REM Ensure database directory exists
if not exist "database\" (
    mkdir database
    call :print_info "Created database directory"
    echo.
)

cd ..

REM ============================================================================
REM Create Launch Script
REM ============================================================================

call :print_header "Creating Launch Script"

cd "%APP_DIR%"

(
echo @echo off
echo title Reconcilia App
echo cls
echo echo.
echo echo ============================================
echo echo.
echo echo        RECONCILIA APP
echo echo.
echo echo ============================================
echo echo.
echo echo Starting application...
echo echo.
echo echo The app will be available at:
echo echo   http://localhost:5173
echo echo.
echo echo Press Ctrl+C to stop the application
echo echo.
echo npm run dev
echo echo.
echo echo Application stopped.
echo pause
) > start-reconcilia.bat

call :print_success "Launch script created: start-reconcilia.bat"
echo.

cd ..

REM ============================================================================
REM Create Desktop Shortcut
REM ============================================================================

call :print_header "Desktop Shortcut"

set /p "CREATE_SHORTCUT=Do you want to create a desktop shortcut? (y/N): "
if /i "!CREATE_SHORTCUT!"=="y" (
    cd "%APP_DIR%"
    
    echo.
    call :print_info "Creating desktop shortcut..."
    
    REM Create VBS script to create shortcut
    (
        echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
        echo sLinkFile = oWS.SpecialFolders^("Desktop"^) ^& "\Reconcilia.lnk"
        echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
        echo oLink.TargetPath = "%CD%\start-reconcilia.bat"
        echo oLink.WorkingDirectory = "%CD%"
        echo oLink.Description = "Reconcilia App"
        echo oLink.Save
    ) > create_shortcut.vbs
    
    cscript //nologo create_shortcut.vbs >nul 2>&1
    del create_shortcut.vbs
    
    echo.
    call :print_success "Desktop shortcut created: Reconcilia.lnk"
    call :print_info "You can double-click it to start the application"
    echo.
    
    cd ..
) else (
    echo.
)

REM ============================================================================
REM Final Instructions
REM ============================================================================

call :print_header "Setup Complete!"

echo.
echo [32m╔═══════════════════════════════════════════════════════════╗[0m
echo [32m║                                                           ║[0m
echo [32m║        Reconcilia has been successfully installed!        ║[0m
echo [32m║                                                           ║[0m
echo [32m╚═══════════════════════════════════════════════════════════╝[0m
echo.
echo [94mTo start the application:[0m
echo.
echo   Option 1: Use the launch script
echo     [93mcd %APP_DIR%[0m
echo     [93mstart-reconcilia.bat[0m
echo.
echo   Option 2: Use npm directly
echo     [93mcd %APP_DIR%[0m
echo     [93mnpm run dev[0m
echo.

if exist "%USERPROFILE%\Desktop\Reconcilia.lnk" (
    echo   Option 3: Double-click the desktop shortcut
    echo     [93mReconcilia.lnk[0m
    echo.
)

echo [94mThe application will be available at:[0m
echo   [92mhttp://localhost:5173[0m
echo.
echo [94mDefault login credentials:[0m
echo   Email:    [93mtest@example.com[0m
echo   Password: [93mpassword123[0m
echo.
echo ================================================================
echo.

REM ============================================================================
REM Ask to start now
REM ============================================================================

set /p "START_NOW=Would you like to start Reconcilia now? (y/N): "
if /i "!START_NOW!"=="y" (
    cd "%APP_DIR%"
    echo.
    call :print_info "Starting Reconcilia in a new window..."
    call :print_info "The app will open in your browser automatically"
    call :print_info "Close the new window to stop the application"
    echo.
    timeout /t 3 >nul
    start "Reconcilia App" cmd /k "start-reconcilia.bat"
    echo.
    call :print_success "Reconcilia is starting!"
    echo.
    echo This setup window will close in 10 seconds...
    echo You can close it manually or wait...
    timeout /t 10
    exit /b 0
) else (
    echo.
    echo You can start Reconcilia anytime by:
    echo   1. Going to the %APP_DIR% folder
    echo   2. Double-clicking start-reconcilia.bat
    echo   3. Or using the desktop shortcut
    echo.
    echo Press any key to close this window...
    pause >nul
    exit /b 0
)


REM ============================================================================
REM Print Functions
REM ============================================================================

:print_header
echo.
echo ================================================================
echo   %~1
echo ================================================================
echo.
goto :eof

:print_success
echo [32m[+] %~1[0m
goto :eof

:print_error
echo [91m[X] %~1[0m
goto :eof

:print_warning
echo [93m[!] %~1[0m
goto :eof

:print_info
echo [94m[i] %~1[0m
goto :eof

REM ============================================================================
REM Main Script Start
REM ============================================================================

cls
call :print_header "RECONCILIA APP - AUTOMATED SETUP"

echo This script will:
echo   1. Check and install required dependencies
echo   2. Clone the Reconcilia repository
echo   3. Install application dependencies
echo   4. Set up the database
echo   5. Create launch scripts
echo.
echo All operations will be visible in this window.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

REM ============================================================================
REM Check if running as Administrator
REM ============================================================================

call :print_header "Checking Administrator Privileges"

net session >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Running with administrator privileges"
) else (
    call :print_warning "Not running as administrator"
    call :print_info "Some installations may require administrator privileges"
    call :print_info "Right-click this script and select 'Run as administrator' if needed"
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

REM ============================================================================
REM Check for Chocolatey
REM ============================================================================

call :print_header "Checking Chocolatey Installation"

where choco >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Chocolatey is already installed"
    echo.
    choco --version
    echo.
) else (
    call :print_warning "Chocolatey not found. Installing..."
    echo.
    call :print_info "This installation will be visible in this window"
    call :print_info "Please wait, this may take a minute..."
    echo.
    
    REM Install Chocolatey with visible output
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& {Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Write-Host 'Downloading Chocolatey installer...' -ForegroundColor Cyan; $script = (New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'); Write-Host 'Running Chocolatey installer...' -ForegroundColor Cyan; Invoke-Expression $script; Write-Host 'Chocolatey installation complete!' -ForegroundColor Green}"
    
    if %errorLevel% == 0 (
        echo.
        call :print_success "Chocolatey installed successfully"
        echo.
        REM Refresh environment variables
        call refreshenv
    ) else (
        echo.
        call :print_error "Failed to install Chocolatey"
        call :print_info "Please install manually from: https://chocolatey.org/install"
        echo.
        pause
        exit /b 1
    )
)

REM ============================================================================
REM Check for Git
REM ============================================================================

call :print_header "Checking Git Installation"

where git >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Git is already installed"
    echo.
    git --version
    echo.
) else (
    call :print_warning "Git not found. Installing..."
    echo.
    call :print_info "Installation progress will be shown below:"
    echo.
    
    REM Install Git with visible output
    choco install git -y
    
    if %errorLevel% == 0 (
        echo.
        call :print_success "Git installed successfully"
        echo.
        call refreshenv
    ) else (
        echo.
        call :print_error "Failed to install Git"
        echo.
        pause
        exit /b 1
    )
)

REM ============================================================================
REM Check for Node.js
REM ============================================================================

call :print_header "Checking Node.js Installation"

where node >nul 2>&1
if %errorLevel% == 0 (
    call :print_info "Node.js is installed"
    echo.
    node --version
    npm --version
    echo.
    
    REM Check version
    for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
        set NODE_MAJOR=%%b
    )
    
    if !NODE_MAJOR! GEQ %REQUIRED_NODE_VERSION% (
        call :print_success "Node.js version is sufficient (^>= v%REQUIRED_NODE_VERSION%)"
        echo.
    ) else (
        call :print_warning "Node.js version is too old. Upgrading..."
        echo.
        call :print_info "Upgrade progress will be shown below:"
        echo.
        
        choco upgrade nodejs -y
        
        echo.
        call refreshenv
    )
) else (
    call :print_warning "Node.js not found. Installing..."
    echo.
    call :print_info "Installation progress will be shown below:"
    call :print_info "This may take several minutes..."
    echo.
    
    REM Install Node.js with visible output
    choco install nodejs -y
    
    if %errorLevel% == 0 (
        echo.
        call :print_success "Node.js installed successfully"
        echo.
        call refreshenv
    ) else (
        echo.
        call :print_error "Failed to install Node.js"
        echo.
        pause
        exit /b 1
    )
)

REM Verify npm
where npm >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "npm is available"
    echo.
    npm --version
    echo.
) else (
    call :print_error "npm installation failed"
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM Clone Repository
REM ============================================================================

call :print_header "Setting Up Application"

if exist "%APP_DIR%" (
    call :print_warning "Directory '%APP_DIR%' already exists"
    echo.
    set /p "DELETE=Do you want to delete it and re-clone? (y/N): "
    if /i "!DELETE!"=="y" (
        echo.
        call :print_info "Removing existing directory..."
        rmdir /s /q "%APP_DIR%"
        echo.
        call :print_info "Cloning repository from GitHub..."
        call :print_info "URL: %REPO_URL%"
        echo.
        
        REM Clone with visible output
        git clone %REPO_URL%
        
        if !errorLevel! == 0 (
            echo.
            call :print_success "Repository cloned successfully"
            echo.
        ) else (
            echo.
            call :print_error "Failed to clone repository"
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo.
        call :print_info "Using existing directory"
        echo.
    )
) else (
    call :print_info "Cloning repository from GitHub..."
    call :print_info "URL: %REPO_URL%"
    echo.
    
    REM Clone with visible output
    git clone %REPO_URL%
    
    if !errorLevel! == 0 (
        echo.
        call :print_success "Repository cloned successfully"
        echo.
    ) else (
        echo.
        call :print_error "Failed to clone repository"
        call :print_info "Make sure the repository is accessible"
        echo.
        pause
        exit /b 1
    )
)

REM ============================================================================
REM Install Dependencies
REM ============================================================================

call :print_header "Installing Application Dependencies"

cd "%APP_DIR%"

if exist "node_modules\" (
    call :print_warning "Dependencies already installed"
    echo.
    set /p "REINSTALL=Do you want to reinstall? (y/N): "
    if /i "!REINSTALL!"=="y" (
        echo.
        call :print_info "Removing existing node_modules..."
        rmdir /s /q node_modules
        if exist "package-lock.json" del package-lock.json
        echo.
        call :print_info "Installing dependencies..."
        call :print_info "This will take several minutes. Progress shown below:"
        echo.
        echo ----------------------------------------------------------------
        
        REM Install with visible output
        call npm install
        
        echo ----------------------------------------------------------------
        if !errorLevel! == 0 (
            echo.
            call :print_success "Dependencies installed successfully"
            echo.
        ) else (
            echo.
            call :print_error "Failed to install dependencies"
            cd ..
            echo.
            pause
            exit /b 1
        )
    ) else (
        echo.
        call :print_info "Skipping dependency installation"
        echo.
    )
) else (
    call :print_info "Installing dependencies..."
    call :print_info "This will take several minutes. Progress shown below:"
    echo.
    echo ----------------------------------------------------------------
    
    REM Install with visible output
    call npm install
    
    echo ----------------------------------------------------------------
    if !errorLevel! == 0 (
        echo.
        call :print_success "Dependencies installed successfully"
        echo.
    ) else (
        echo.
        call :print_error "Failed to install dependencies"
        cd ..
        echo.
        pause
        exit /b 1
    )
)

cd ..

REM ============================================================================
REM Setup Database
REM ============================================================================

call :print_header "Setting Up Database"

cd "%APP_DIR%"

if exist "database\reconcila.db" (
    call :print_success "Database already exists"
    echo.
    set /p "RESET_DB=Do you want to reset the database? (y/N): "
    if /i "!RESET_DB!"=="y" (
        echo.
        call :print_warning "Removing existing database..."
        del database\reconcila.db
        call :print_info "Database will be created on first run"
        echo.
    )
) else (
    call :print_info "Database will be created automatically on first run"
    echo.
)

REM Ensure database directory exists
if not exist "database\" (
    mkdir database
    call :print_info "Created database directory"
    echo.
)

cd ..

REM ============================================================================
REM Create Launch Script
REM ============================================================================

call :print_header "Creating Launch Script"

cd "%APP_DIR%"

(
echo @echo off
echo cls
echo echo.
echo echo ============================================
echo echo.
echo echo        RECONCILIA APP
echo echo.
echo echo ============================================
echo echo.
echo echo Starting application...
echo echo.
echo echo The app will be available at:
echo echo   http://localhost:5173
echo echo.
echo echo Press Ctrl+C to stop the application
echo echo.
echo npm run dev
) > start-reconcilia.bat

call :print_success "Launch script created: start-reconcilia.bat"
echo.

cd ..

REM ============================================================================
REM Create Desktop Shortcut
REM ============================================================================

call :print_header "Desktop Shortcut"

set /p "CREATE_SHORTCUT=Do you want to create a desktop shortcut? (y/N): "
if /i "!CREATE_SHORTCUT!"=="y" (
    cd "%APP_DIR%"
    
    echo.
    call :print_info "Creating desktop shortcut..."
    
    REM Create VBS script to create shortcut
    (
        echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
        echo sLinkFile = oWS.SpecialFolders^("Desktop"^) ^& "\Reconcilia.lnk"
        echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
        echo oLink.TargetPath = "%CD%\start-reconcilia.bat"
        echo oLink.WorkingDirectory = "%CD%"
        echo oLink.Description = "Reconcilia App"
        echo oLink.Save
    ) > create_shortcut.vbs
    
    cscript //nologo create_shortcut.vbs
    del create_shortcut.vbs
    
    echo.
    call :print_success "Desktop shortcut created: Reconcilia.lnk"
    call :print_info "You can double-click it to start the application"
    echo.
    
    cd ..
)

REM ============================================================================
REM Final Instructions
REM ============================================================================

call :print_header "Setup Complete!"

echo.
echo [32m╔═══════════════════════════════════════════════════════════╗[0m
echo [32m║                                                           ║[0m
echo [32m║        Reconcilia has been successfully installed!        ║[0m
echo [32m║                                                           ║[0m
echo [32m╚═══════════════════════════════════════════════════════════╝[0m
echo.
echo [94mTo start the application:[0m
echo.
echo   Option 1: Use the launch script
echo     [93mcd %APP_DIR%[0m
echo     [93mstart-reconcilia.bat[0m
echo.
echo   Option 2: Use npm directly
echo     [93mcd %APP_DIR%[0m
echo     [93mnpm run dev[0m
echo.

if exist "%USERPROFILE%\Desktop\Reconcilia.lnk" (
    echo   Option 3: Double-click the desktop shortcut
    echo     [93mReconcilia.lnk[0m
    echo.
)

echo [94mThe application will be available at:[0m
echo   [92mhttp://localhost:5173[0m
echo.
echo [94mDefault login credentials:[0m
echo   Email:    [93mtest@example.com[0m
echo   Password: [93mpassword123[0m
echo.
echo ================================================================
echo.

REM ============================================================================
REM Ask to start now
REM ============================================================================

set /p "START_NOW=Would you like to start Reconcilia now? (y/N): "
if /i "!START_NOW!"=="y" (
    cd "%APP_DIR%"
    echo.
    call :print_info "Starting Reconcilia..."
    call :print_info "A new window will open with the application"
    call :print_info "Press Ctrl+C in that window to stop the application"
    echo.
    timeout /t 3 >nul
    start cmd /k "title Reconcilia App && start-reconcilia.bat"
    echo.
    call :print_success "Reconcilia is starting in a new window!"
    echo.
    echo This setup window will close in 10 seconds...
    timeout /t 10
) else (
    echo.
    echo You can start Reconcilia anytime by:
    echo   1. Going to the %APP_DIR% folder
    echo   2. Double-clicking start-reconcilia.bat
    echo   3. Or using the desktop shortcut
    echo.
    pause
)
exit /b 0
