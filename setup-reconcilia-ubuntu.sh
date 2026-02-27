#!/bin/bash

################################################################################
# Reconcilia App - Automated Setup Script for Ubuntu/WSL
# This script will install all dependencies and launch the application
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/khalidmihlar/reconcilia-app.git"
APP_DIR="reconcilia-app"
REQUIRED_NODE_VERSION="20"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

################################################################################
# Check if command exists
################################################################################

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

################################################################################
# Detect if running in WSL
################################################################################

detect_wsl() {
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
        return 0  # Is WSL
    else
        return 1  # Not WSL
    fi
}

################################################################################
# Update package lists
################################################################################

update_package_lists() {
    print_header "Updating Package Lists"
    
    print_info "Updating apt package lists..."
    sudo apt-get update -qq
    print_success "Package lists updated"
}

################################################################################
# Install Git
################################################################################

install_git() {
    print_header "Checking Git Installation"
    
    if command_exists git; then
        print_success "Git is already installed"
        git --version
    else
        print_warning "Git not found. Installing..."
        sudo apt-get install -y git
        print_success "Git installed successfully"
    fi
}

################################################################################
# Install Build Tools
################################################################################

install_build_tools() {
    print_header "Installing Build Tools"
    
    print_info "Some npm packages require compilation tools..."
    
    # Check if build-essential is installed
    if dpkg -l | grep -q build-essential; then
        print_success "Build tools already installed"
    else
        print_info "Installing build-essential (required for native modules)..."
        sudo apt-get install -y build-essential
        print_success "Build tools installed"
    fi
    
    # Install python3 if needed (required by node-gyp)
    if command_exists python3; then
        print_success "Python3 is available"
    else
        print_info "Installing python3 (required by node-gyp)..."
        sudo apt-get install -y python3
        print_success "Python3 installed"
    fi
}

################################################################################
# Install Node.js
################################################################################

