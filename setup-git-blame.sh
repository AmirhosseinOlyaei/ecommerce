#!/usr/bin/env bash

# Script to configure Git to properly ignore formatting commits in git blame

echo "Configuring Git to use .git-blame-ignore-revs file..."
git config --local blame.ignoreRevsFile .git-blame-ignore-revs

echo "Configuration complete."
echo ""
echo "To see blame without formatting commits, use: git blame <file>"
echo ""
echo "VS Code with GitLens extension will now respect the ignored formatting commits."
echo ""
echo "=============================================================================="
echo "INSTRUCTIONS FOR THE TEAM:"
echo ""
echo "When making PURE FORMATTING commits (no functional changes):"
echo ""
echo "1. Make your formatting changes"
echo "2. Create a commit with a message that starts with 'style:' or 'format:'"
echo "3. Get the full commit hash using: git rev-parse HEAD"
echo "4. Add the commit hash to .git-blame-ignore-revs file"
echo "5. Push both the formatting commit and the updated .git-blame-ignore-revs file"
echo ""
echo "This will ensure git blame shows the original author of the code,"
echo "not the person who reformatted it."
echo "==============================================================================" 