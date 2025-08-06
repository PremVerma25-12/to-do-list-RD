import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : 'to-do-list-rd-production-6dcf.up.railway.app';

export default function Todos() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  
  // Refs for Three.js
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const sphereRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const count = tasks.filter(task => task.completed).length;
    setCompletedCount(count);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/todos/`);
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const addTask = async () => {
    if (inputValue.trim() === '') return;

    try {
      const response = await axios.post(`${BASE_URL}/api/todos/add/`, {
        title: inputValue,
        description: descValue,
        completed: false
      });
      setTasks([...tasks, response.data]);
      setInputValue('');
      setDescValue('');
    } catch (error) {
      console.error('Add error:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${BASE_URL}/api/todos/${taskId}/delete/`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleCompleted = async (taskId) => {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    try {
      const response = await axios.put(`${BASE_URL}/api/todos/${taskId}/update/`, {
        completed: !task.completed
      });
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: response.data.completed } : t
      ));
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  // Three.js initialization
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, 300 / 300, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Sci-fi orb
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a396b,
      emissive: 0xff66b3,
      emissiveIntensity: 0.2,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
      wireframe: true
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff66b3, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a396b, 0.5);
    scene.add(hemiLight);
    
    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const pulse = 1 + (completedCount / (tasks.length || 1)) * 0.3;
      sphere.scale.set(pulse, pulse, pulse);
      
      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.01;
      
      if (tasks.length > 0) {
        const completionRatio = completedCount / tasks.length;
        material.emissiveIntensity = 0.2 + completionRatio * 0.8;
        material.wireframeLinewidth = 1 + completionRatio * 3;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update orb based on tasks
  useEffect(() => {
    if (!sphereRef.current || tasks.length === 0) return;
    
    const completionRatio = completedCount / tasks.length;
    const color = new THREE.Color().lerpColors(
      new THREE.Color(0x1a396b),
      new THREE.Color(0xff66b3),
      completionRatio
    );
    
    sphereRef.current.material.color = color;
  }, [completedCount, tasks.length]);

  return (
    <div className="container">
      <div className="todo-app">
        <div className="app-header">
          <h1>🚀 Sci-Fi Task Matrix</h1>
          <div className="holographic-display" ref={mountRef} />
        </div>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter mission title"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <input
            type="text"
            placeholder="Mission description"
            value={descValue}
            onChange={(e) => setDescValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask}>
            <span className="button-text">Add Mission</span>
            <span className="button-glow" />
          </button>
        </div>

        <div className="task-list-container">
          <div className="status-display">
            <span className="completed-count">{completedCount}</span>
            <span> of </span>
            <span className="total-count">{tasks.length}</span>
            <span> missions completed</span>
          </div>

          <ul className="task-list">
            {tasks.map(task => (
              <li 
                key={task.id} 
                className={task.completed ? 'completed' : ''}
                onClick={() => toggleCompleted(task.id)}
              >
                <div className="task-content">
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description provided"}</p>
                  <div className="task-meta">
                    <span>🕒 {new Date(task.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}