install_node() {
    print_header "Checking Node.js Installation"
    
    if command_exists node; then
        CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        print_info "Node.js version $(node -v) is installed"
        
        if [ "$CURRENT_NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
            print_success "Node.js version is sufficient (>= v${REQUIRED_NODE_VERSION})"
        else
            print_warning "Node.js version is too old. Upgrading..."
            install_node_fresh
        fi
    else
        print_warning "Node.js not found. Installing..."
        install_node_fresh
    fi
    
    # Verify npm is available
    if command_exists npm; then
        print_success "npm version $(npm -v) is available"
    else
        print_error "npm installation failed"
        exit 1
    fi
}

install_node_fresh() {
    print_info "Installing Node.js v${REQUIRED_NODE_VERSION}.x from NodeSource..."
    
    # Install curl if needed
    if ! command_exists curl; then
        print_info "Installing curl..."
        sudo apt-get install -y curl
    fi
    
    # Add NodeSource repository
    print_info "Adding NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_VERSION}.x | sudo -E bash -
    
    # Install Node.js
    print_info "Installing Node.js..."
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
}

################################################################################
# Clone Repository
################################################################################

clone_repository() {
    print_header "Setting Up Application"
    
    if [ -d "$APP_DIR" ]; then
        print_warning "Directory '$APP_DIR' already exists"
        read -p "Do you want to delete it and re-clone? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Removing existing directory..."
            rm -rf "$APP_DIR"
            print_info "Cloning repository..."
            git clone "$REPO_URL"
            print_success "Repository cloned successfully"
        else
            print_info "Using existing directory"
        fi
    else
        print_info "Cloning repository..."
        if git clone "$REPO_URL"; then
            print_success "Repository cloned successfully"
        else
            print_error "Failed to clone repository"
            print_info "Make sure you have internet access and the repository is accessible"
            exit 1
        fi
    fi
}

################################################################################
# Install Dependencies
################################################################################

install_dependencies() {
    print_header "Installing Application Dependencies"
    
    cd "$APP_DIR"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_warning "Dependencies already installed"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Removing existing node_modules..."
            rm -rf node_modules package-lock.json
            install_npm_packages
        else
            print_info "Skipping dependency installation"
        fi
    else
        install_npm_packages
    fi
    
    cd ..
}

install_npm_packages() {
    print_info "Installing dependencies (this may take a few minutes)..."
    echo ""
    print_info "Note: Some warnings are normal and can be ignored"
    echo ""
    
    # Clean npm cache first
    npm cache clean --force
    
    # Install dependencies with proper flags
    if npm install --legacy-peer-deps; then
        print_success "Dependencies installed successfully"
        echo ""
        
        # Rebuild native modules (better-sqlite3, rolldown)
        print_info "Rebuilding native modules for your system..."
        
        if npm rebuild better-sqlite3 --build-from-source; then
            print_success "better-sqlite3 rebuilt successfully"
        else
            print_warning "better-sqlite3 rebuild had issues, trying alternative..."
            npm install better-sqlite3 --build-from-source --legacy-peer-deps
        fi
        
        # Give rolldown a chance to rebuild if needed
        npm rebuild 2>/dev/null || true
        
        print_success "Native modules ready"
    else
        print_error "Failed to install dependencies"
        print_info "Trying alternative installation method..."
        
        # Try with ignore-scripts first, then rebuild
        if npm install --legacy-peer-deps --ignore-scripts; then
            print_info "Packages installed, now building native modules..."
            npm rebuild better-sqlite3 --build-from-source
            npm rebuild
            print_success "Installation complete with rebuild"
        else
            print_error "Installation failed"
            print_info "Try manually with: npm install --legacy-peer-deps --force"
            exit 1
        fi
    fi
}

################################################################################
# Setup Database
################################################################################

setup_database() {
    print_header "Setting Up Database"
    
    cd "$APP_DIR"
    
    # Check if database exists
    if [ -f "database/reconcila.db" ]; then
        print_success "Database already exists"
        read -p "Do you want to reset the database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Removing existing database..."
            rm -f database/reconcila.db
            print_info "Database will be created on first run"
        fi
    else
        print_info "Database will be created automatically on first run"
    fi
    
    # Ensure database directory exists
    mkdir -p database
    
    cd ..
}

################################################################################
# Create Launch Script
################################################################################

create_launch_script() {
    print_header "Creating Launch Script"
    
    cd "$APP_DIR"
    
    cat > start-reconcilia.sh << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║                                       ║"
echo "║        🏥  RECONCILIA APP  🏥        ║"
echo "║                                       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}Starting application...${NC}"
echo ""
echo -e "${YELLOW}The app will be available at:${NC}"
echo -e "${GREEN}  http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"
echo ""

# Start the application
npm run dev

EOF
    
    chmod +x start-reconcilia.sh
    
    print_success "Launch script created: start-reconcilia.sh"
    
    cd ..
}

################################################################################
# WSL-Specific Instructions
################################################################################

show_wsl_instructions() {
    if detect_wsl; then
        print_header "WSL-Specific Information"
        
        print_info "You are running on Windows Subsystem for Linux (WSL)"
        echo ""
        echo "To access the app from Windows:"
        echo "  1. The app will run at: http://localhost:5173"
        echo "  2. Open your Windows browser (Chrome, Edge, Firefox)"
        echo "  3. Navigate to: http://localhost:5173"
        echo ""
        echo "WSL Tips:"
        echo "  • Your Windows files are at: /mnt/c/Users/YourName/"
        echo "  • This Linux filesystem is at: \\\\wsl\$\\Ubuntu\\home\\$USER\\"
        echo "  • The app will work the same as on native Linux"
        echo ""
    fi
}

################################################################################
# Final Instructions
################################################################################

show_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}Reconcilia has been successfully installed!${NC}"
    echo ""
    echo -e "${BLUE}To start the application:${NC}"
    echo ""
    echo "  Option 1: Use the launch script"
    echo -e "    ${YELLOW}cd $APP_DIR${NC}"
    echo -e "    ${YELLOW}./start-reconcilia.sh${NC}"
    echo ""
    echo "  Option 2: Use npm directly"
    echo -e "    ${YELLOW}cd $APP_DIR${NC}"
    echo -e "    ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${BLUE}The application will be available at:${NC}"
    echo -e "  ${GREEN}http://localhost:5173${NC}"
    echo ""
    echo -e "${BLUE}Default login credentials:${NC}"
    echo -e "  Email:    ${YELLOW}test@example.com${NC}"
    echo -e "  Password: ${YELLOW}password123${NC}"
    echo ""
    
    if detect_wsl; then
        echo -e "${BLUE}WSL Note:${NC}"
        echo "  Open your Windows browser and go to http://localhost:5173"
        echo ""
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    
    print_header "🏥 Reconcilia App - Automated Setup for Ubuntu/WSL 🏥"
    
    # Detect WSL
    if detect_wsl; then
        print_info "Detected: Windows Subsystem for Linux (WSL)"
    else
        print_info "Detected: Native Ubuntu/Linux"
    fi
    
    echo ""
    echo "This script will:"
    echo "  1. Update package lists"
    echo "  2. Install Git (if needed)"
    echo "  3. Install build tools (gcc, g++, make, python3)"
    echo "  4. Install Node.js v${REQUIRED_NODE_VERSION}+ (if needed)"
    echo "  5. Clone the Reconcilia repository"
    echo "  6. Install application dependencies"
    echo "  7. Rebuild native modules (better-sqlite3, rolldown)"
    echo "  8. Set up the database"
    echo "  9. Create launch scripts"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Install system dependencies
    update_package_lists
    install_git
    install_build_tools
    install_node
    
    # Setup application
    clone_repository
    install_dependencies
    setup_database
    
    # Create convenience scripts
    create_launch_script
    
    # Show WSL-specific info if applicable
    show_wsl_instructions
    
    # Show final instructions
    show_instructions
    
    # Ask if they want to start now
    echo ""
    read -p "Would you like to start Reconcilia now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$APP_DIR"
        print_info "Starting Reconcilia..."
        print_info "Press Ctrl+C to stop the application"
        sleep 2
        ./start-reconcilia.sh
    fi
}

# Run main function
main
