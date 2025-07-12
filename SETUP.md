# MCP Todo Manager Setup

The MCP Todo Manager has been created and is ready to use! Follow these steps to add it to your MCP configuration:

## Installation Steps

1. The tool is already built and ready at: `/Users/bard/Code/mcp-todo-manager`

2. Add this to your MCP configuration file (usually in your Claude desktop app settings):

```json
{
  "mcpServers": {
    "todo-manager": {
      "command": "node",
      "args": ["/Users/bard/Code/mcp-todo-manager/dist/index.js"],
      "description": "Unified todo list manager"
    }
  }
}
```

3. Restart Claude desktop app to load the new tool

## Available Commands

Once configured, you'll have access to these commands:

- `todo:add` - Add a new task
- `todo:list` - List all tasks or filter by project/status/priority
- `todo:update` - Update an existing task
- `todo:delete` - Delete a task
- `todo:summary` - Get a summary by project
- `todo:help` - Get detailed help

## Migration Complete

I've already migrated your existing tasks:
- ✅ Fix Ollama hanging issue (chaos-theory-ai) - HIGH priority
- ✅ PyAutoGUI continue experiment (collaboration-research) - LOW priority
- ✅ Add help to MCP tools (mcp-tools) - HIGH priority

## Data Location

Your todos are stored in: `~/.mcp-todo-manager/todos.json`

## Why Use This?

Instead of creating scattered todo lists throughout the Brain state system, this gives us:
- A single, consistent interface for all tasks
- Persistent storage outside of conversation context
- Easy filtering and organization by project
- Priority and status tracking
- Timestamped notes for tracking progress

Once you've added it to your MCP config and restarted Claude, I'll be able to use commands like:
```
todo:list {"status": "open", "priority": "high"}
```

This will help us stay organized across all projects!