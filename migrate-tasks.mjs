#!/usr/bin/env node

// Migration script to move tasks from Brain state to MCP Todo Manager
// Run this after mcp-todo-manager is installed and configured

import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';

const DATA_DIR = path.join(homedir(), '.mcp-todo-manager');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');

// Tasks to migrate (from our Brain state)
const tasksToMigrate = [
  {
    project: "chaos-theory-ai",
    title: "Fix script hanging when Ollama connection doesn't close",
    description: "Scripts using urllib to call Ollama hang after completion when model is in 'Stopping...' state",
    priority: "high",
    status: "open",
    tags: ["bug", "ollama"],
    notes: [{
      timestamp: "2025-07-11T23:58:00Z",
      content: "Solution: Add sys.exit(), use context managers, add Connection:close header, consider requests library"
    }]
  },
  {
    project: "collaboration-research",
    title: "PyAutoGUI 'continue' experiment - test value of human noise curation",
    description: "Test whether a bot typing 'continue' every few minutes produces similar insights to human-curated semantic noise",
    priority: "low",
    status: "open",
    tags: ["experiment", "research"],
    notes: [{
      timestamp: "2025-07-12T07:10:00Z",
      content: "Hypothesis: Human semantic perturbations create phase transitions that simple continuation cannot"
    }]
  },
  {
    project: "mcp-tools",
    title: "Add help tools/commands to all MCP tools",
    description: "Each MCP tool should have a consistent help command/function that explains its usage, available commands, and examples",
    priority: "high",
    status: "open",
    tags: ["enhancement", "documentation"],
    notes: [{
      timestamp: "2025-07-12T15:10:00Z",
      content: "Tools needing help: mcp-brain-manager, brain, tracked-search, project-finder, smalledit, sequential-thinking, filesystem"
    }]
  }
];

async function migrate() {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Load existing todos if any
    let todos = { tasks: [], nextId: 1 };
    try {
      const data = await fs.readFile(TODOS_FILE, 'utf-8');
      todos = JSON.parse(data);
    } catch {
      console.log("No existing todos found, starting fresh");
    }
    
    // Migrate each task
    for (const task of tasksToMigrate) {
      const newTask = {
        id: `task-${todos.nextId.toString().padStart(3, '0')}`,
        project: task.project,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: task.tags || [],
        notes: task.notes || []
      };
      
      todos.tasks.push(newTask);
      todos.nextId++;
      console.log(`✅ Migrated: ${newTask.id} - ${newTask.title}`);
    }
    
    // Save updated todos
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
    console.log(`\n📁 Migration complete! ${tasksToMigrate.length} tasks migrated to ${TODOS_FILE}`);
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();