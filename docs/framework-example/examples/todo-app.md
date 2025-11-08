# Example: Todo App

Build a complete todo application with ReactFlow.

---

## Features

- Create todos
- Mark as complete
- Delete todos
- Filter by status
- Persist to database

---

## Complete Code

### Database

**app/server/db.ts:**

```typescript
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

let todos: Todo[] = [];
let nextId = 1;

export const db = {
  todos: {
    findAll: async () => todos,
    create: async (text: string) => {
      const todo: Todo = {
        id: nextId++,
        text,
        completed: false,
        createdAt: new Date(),
      };
      todos.push(todo);
      return todo;
    },
    toggle: async (id: number) => {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
      return todo;
    },
    delete: async (id: number) => {
      todos = todos.filter((t) => t.id !== id);
    },
  },
};
```

### Server Functions

**app/server/todos.ts:**

```typescript
import { createServerFn } from "@reactflow/server";
import { db } from "./db";

export const getTodos = createServerFn(async (ctx) => {
  return db.todos.findAll();
});

export const createTodo = createServerFn(async (ctx, text: string) => {
  if (!text.trim()) {
    throw new Error("Todo text cannot be empty");
  }
  return db.todos.create(text);
});

export const toggleTodo = createServerFn(async (ctx, id: number) => {
  return db.todos.toggle(id);
});

export const deleteTodo = createServerFn(async (ctx, id: number) => {
  await db.todos.delete(id);
  return { success: true };
});
```

### Todo Component

**app/routes/index.tsx:**

```typescript
import { useState } from 'react';
import { useServerQuery, useServerFn } from '@reactflow/server';
import { getTodos, createTodo, toggleTodo, deleteTodo } from '../server/todos';

type Filter = 'all' | 'active' | 'completed';

export default function TodoApp() {
  const [filter, setFilter] = useState<Filter>('all');
  const [newTodo, setNewTodo] = useState('');

  const { data: todos, loading, refetch } = useServerQuery(getTodos, []);
  const { execute: create, loading: creating } = useServerFn(createTodo);
  const { execute: toggle } = useServerFn(toggleTodo);
  const { execute: remove } = useServerFn(deleteTodo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await create(newTodo);
    setNewTodo('');
    refetch();
  };

  const handleToggle = async (id: number) => {
    await toggle(id);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    refetch();
  };

  const filteredTodos = todos?.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos?.filter((t) => !t.completed).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">todos</h1>

        <div className="bg-white shadow-lg rounded-lg">
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-b">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 text-lg border-0 focus:outline-none"
              disabled={creating}
            />
          </form>

          {/* Todo List */}
          <ul>
            {filteredTodos?.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 group"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span
                  className={`flex-1 text-lg ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          {todos && todos.length > 0 && (
            <div className="p-4 flex items-center justify-between text-sm text-gray-600">
              <span>{activeCount} items left</span>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded ${
                    filter === 'all' ? 'border border-red-300' : ''
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1 rounded ${
                    filter === 'active' ? 'border border-red-300' : ''
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded ${
                    filter === 'completed' ? 'border border-red-300' : ''
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Double-click to edit a todo
          <br />
          Created with ReactFlow
        </p>
      </div>
    </div>
  );
}
```

---

## Run the App

```bash
pnpm dev
```

Visit `http://localhost:3000`

---

## Enhancements

### 1. Add Edit Functionality

```typescript
const [editingId, setEditingId] = useState<number | null>(null);
const [editText, setEditText] = useState("");

const handleEdit = (todo: Todo) => {
  setEditingId(todo.id);
  setEditText(todo.text);
};

const handleSave = async (id: number) => {
  await updateTodo(id, editText);
  setEditingId(null);
  refetch();
};
```

### 2. Add Persistence

Replace in-memory database with PostgreSQL, MongoDB, or SQLite.

### 3. Add Authentication

Protect todos per user.

### 4. Add Due Dates

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}
```

### 5. Add Categories/Tags

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  tags: string[];
  createdAt: Date;
}
```

---

## 🎉 Done!

You now have a fully functional todo app!
