#!/bin/bash

################################################################################
# Reconcilia App - Automated Setup Script for macOS
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
REPO_URL="git@github.com:khalidmihlar/reconcilia-app.git"
APP_DIR="reconcilia-app"
REQUIRED_NODE_VERSION="18"

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
# Install Homebrew
################################################################################

install_homebrew() {
    print_header "Checking Homebrew Installation"
    
    if command_exists brew; then
        print_success "Homebrew is already installed"
        brew --version
    else
        print_warning "Homebrew not found. Installing..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        
        print_success "Homebrew installed successfully"
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
            brew upgrade node
        fi
    else
        print_warning "Node.js not found. Installing..."
        brew install node
        print_success "Node.js installed successfully"
    fi
    
    # Verify npm is available
    if command_exists npm; then
        print_success "npm version $(npm -v) is available"
    else
        print_error "npm installation failed"
        exit 1
    fi
}

################################################################################
# Install Git
################################################################################

install_git() {
    print_header "Checking Git Installation"
    
    if command_exists git; then
        print_success "Git is already installed (version $(git --version))"
    else
        print_warning "Git not found. Installing..."
        brew install git
        print_success "Git installed successfully"
    fi
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
            print_info "Make sure you have SSH access to the repository"
            print_info "You may need to set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
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
            print_info "Installing dependencies..."
            npm install
            print_success "Dependencies installed successfully"
        else
            print_info "Skipping dependency installation"
        fi
    else
        print_info "Installing dependencies (this may take a few minutes)..."
        npm install
        print_success "Dependencies installed successfully"
    fi
    
    cd ..
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

# Start the application
npm run dev

EOF
    
    chmod +x start-reconcilia.sh
    
    print_success "Launch script created: start-reconcilia.sh"
    
    cd ..
}

################################################################################
# Create Desktop Shortcut (Optional)
################################################################################

create_desktop_shortcut() {
    print_header "Desktop Shortcut"
    
    read -p "Do you want to create a desktop shortcut? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        DESKTOP_PATH="$HOME/Desktop"
        SHORTCUT_PATH="$DESKTOP_PATH/Reconcilia.command"
        APP_PATH="$(pwd)/$APP_DIR"
        
        cat > "$SHORTCUT_PATH" << EOF
#!/bin/bash
cd "$APP_PATH"
./start-reconcilia.sh
EOF
        
        chmod +x "$SHORTCUT_PATH"
        print_success "Desktop shortcut created: Reconcilia.command"
        print_info "You can double-click it to start the application"
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
    
    if [ -f "$HOME/Desktop/Reconcilia.command" ]; then
        echo "  Option 3: Double-click the desktop shortcut"
        echo -e "    ${YELLOW}Reconcilia.command${NC}"
        echo ""
    fi
    
    echo -e "${BLUE}The application will be available at:${NC}"
    echo -e "  ${GREEN}http://localhost:5173${NC}"
    echo ""
    echo -e "${BLUE}Default login credentials:${NC}"
    echo -e "  Email:    ${YELLOW}test@example.com${NC}"
    echo -e "  Password: ${YELLOW}password123${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    
    print_header "🏥 Reconcilia App - Automated Setup 🏥"
    
    echo "This script will:"
    echo "  1. Install required dependencies (Homebrew, Node.js, Git)"
    echo "  2. Clone the Reconcilia repository"
    echo "  3. Install application dependencies"
    echo "  4. Set up the database"
    echo "  5. Create launch scripts"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Install system dependencies
    install_homebrew
    install_git
    install_node
    
    # Setup application
    clone_repository
    install_dependencies
    setup_database
    
    # Create convenience scripts
    create_launch_script
    create_desktop_shortcut
    
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