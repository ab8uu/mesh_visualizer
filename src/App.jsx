import React, { useState, useEffect } from 'react';
import { calculateShiftMetrics, generateGridData } from './utils/shiftLogic';
import './App.css';

export default function App() {
    const [p, setP] = useState(16);
    const [q, setQ] = useState(5);
    const [step, setStep] = useState(0); // 0: Initial, 1: Stage 1, 2: Stage 2
    const [nodes, setNodes] = useState([]);
    const [error, setError] = useState('');

    const metrics = calculateShiftMetrics(p, q);

    useEffect(() => {
        resetGrid();
    }, [p, q]);

    const validateAndSetP = (val) => {
        const num = parseInt(val);
        if (num >= 4 && num <= 64 && Number.isInteger(Math.sqrt(num))) {
            setP(num);
            setError('');
            if (q >= num) setQ(num - 1);
        } else {
            setError('P must be a perfect square between 4 and 64 (e.g., 4, 9, 16, 25, 36, 49, 64)');
        }
    };

    const resetGrid = () => {
        setNodes(generateGridData(p));
        setStep(0);
    };

    const performNextStep = () => {
        if (step === 0) {
            // Stage 1: Row Shift
            const newNodes = [...nodes];
            const nextData = new Array(p);

            for (let i = 0; i < p; i++) {
                const r = Math.floor(i / metrics.rootP);
                const c = i % metrics.rootP;
                const newC = (c + metrics.rowShift) % metrics.rootP;
                const targetIndex = r * metrics.rootP + newC;
                nextData[targetIndex] = nodes[i].currentData;
            }

            setNodes(nodes.map((n, i) => ({ ...n, currentData: nextData[i] })));
            setStep(1);
        } else if (step === 1) {
            // Stage 2: Column Shift
            const newNodes = [...nodes];
            const nextData = new Array(p);

            for (let i = 0; i < p; i++) {
                const r = Math.floor(i / metrics.rootP);
                const c = i % metrics.rootP;
                const newR = (r + metrics.colShift) % metrics.rootP;
                const targetIndex = newR * metrics.rootP + c;
                nextData[targetIndex] = nodes[i].currentData;
            }

            setNodes(nodes.map((n, i) => ({ ...n, currentData: nextData[i] })));
            setStep(2);
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>Mesh Circular Shift Visualizer</h1>
            </header>

            <div className="dashboard">
                {/* Control Panel */}
                <div className="panel controls">
                    <h2>Simulation Controls</h2>
                    <div className="input-group">
                        <label>Total Nodes (P):</label>
                        <input
                            type="number"
                            defaultValue={p}
                            onBlur={(e) => validateAndSetP(e.target.value)}
                        />
                    </div>
                    {error && <div className="error">{error}</div>}

                    <div className="input-group">
                        <label>Shift Amount (q):</label>
                        <input
                            type="number"
                            value={q}
                            min="1"
                            max={p - 1}
                            onChange={(e) => setQ(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    <div className="action-buttons">
                        <button onClick={resetGrid} className="btn-reset">Reset</button>
                        <button
                            onClick={performNextStep}
                            disabled={step === 2 || !!error}
                            className="btn-next"
                        >
                            {step === 0 ? 'Execute Stage 1 (Row Shift)' :
                                step === 1 ? 'Execute Stage 2 (Col Shift)' : 'Shift Complete'}
                        </button>
                    </div>
                </div>

                {/* Complexity Panel */}
                <div className="panel complexity">
                    <h2>Complexity Analysis</h2>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span>Row Shift</span>
                            <strong>{metrics.rowShift} steps</strong>
                        </div>
                        <div className="stat-box">
                            <span>Column Shift</span>
                            <strong>{metrics.colShift} steps</strong>
                        </div>
                    </div>

                    <div className="comparison">
                        <div className="bar-chart">
                            <div className="bar ring-bar" style={{ width: `${Math.min((metrics.ringSteps / (p / 2)) * 100, 100)}%` }}>
                                Ring: {metrics.ringSteps} steps
                            </div>
                            <div className="bar mesh-bar" style={{ width: `${Math.min((metrics.meshSteps / (p / 2)) * 100, 100)}%` }}>
                                Mesh: {metrics.meshSteps} steps
                            </div>
                        </div>
                        <p className="formula-text">
                            Ring steps = min(q, p-q)<br />
                            Mesh steps = (q mod √p) + ⌊q / √p⌋
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid Visualization */}
            <div className="grid-wrapper">
                <h2 className="step-indicator">
                    {step === 0 && "Initial State"}
                    {step === 1 && "After Stage 1 (Row Shift)"}
                    {step === 2 && "Final State (After Column Shift)"}
                </h2>
                <div
                    className="mesh-grid"
                    style={{ gridTemplateColumns: `repeat(${metrics.rootP}, 1fr)` }}
                >
                    {nodes.map((node) => (
                        <div key={node.id} className={`node ${node.id !== node.currentData ? 'moved' : ''}`}>
                            <span className="node-id">Node {node.id}</span>
                            <div className="node-data" key={`${node.id}-${node.currentData}`}>
                                Data: {node.currentData}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}