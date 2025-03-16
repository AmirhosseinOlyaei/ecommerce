# Contributing Guidelines

## Code Style and Formatting

We use Prettier to enforce a consistent code style across the project. The configuration is defined in `.prettierrc`.

Key style rules:

- Single quotes (`'`) instead of double quotes (`"`) for both regular strings and JSX
- No semicolons at the end of statements
- 2 space indentation
- Trailing commas for ES5 compatibility
- 80 character line length limit
- Tailwind CSS classes are automatically sorted (using prettier-plugin-tailwindcss)

## Setting Up Your Development Environment

### Required Tools

- Node.js (see `.nvmrc` for version)
- pnpm (`npm install -g pnpm`)
- VS Code (recommended)

### VS Code Extensions

We recommend installing the following extensions:

- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **GitLens** (eamodio.gitlens)

The project includes a `.vscode/extensions.json` file that will prompt you to install these when you open the project.

### Initial Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run the Git setup script: `./setup-git-blame.sh`
4. Start the development server: `pnpm dev`

## Code Formatting

### Automatic Formatting

VS Code is configured to format files on save. This ensures consistent formatting across the team.

### Manual Formatting

You can also format files manually:

```bash
# Format all files
pnpm format

# Check if files are properly formatted (CI)
pnpm format:check
```

## Git Workflow for Formatting Changes

When making pure formatting changes (with no functional changes), follow these steps to preserve the commit history in git blame:

1. Make your formatting changes
2. Commit them with a message that starts with `style:` or `format:`
   ```bash
   git commit -m "style: format code with prettier"
   ```
3. Get the full commit hash
   ```bash
   git rev-parse HEAD
   ```
4. Add the commit hash to `.git-blame-ignore-revs` file
   ```
   # Formatting changes to ignore in git blame
   abcd1234abcd1234abcd1234abcd1234abcd1234  # Format code with prettier
   ```
5. Commit the updated `.git-blame-ignore-revs` file
   ```bash
   git commit -m "chore: update git-blame-ignore-revs with formatting commit"
   ```
6. Push both commits to the repository

This ensures that git blame will ignore the formatting commit and properly attribute code to the original authors.

## How Git Blame Ignore Works

The `.git-blame-ignore-revs` file contains a list of commit hashes that git should ignore when showing blame information. This is useful for excluding commits that only perform code formatting without changing functionality.

When configured properly (which the `setup-git-blame.sh` script does), git will skip these commits when determining the author of each line of code.

This is especially useful when:

- Using the `git blame` command
- Viewing blame information in VS Code with GitLens
- Understanding the history and purpose of code

## Troubleshooting

If git blame is not ignoring formatting commits:

1. Make sure you've run the `setup-git-blame.sh` script
2. Check that the full commit hash is correctly added to `.git-blame-ignore-revs`
3. Ensure there are no syntax errors in the `.git-blame-ignore-revs` file
4. Try running: `git blame --ignore-revs-file=.git-blame-ignore-revs <file>`
