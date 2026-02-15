#!/bin/bash

# 🔐 .env Backup Script
# This script creates an encrypted backup of your .env file

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 .env Backup Script${NC}"
echo "================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

# Create backups directory if it doesn't exist
BACKUP_DIR="$HOME/.env-backups/ts-backend"
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/.env.backup.$TIMESTAMP.gpg"

# Encrypt and backup
echo -e "${YELLOW}📦 Creating encrypted backup...${NC}"
gpg --symmetric --cipher-algo AES256 --output "$BACKUP_FILE" .env

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo -e "${GREEN}📁 Location: $BACKUP_FILE${NC}"
    
    # Show backup size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}📊 Size: $SIZE${NC}"
    
    # List recent backups
    echo ""
    echo -e "${YELLOW}📋 Recent backups:${NC}"
    ls -lht "$BACKUP_DIR" | head -n 6
    
    # Cleanup old backups (keep last 10)
    echo ""
    echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 10)...${NC}"
    ls -t "$BACKUP_DIR"/.env.backup.*.gpg | tail -n +11 | xargs -r rm
    
    echo -e "${GREEN}✅ Done!${NC}"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi
