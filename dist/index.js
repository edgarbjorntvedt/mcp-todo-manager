#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os_1 = require("os");
// Define the data directory for storing todos
const DATA_DIR = path.join((0, os_1.homedir)(), ".mcp-todo-manager");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");
// Task schema
const TaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    project: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["low", "medium", "high", "critical"]),
    status: zod_1.z.enum(["open", "in-progress", "blocked", "done", "cancelled"]),
    created: zod_1.z.string(),
    updated: zod_1.z.string(),
    due: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    assignee: zod_1.z.string().optional(),
    notes: zod_1.z.array(zod_1.z.object({
        timestamp: zod_1.z.string(),
        content: zod_1.z.string()
    })).optional()
});
// Todo list schema
const TodoListSchema = zod_1.z.object({
    tasks: zod_1.z.array(TaskSchema),
    nextId: zod_1.z.number()
});
// Initialize data directory
async function initDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(TODOS_FILE);
        }
        catch {
            const initialData = { tasks: [], nextId: 1 };
            await fs.writeFile(TODOS_FILE, JSON.stringify(initialData, null, 2));
        }
    }
    catch (error) {
        console.error("Failed to initialize data directory:", error);
    }
}
// Load todos from file
async function loadTodos() {
    try {
        const data = await fs.readFile(TODOS_FILE, "utf-8");
        return TodoListSchema.parse(JSON.parse(data));
    }
    catch (error) {
        console.error("Failed to load todos:", error);
        return { tasks: [], nextId: 1 };
    }
}
// Save todos to file
async function saveTodos(todos) {
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
}
// Tool definitions
const TOOLS = {
    "todo:add": {
        description: "Add a new task to the todo list",
        inputSchema: {
            type: "object",
            properties: {
                project: { type: "string", description: "Project this task belongs to" },
                title: { type: "string", description: "Task title" },
                description: { type: "string", description: "Detailed task description" },
                priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    default: "medium",
                    description: "Task priority"
                },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags for categorization"
                },
                due: { type: "string", description: "Due date (ISO format)" },
                assignee: { type: "string", description: "Person assigned to this task" }
            },
            required: ["project", "title"]
        }
    },
    "todo:list": {
        description: "List all tasks or filter by project, status, priority, or tags",
        inputSchema: {
            type: "object",
            properties: {
                project: { type: "string", description: "Filter by project" },
                status: {
                    type: "string",
                    enum: ["open", "in-progress", "blocked", "done", "cancelled"],
                    description: "Filter by status"
                },
                priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Filter by priority"
                },
                tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Filter by tags (any match)"
                },
                format: {
                    type: "string",
                    enum: ["table", "detailed", "summary"],
                    default: "table",
                    description: "Output format"
                }
            }
        }
    },
    "todo:update": {
        description: "Update an existing task",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "Task ID to update" },
                title: { type: "string", description: "New title" },
                description: { type: "string", description: "New description" },
                priority: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "New priority"
                },
                status: {
                    type: "string",
                    enum: ["open", "in-progress", "blocked", "done", "cancelled"],
                    description: "New status"
                },
                due: { type: "string", description: "New due date (ISO format)" },
                assignee: { type: "string", description: "New assignee" },
                addTags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags to add"
                },
                removeTags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags to remove"
                },
                addNote: { type: "string", description: "Add a note to the task" }
            },
            required: ["id"]
        }
    },
    "todo:delete": {
        description: "Delete a task",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "Task ID to delete" }
            },
            required: ["id"]
        }
    },
    "todo:summary": {
        description: "Get a summary of tasks by project and status",
        inputSchema: {
            type: "object",
            properties: {
                project: { type: "string", description: "Filter by specific project" }
            }
        }
    },
    "todo:help": {
        description: "Get help on using the todo manager",
        inputSchema: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    enum: ["add", "list", "update", "delete", "summary", "all"],
                    description: "Specific command to get help for"
                }
            }
        }
    }
};
// Main server implementation
async function main() {
    await initDataDir();
    const server = new index_js_1.Server({
        name: "mcp-todo-manager",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Handle tool listing
    server.setRequestHandler(types_js_1.ListToolsResultSchema, async () => {
        return {
            tools: Object.entries(TOOLS).map(([name, schema]) => ({
                name,
                description: schema.description,
                inputSchema: schema.inputSchema,
            })),
        };
    });
    // Handle tool calls
    server.setRequestHandler(types_js_1.CallToolResultSchema, async (request) => {
        const { name, arguments: args } = request.params;
        if (!TOOLS[name]) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        try {
            switch (name) {
                case "todo:add": {
                    const todos = await loadTodos();
                    const newTask = {
                        id: `task-${todos.nextId.toString().padStart(3, '0')}`,
                        project: args.project,
                        title: args.title,
                        description: args.description,
                        priority: args.priority || "medium",
                        status: "open",
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                        due: args.due,
                        tags: args.tags || [],
                        assignee: args.assignee,
                        notes: []
                    };
                    todos.tasks.push(newTask);
                    todos.nextId++;
                    await saveTodos(todos);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ Task added: ${newTask.id}\nProject: ${newTask.project}\nTitle: ${newTask.title}\nPriority: ${newTask.priority}`,
                            },
                        ],
                    };
                }
                case "todo:list": {
                    const todos = await loadTodos();
                    let filtered = todos.tasks;
                    // Apply filters
                    if (args.project) {
                        filtered = filtered.filter(t => t.project === args.project);
                    }
                    if (args.status) {
                        filtered = filtered.filter(t => t.status === args.status);
                    }
                    if (args.priority) {
                        filtered = filtered.filter(t => t.priority === args.priority);
                    }
                    if (args.tags && args.tags.length > 0) {
                        filtered = filtered.filter(t => t.tags && args.tags.some((tag) => t.tags.includes(tag)));
                    }
                    // Sort by priority and creation date
                    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    filtered.sort((a, b) => {
                        const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                        if (prioDiff !== 0)
                            return prioDiff;
                        return new Date(b.created).getTime() - new Date(a.created).getTime();
                    });
                    // Format output
                    let output = "";
                    if (args.format === "summary") {
                        output = `📋 Found ${filtered.length} tasks\n`;
                        const byStatus = filtered.reduce((acc, t) => {
                            acc[t.status] = (acc[t.status] || 0) + 1;
                            return acc;
                        }, {});
                        for (const [status, count] of Object.entries(byStatus)) {
                            output += `  ${status}: ${count}\n`;
                        }
                    }
                    else if (args.format === "detailed") {
                        output = filtered.map(t => {
                            let taskStr = `\n📌 ${t.id} - ${t.title}\n`;
                            taskStr += `   Project: ${t.project} | Priority: ${t.priority} | Status: ${t.status}\n`;
                            if (t.description)
                                taskStr += `   Description: ${t.description}\n`;
                            if (t.due)
                                taskStr += `   Due: ${new Date(t.due).toLocaleDateString()}\n`;
                            if (t.tags && t.tags.length > 0)
                                taskStr += `   Tags: ${t.tags.join(", ")}\n`;
                            if (t.assignee)
                                taskStr += `   Assignee: ${t.assignee}\n`;
                            if (t.notes && t.notes.length > 0) {
                                taskStr += `   Notes:\n`;
                                t.notes.forEach(n => {
                                    taskStr += `     - ${new Date(n.timestamp).toLocaleDateString()}: ${n.content}\n`;
                                });
                            }
                            return taskStr;
                        }).join("\n");
                    }
                    else { // table format
                        if (filtered.length === 0) {
                            output = "No tasks found matching the criteria.";
                        }
                        else {
                            output = "ID      | Project          | Title                                | Priority | Status\n";
                            output += "--------|------------------|--------------------------------------|----------|------------\n";
                            filtered.forEach(t => {
                                const proj = t.project.padEnd(16).substring(0, 16);
                                const title = t.title.padEnd(36).substring(0, 36);
                                const prio = t.priority.padEnd(8);
                                output += `${t.id} | ${proj} | ${title} | ${prio} | ${t.status}\n`;
                            });
                        }
                    }
                    return {
                        content: [{ type: "text", text: output }],
                    };
                }
                case "todo:update": {
                    const todos = await loadTodos();
                    const taskIndex = todos.tasks.findIndex(t => t.id === args.id);
                    if (taskIndex === -1) {
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Task not found: ${args.id}`);
                    }
                    const task = todos.tasks[taskIndex];
                    // Update fields
                    if (args.title !== undefined)
                        task.title = args.title;
                    if (args.description !== undefined)
                        task.description = args.description;
                    if (args.priority !== undefined)
                        task.priority = args.priority;
                    if (args.status !== undefined)
                        task.status = args.status;
                    if (args.due !== undefined)
                        task.due = args.due;
                    if (args.assignee !== undefined)
                        task.assignee = args.assignee;
                    // Handle tags
                    if (args.addTags) {
                        task.tags = [...new Set([...(task.tags || []), ...args.addTags])];
                    }
                    if (args.removeTags) {
                        task.tags = (task.tags || []).filter(t => !args.removeTags.includes(t));
                    }
                    // Add note
                    if (args.addNote) {
                        if (!task.notes)
                            task.notes = [];
                        task.notes.push({
                            timestamp: new Date().toISOString(),
                            content: args.addNote
                        });
                    }
                    task.updated = new Date().toISOString();
                    await saveTodos(todos);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ Task ${task.id} updated successfully`,
                            },
                        ],
                    };
                }
                case "todo:delete": {
                    const todos = await loadTodos();
                    const taskIndex = todos.tasks.findIndex(t => t.id === args.id);
                    if (taskIndex === -1) {
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Task not found: ${args.id}`);
                    }
                    const [deleted] = todos.tasks.splice(taskIndex, 1);
                    await saveTodos(todos);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `🗑️ Deleted task: ${deleted.id} - ${deleted.title}`,
                            },
                        ],
                    };
                }
                case "todo:summary": {
                    const todos = await loadTodos();
                    let tasks = todos.tasks;
                    if (args.project) {
                        tasks = tasks.filter(t => t.project === args.project);
                    }
                    // Group by project
                    const byProject = tasks.reduce((acc, t) => {
                        if (!acc[t.project])
                            acc[t.project] = [];
                        acc[t.project].push(t);
                        return acc;
                    }, {});
                    let output = "📊 Todo Summary\n";
                    output += "================\n\n";
                    for (const [project, projectTasks] of Object.entries(byProject)) {
                        output += `📁 ${project}\n`;
                        // Count by status
                        const statusCounts = projectTasks.reduce((acc, t) => {
                            acc[t.status] = (acc[t.status] || 0) + 1;
                            return acc;
                        }, {});
                        // Count by priority
                        const priorityCounts = projectTasks.reduce((acc, t) => {
                            acc[t.priority] = (acc[t.priority] || 0) + 1;
                            return acc;
                        }, {});
                        output += `   Total: ${projectTasks.length} tasks\n`;
                        output += `   Status: `;
                        output += Object.entries(statusCounts)
                            .map(([s, c]) => `${s} (${c})`)
                            .join(", ");
                        output += `\n   Priority: `;
                        output += Object.entries(priorityCounts)
                            .map(([p, c]) => `${p} (${c})`)
                            .join(", ");
                        // Show critical/high priority open tasks
                        const urgent = projectTasks.filter(t => t.status === "open" && (t.priority === "critical" || t.priority === "high"));
                        if (urgent.length > 0) {
                            output += `\n   ⚠️  Urgent tasks:\n`;
                            urgent.forEach(t => {
                                output += `      - ${t.id}: ${t.title} (${t.priority})\n`;
                            });
                        }
                        output += "\n";
                    }
                    return {
                        content: [{ type: "text", text: output }],
                    };
                }
                case "todo:help": {
                    let helpText = "";
                    if (!args.command || args.command === "all") {
                        helpText = `🔧 MCP Todo Manager Help
=======================

Available commands:

📝 todo:add - Add a new task
   Required: project, title
   Optional: description, priority, tags, due, assignee

📋 todo:list - List tasks with filters
   Optional: project, status, priority, tags, format

✏️  todo:update - Update an existing task
   Required: id
   Optional: title, description, priority, status, due, assignee, addTags, removeTags, addNote

🗑️  todo:delete - Delete a task
   Required: id

📊 todo:summary - Get task summary by project
   Optional: project

❓ todo:help - Show this help
   Optional: command (specific command to get help for)

Use 'todo:help' with a specific command for detailed information.`;
                    }
                    else {
                        switch (args.command) {
                            case "add":
                                helpText = `📝 todo:add - Add a new task

Parameters:
- project (required): Project name this task belongs to
- title (required): Brief task title
- description: Detailed description of the task
- priority: Task priority (low, medium, high, critical) - defaults to 'medium'
- tags: Array of tags for categorization
- due: Due date in ISO format (e.g., "2025-12-31")
- assignee: Person responsible for this task

Example:
todo:add {
  "project": "mcp-tools",
  "title": "Add help commands to all tools",
  "description": "Each tool needs a consistent help interface",
  "priority": "high",
  "tags": ["enhancement", "documentation"]
}`;
                                break;
                            case "list":
                                helpText = `📋 todo:list - List tasks with filters

Parameters (all optional):
- project: Filter by specific project
- status: Filter by status (open, in-progress, blocked, done, cancelled)
- priority: Filter by priority (low, medium, high, critical)
- tags: Filter by tags (matches any of the provided tags)
- format: Output format (table, detailed, summary) - defaults to 'table'

Examples:
todo:list {}  // List all tasks in table format
todo:list {"project": "mcp-tools", "status": "open"}
todo:list {"priority": "high", "format": "detailed"}`;
                                break;
                            case "update":
                                helpText = `✏️  todo:update - Update an existing task

Parameters:
- id (required): Task ID to update
- title: New title
- description: New description
- priority: New priority (low, medium, high, critical)
- status: New status (open, in-progress, blocked, done, cancelled)
- due: New due date (ISO format)
- assignee: New assignee
- addTags: Array of tags to add
- removeTags: Array of tags to remove
- addNote: Add a timestamped note to the task

Example:
todo:update {
  "id": "task-001",
  "status": "in-progress",
  "addNote": "Started implementation"
}`;
                                break;
                            case "delete":
                                helpText = `🗑️  todo:delete - Delete a task

Parameters:
- id (required): Task ID to delete

Example:
todo:delete {"id": "task-001"}

Note: This action cannot be undone!`;
                                break;
                            case "summary":
                                helpText = `📊 todo:summary - Get task summary by project

Parameters:
- project (optional): Filter by specific project

Shows:
- Task count by project
- Status distribution
- Priority distribution
- Urgent tasks (high/critical priority + open status)

Example:
todo:summary {}  // Summary of all projects
todo:summary {"project": "mcp-tools"}  // Summary of specific project`;
                                break;
                        }
                    }
                    return {
                        content: [{ type: "text", text: helpText }],
                    };
                }
                default:
                    throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
        }
        catch (error) {
            if (error instanceof types_js_1.McpError)
                throw error;
            console.error(`Error in ${name}:`, error);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to execute ${name}: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Todo Manager running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map