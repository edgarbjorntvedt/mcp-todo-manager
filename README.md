# MCP Todo Manager

A unified todo list manager implemented as an MCP (Model Context Protocol) tool. This tool provides a consistent interface for managing tasks across all your projects.

## Features

- **Unified task management**: Single source of truth for all your todos
- **Project-based organization**: Group tasks by project
- **Priority levels**: Mark tasks as low, medium, high, or critical
- **Status tracking**: Track tasks through open, in-progress, blocked, done, or cancelled states
- **Tags**: Organize tasks with custom tags
- **Notes**: Add timestamped notes to track progress
- **Flexible filtering**: List tasks by project, status, priority, or tags
- **Comprehensive help**: Built-in help system for all commands

## Installation

```bash
npm install -g mcp-todo-manager
```

Or install locally:

```bash
git clone https://github.com/MikeyBeez/mcp-todo-manager.git
cd mcp-todo-manager
npm install
npm run build
npm link
```

## Usage

The tool provides the following commands:

### Add a Task
```typescript
todo:add {
  "project": "mcp-tools",
  "title": "Add help commands to all tools",
  "description": "Each tool needs a consistent help interface",
  "priority": "high",
  "tags": ["enhancement", "documentation"]
}
```

### List Tasks
```typescript
todo:list {}  // List all tasks
todo:list {"project": "mcp-tools", "status": "open"}
todo:list {"priority": "high", "format": "detailed"}
```

### Update a Task
```typescript
todo:update {
  "id": "task-001",
  "status": "in-progress",
  "addNote": "Started implementation"
}
```

### Delete a Task
```typescript
todo:delete {"id": "task-001"}
```

### Get Summary
```typescript
todo:summary {}  // Summary of all projects
todo:summary {"project": "mcp-tools"}
```

### Get Help
```typescript
todo:help {}  // General help
todo:help {"command": "add"}  // Help for specific command
```

## Data Storage

Tasks are stored in `~/.mcp-todo-manager/todos.json` for persistence across sessions.

## Task Properties

- **id**: Auto-generated unique identifier
- **project**: Project name (required)
- **title**: Brief task description (required)
- **description**: Detailed description
- **priority**: low, medium, high, or critical
- **status**: open, in-progress, blocked, done, or cancelled
- **created**: Timestamp when task was created
- **updated**: Timestamp of last update
- **due**: Optional due date
- **tags**: Array of tags for categorization
- **assignee**: Person responsible for the task
- **notes**: Array of timestamped notes

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT