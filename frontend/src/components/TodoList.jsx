import React, { useState, useEffect } from 'react';

export default function TodoList() {
    const [todos, setTodos] = useState(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            return JSON.parse(savedTodos);
        } else {
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const addTask = (title) => {
        if (!title.trim()) return;
        setTodos([...todos, { id: Date.now(), title, completed: false }]);
        setInput('');
    };

    const deleteTask = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const startEdit = (id, title) => {
        setEditingId(id);
        setEditInput(title);
    };

    const saveEdit = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, title: editInput } : todo
        ));
        setEditingId(null);
        setEditInput('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditInput('');
    };

    const toggleComplete = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return (
        <div className="container mt-5" style={{ maxWidth: 500 }}>
            <h1 className="mb-4 text-center">Todo List</h1>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Add a new task"
                />
                <button className="btn btn-primary" onClick={() => addTask(input)}>Add</button>
            </div>
            <div className="btn-group mb-3 w-100">
                <button
                    className={`btn btn-outline-secondary${filter === 'all' ? ' active' : ''}`}
                    onClick={() => setFilter('all')}
                >All</button>
                <button
                    className={`btn btn-outline-secondary${filter === 'active' ? ' active' : ''}`}
                    onClick={() => setFilter('active')}
                >Active</button>
                <button
                    className={`btn btn-outline-secondary${filter === 'completed' ? ' active' : ''}`}
                    onClick={() => setFilter('completed')}
                >Completed</button>
            </div>
            <ul className="list-group">
                {filteredTodos.map((todo) => (
                    <li key={todo.id} className="list-group-item d-flex align-items-center justify-content-between">
                        {editingId === todo.id ? (
                            <div className="w-100 d-flex align-items-center">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    value={editInput}
                                    onChange={e => setEditInput(e.target.value)}
                                />
                                <button className="btn btn-success btn-sm me-2" onClick={() => saveEdit(todo.id)}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex align-items-center flex-grow-1">
                                    <input
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        checked={todo.completed}
                                        onChange={() => toggleComplete(todo.id)}
                                    />
                                    <span
                                        className={`flex-grow-1${todo.completed ? ' text-decoration-line-through text-muted' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onDoubleClick={() => startEdit(todo.id, todo.title)}
                                    >
                                        {todo.title}
                                    </span>
                                </div>
                                <div>
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(todo.id, todo.title)}>Edit</button>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteTask(todo.id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
