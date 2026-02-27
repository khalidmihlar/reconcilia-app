@echo off
REM ============================================================================
REM Reconcilia App - Automated Setup Script for Windows
REM This script will install all dependencies and launch the application
REM ============================================================================

setlocal enabledelayedexpansion

REM Colors (using PowerShell for colored output)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

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
echo [92m[+] %~1[0m
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
    pause
)

REM ============================================================================
REM Check for Chocolatey
REM ============================================================================

call :print_header "Checking Chocolatey Installation"

where choco >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "Chocolatey is already installed"
    choco --version
) else (
    call :print_warning "Chocolatey not found. Installing..."
    call :print_info "This will open a new window. Please wait..."
    
    REM Install Chocolatey
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    if %errorLevel% == 0 (
        call :print_success "Chocolatey installed successfully"
        REM Refresh environment variables
        call refreshenv
    ) else (
        call :print_error "Failed to install Chocolatey"
        call :print_info "Please install manually from: https://chocolatey.org/install"
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
    git --version
) else (
    call :print_warning "Git not found. Installing..."
    choco install git -y
    if %errorLevel% == 0 (
        call :print_success "Git installed successfully"
        call refreshenv
    ) else (
        call :print_error "Failed to install Git"
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
    node --version
    
    REM Check version
    for /f "tokens=1,2 delims=v." %%a in ('node --version') do (
        set NODE_MAJOR=%%b
    )
    
    if !NODE_MAJOR! GEQ %REQUIRED_NODE_VERSION% (
        call :print_success "Node.js version is sufficient (^>= v%REQUIRED_NODE_VERSION%)"
    ) else (
        call :print_warning "Node.js version is too old. Upgrading..."
        choco upgrade nodejs -y
        call refreshenv
    )
) else (
    call :print_warning "Node.js not found. Installing..."
    choco install nodejs -y
    if %errorLevel% == 0 (
        call :print_success "Node.js installed successfully"
        call refreshenv
    ) else (
        call :print_error "Failed to install Node.js"
        pause
        exit /b 1
    )
)

REM Verify npm
where npm >nul 2>&1
if %errorLevel% == 0 (
    call :print_success "npm is available"
    npm --version
) else (
    call :print_error "npm installation failed"
    pause
    exit /b 1
)

REM ============================================================================
REM Clone Repository
REM ============================================================================

call :print_header "Setting Up Application"

if exist "%APP_DIR%" (
    call :print_warning "Directory '%APP_DIR%' already exists"
    set /p "DELETE=Do you want to delete it and re-clone? (y/N): "
    if /i "!DELETE!"=="y" (
        call :print_info "Removing existing directory..."
        rmdir /s /q "%APP_DIR%"
        call :print_info "Cloning repository..."
        git clone "%REPO_URL%"
        if %errorLevel% == 0 (
            call :print_success "Repository cloned successfully"
        ) else (
            call :print_error "Failed to clone repository"
            pause
            exit /b 1
        )
    ) else (
        call :print_info "Using existing directory"
    )
) else (
    call :print_info "Cloning repository..."
    git clone "%REPO_URL%"
    if %errorLevel% == 0 (
        call :print_success "Repository cloned successfully"
    ) else (
        call :print_error "Failed to clone repository"
        call :print_info "Make sure the repository is accessible"
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
    set /p "REINSTALL=Do you want to reinstall? (y/N): "
    if /i "!REINSTALL!"=="y" (
        call :print_info "Removing existing node_modules..."
        rmdir /s /q node_modules
        if exist "package-lock.json" del package-lock.json
        call :print_info "Installing dependencies (this may take a few minutes)..."
        call npm install
        if %errorLevel% == 0 (
            call :print_success "Dependencies installed successfully"
        ) else (
            call :print_error "Failed to install dependencies"
            cd ..
            pause
            exit /b 1
        )
    ) else (
        call :print_info "Skipping dependency installation"
    )
) else (
    call :print_info "Installing dependencies (this may take a few minutes)..."
    call npm install
    if %errorLevel% == 0 (
        call :print_success "Dependencies installed successfully"
    ) else (
        call :print_error "Failed to install dependencies"
        cd ..
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
    set /p "RESET_DB=Do you want to reset the database? (y/N): "
    if /i "!RESET_DB!"=="y" (
        call :print_warning "Removing existing database..."
        del database\reconcila.db
        call :print_info "Database will be created on first run"
    )
) else (
    call :print_info "Database will be created automatically on first run"
)

REM Ensure database directory exists
if not exist "database\" mkdir database

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

cd ..

REM ============================================================================
REM Create Desktop Shortcut
REM ============================================================================

call :print_header "Desktop Shortcut"

set /p "CREATE_SHORTCUT=Do you want to create a desktop shortcut? (y/N): "
if /i "!CREATE_SHORTCUT!"=="y" (
    cd "%APP_DIR%"
    
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
    
    call :print_success "Desktop shortcut created: Reconcilia.lnk"
    call :print_info "You can double-click it to start the application"
    
    cd ..
)

REM ============================================================================
REM Final Instructions
REM ============================================================================

call :print_header "Setup Complete!"

echo.
echo [92mReconcilia has been successfully installed![0m
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
    call :print_info "Starting Reconcilia..."
    call :print_info "Press Ctrl+C to stop the application"
    timeout /t 2 >nul
    call start-reconcilia.bat
) else (
    echo.
    echo You can start Reconcilia anytime by running:
    echo   cd %APP_DIR%
    echo   start-reconcilia.bat
    echo.
    pause
)

exit /b 0