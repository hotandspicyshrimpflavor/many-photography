# Using Claude 3.5 Sonnet as Your Coding Agent

This guide shows how to use Claude 3.5 Sonnet (via the Anthropic API) as your coding agent for Many's Photography.

---

## Why Use a Coding Agent?

A coding agent like Claude Code can:
- Generate entire components, pages, and API routes
- Review code for security vulnerabilities
- Refactor and optimize existing code
- Debug complex issues
- Generate test cases
- Document your codebase

---

## Option 1: Claude Code (Recommended)

Claude Code is Anthropic's official CLI tool for coding tasks.

### Installation

```bash
npm install -g @anthropic-ai/claude-code
```

### Authentication

```bash
claude-code --auth
```

This will open a browser window for you to log in with your Anthropic account.

### Usage

```bash
# Navigate to the project
cd /path/to/many-photography

# Start a coding session
claude-code

# Or run a one-shot command
claude-code "add a dark mode toggle to the navigation"
claude-code "write a new API route for generating client tokens"
claude-code "review the codebase for security vulnerabilities"
```

### Useful Commands in Claude Code

| Command | Description |
|---------|-------------|
| `/exit` | Exit Claude Code |
| `/clear` | Clear conversation history |
| `/web` | Enable web search |
| `/browse` | Browse a URL |
| `ls` | List files |
| `cat file` | View file contents |
| `write file` | Write/edit files |

### Examples

```bash
# Generate a new page
claude-code "create a new page at /portfolio/wedding with masonry gallery"

# Add a new API endpoint
claude-code "write an API route for /api/galleries that handles CRUD operations"

# Security audit
claude-code "review the token authentication system for security issues"

# Write tests
claude-code "write unit tests for the watermark pipeline"
```

---

## Option 2: Continue Dev (VS Code Extension)

[Continue](https://continue.dev) is a VS Code extension that brings Claude to your IDE.

### Installation

1. Open VS Code
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Continue"
4. Install

### Configuration

Add to your `~/.continue/config.py`:

```python
from continuedev.src.continuedev.models import (
    Model,
    Models,
    ClaudeModel,
)

def modify_config(config):
    config.models = Models(
        default=ClaudeModel(
            model="claude-3-5-sonnet-latest",
            api_key=os.environ.get("ANTHROPIC_API_KEY"),
        )
    )
    return config
```

### Usage

- Cmd/Ctrl + L opens the chat
- Select code and Cmd/Ctrl + L to chat about selected code
- Inline autocomplete as you type

---

## Option 3: Continue in Cursor (Alternative)

If you use Cursor IDE, it already includes Claude integration. Configure it to use your API key:

1. Settings → Models → Add Anthropic
2. Enter your API key
3. Select Claude 3.5 Sonnet as default

---

## Option 4: API Direct (For Custom Tools)

### Python Example

```python
import anthropic

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

message = client.messages.create(
    model="claude-3-5-sonnet-latest",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Write a Next.js API route for handling client token generation"
        }
    ]
)

print(message.content)
```

### Node.js Example

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-latest',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'Write a Prisma schema for a photography client management system'
  }]
});

console.log(message.content);
```

---

## Prompt Templates for Many's Photography

### Generate New Feature
```
Write a Next.js 14 page component for [FEATURE_NAME]. It should:
- Use our design system (Playfair Display font, gold #C9A84C primary color)
- Be fully responsive
- Include TypeScript types
- Follow our component patterns in /src/components
- Be placed at /src/app/[FEATURE_PATH]
```

### Security Review
```
Review the [FILE_OR_COMPONENT] for security vulnerabilities. Check for:
- SQL injection
- XSS attacks
- CSRF
- Authentication bypass
- Sensitive data exposure
- Rate limiting issues
```

### Code Refactor
```
Refactor [FILE] to:
- Improve performance
- Add proper error handling
- Use TypeScript best practices
- Match our codebase conventions
- Add JSDoc comments
```

### Test Generation
```
Generate unit tests for [FILE_OR_FUNCTION] using:
- Jest for testing framework
- React Testing Library for React components
- Follow our existing test patterns
```

---

## Cost Optimization

Claude 3.5 Sonnet pricing (as of 2024):

| Input | Output |
|-------|--------|
| $3 / 1M tokens | $15 / 1M tokens |

### Tips

1. **Use MiniMax for chat** — Save Claude for complex coding tasks
2. **Clear context** — Start fresh sessions for unrelated tasks
3. **Be specific** — Detailed prompts = fewer wasted tokens
4. **Use Sonnet not Opus** — Sonnet is 5x cheaper for most tasks
5. **Cache common patterns** — Store reusable code snippets

---

## API Key Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys
3. Create new key
4. Add credits if needed (required for API access)

Set in your environment:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Or add to your project's `.env` file (already done in this project).

---

*Last updated: 2026-04-14*
