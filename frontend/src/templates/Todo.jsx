import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Todos() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [descValue, setDescValue] = useState(''); // description field

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/todos/');
            setTasks(response.data);
        } catch (error) {
            console.log('error', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:8000/api/todos/${taskId}/delete/`);
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
        } catch (error) {
            console.log('error', error);
        }
    };

    const addTask = async () => {
        try {
            if (inputValue.trim() !== '') {
                const response = await axios.post('http://localhost:8000/api/todos/add/', {
                    title: inputValue,
                    description: descValue,
                    completed: false
                });
                setTasks([...tasks, response.data]);
                setInputValue('');
                setDescValue('');
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const toggleCompleted = async (taskId) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            if (taskToUpdate) {
                const response = await axios.put(`http://localhost:8000/api/todos/${taskId}/update/`, {
                    completed: !taskToUpdate.completed
                });
                const updatedTasks = tasks.map(task =>
                    task.id === taskId ? {
                        ...task,
                        completed: response.data.completed
                    } : task
                );
                setTasks(updatedTasks);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

 return (
        <div className="container">
            <div className="todo-app">
                <div className="app-title">
                    <h2>To-Do List</h2>
                    <div className="icon">
                        <i className="fas fa-tasks"></i>
                    </div>
                </div>

                <div className="input-container">
                    <div className="input-group">
                        <input
                            type="text"
                            className="todo-input"
                            placeholder="Task title"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                        <input
                            type="text"
                            className="todo-input"
                            placeholder="Task description"
                            value={descValue}
                            onChange={e => setDescValue(e.target.value)}
                        />
                    </div>
                    <button className="add-btn" onClick={addTask}>
                        <i className="fas fa-plus"></i> Add Task
                    </button>
                </div>

                <ul className="task-list">
                    {tasks.map(task => (
                        <li 
                            key={task.id} 
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                        >
                            <div className="task-content" onClick={() => toggleCompleted(task.id)}>
                                <div className="task-title">
                                    {task.completed ? <del>{task.title}</del> : task.title}
                                </div>
                                <div className="task-description">
                                    {task.description || 'No description'}
                                </div>
                                <div className="task-meta">
                                    <span className="meta-item">
                                        <i className="far fa-calendar-alt"></i> {new Date(task.created_at).toLocaleString()}
                                    </span>
                                    <span className="meta-item">
                                        <i className="fas fa-sync-alt"></i> {new Date(task.updated_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <button 
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                }}
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
