#!/bin/bash
# PDF Studio — one-command Mac setup
# Usage: bash setup.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "  ┌─────────────────────────────────┐"
echo "  │   PDF Studio — Setup Script     │"
echo "  └─────────────────────────────────┘"
echo ""

# ── Check Python ────────────────────────────────────────────────────────────
if ! command -v python3 &> /dev/null; then
  echo -e "${RED}✗ Python 3 not found. Install from python.org or via Homebrew:${NC}"
  echo "  brew install python"
  exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(sys.version_info.minor)')
if [ "$PYTHON_VERSION" -lt 11 ]; then
  echo -e "${RED}✗ Python 3.11+ required. Found: $(python3 --version)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version | awk '{print $2}')${NC}"

# ── Check/install Homebrew dependencies ─────────────────────────────────────
if ! command -v brew &> /dev/null; then
  echo -e "${YELLOW}⚠ Homebrew not found. Install it from https://brew.sh then re-run this script.${NC}"
  exit 1
fi

for pkg in ghostscript; do
  if brew list "$pkg" &>/dev/null; then
    echo -e "${GREEN}✓ $pkg already installed${NC}"
  else
    echo "Installing $pkg via Homebrew…"
    brew install "$pkg"
    echo -e "${GREEN}✓ $pkg installed${NC}"
  fi
done

# LibreOffice (for Word/PPT → PDF)
if command -v libreoffice &> /dev/null; then
  echo -e "${GREEN}✓ LibreOffice already installed${NC}"
else
  echo -e "${YELLOW}⚠ LibreOffice not found. Word/PPT→PDF features need it.${NC}"
  echo "  Install with: brew install --cask libreoffice"
  echo "  (Skipping — other tools will still work)"
fi

# ── Virtual environment ──────────────────────────────────────────────────────
if [ -d "venv" ]; then
  echo -e "${GREEN}✓ Virtual environment already exists${NC}"
else
  echo "Creating virtual environment…"
  python3 -m venv venv
  echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate

echo "Installing Python dependencies…"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ── Create tmp directory ─────────────────────────────────────────────────────
mkdir -p tmp
echo -e "${GREEN}✓ Temp directory ready${NC}"

echo ""
echo "  ─────────────────────────────────────"
echo -e "  ${GREEN}Setup complete!${NC}"
echo ""
echo "  To start PDF Studio:"
echo "  source venv/bin/activate && python app.py"
echo ""
echo "  Then open: http://localhost:5000"
echo "  ─────────────────────────────────────"
echo ""
