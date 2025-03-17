# Maintenance Scripts Documentation

This document provides information about the maintenance scripts available in this project, their purpose, and how to use them.

## Overview

The following maintenance scripts are available to help with common tasks:

| Script | Purpose |
|--------|---------|
| `cleanup.sh` | Clean up build artifacts and reinstall dependencies |

## Usage Instructions

### cleanup.sh

**Purpose:** Completely clean your project by removing all build artifacts, caches, and dependencies, then reinstall fresh dependencies.

**When to use:**
- After pulling major changes
- When experiencing unexplained build issues
- To get a fresh start with the codebase
- After upgrading packages that require clean installation

**How to run:**
```bash
./cleanup.sh
```

**What it does:**
1. Removes `node_modules` directory
2. Deletes `pnpm-lock.yaml`
3. Cleans Next.js build cache (`.next` directory)
4. Removes TypeScript build info (`tsconfig.tsbuildinfo`)
5. Cleans Vercel deployment cache (`.vercel` directory)
6. Purges pnpm store cache
7. Removes macOS `.DS_Store` files
8. Reinstalls all dependencies

## Troubleshooting

If you encounter issues with the scripts:

1. **Permission errors:**
   ```bash
   chmod +x script-name.sh
   ```

2. **Script interruptions:**
   - If a script is interrupted, you may need to manually complete some steps
   - Check the script content to see what might not have completed

3. **Package resolution problems:**
   - If dependency issues persist after running the scripts, try:
   ```bash
   pnpm install --force
   ``` 