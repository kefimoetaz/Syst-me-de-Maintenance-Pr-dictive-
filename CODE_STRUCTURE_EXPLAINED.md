# 🎓 Code Structure Explained - Step by Step

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Agent (Python)](#agent-python)
3. [Backend (Node.js)](#backend-nodejs)
4. [Frontend (React)](#frontend-react)
5. [ML Service (Python)](#ml-service-python)
6. [Database (PostgreSQL)](#database-postgresql)
7. [Data Flow](#data-flow)
8. [Key Concepts](#key-concepts)

---

## 🎯 Project Overview

Your project has **4 main services** that work together:

```
┌─────────────┐
│   AGENT     │  Collects data from machines
│  (Python)   │  
└──────┬──────┘
       │ POST /api/data
       ▼
┌─────────────┐
│  BACKEND    │  Receives data, stores in DB, serves API
│  (Node.js)  │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  FRONTEND   │  │ ML SERVICE  │
│   (React)   │  │  (Python)   │
└─────────────┘  └─────────────┘
```

Let's explore each one step by step!

---

## 🤖 PART 1: Agent (Python)

### What Does It Do?

The agent is a **Python program** that runs on each machine you want to monitor. It:
1. Collects system metrics (CPU, RAM, Disk)
2. Reads SMART data from hard drives
3. Sends this data to the backend API
4. Repeats every hour automatically

### File Structure

```
agent/
├── src/
│   ├── main.py          # 🚀 START HERE - Entry point
│   ├── scheduler.py     # ⏰ Manages hourly collection
│   ├── collector.py     # 📊 Collects CPU, RAM, Disk
│   ├── smart_reader.py  # 💾 Reads disk SMART data
│   ├── sender.py        # 📤 Sends data to API
│   └── config.py        # ⚙️ Loads configuration
├── config.json          # Configuration file
└── requirements.txt     # Python dependencies
```

### Step-by-Step Code Flow

#### Step 1: main.py (Entry Point)

```python
# agent/src/main.py

# This is where everything starts!
from scheduler import start_scheduler

if __name__ == "__main__":
    # Start the scheduler that will collect data every hour
    start_scheduler()
```

**What happens**: When you run `python src/main.py`, it calls `start_scheduler()`

---

#### Step 2: scheduler.py (Manages Collection)

```python
# agent/src/scheduler.py

import schedule
import time
from collector import collect_system_metrics
from smart_reader import read_smart_data
from sender import send_to_api

def collect_and_send():
    """This function runs every hour"""
    
    # 1. Collect system metrics
    metrics = collect_system_metrics()
    # Returns: { cpu: 25.8, memory: 74.2, disk: 73.8 }
    
    # 2. Read SMART data
    smart = read_smart_data()
    # Returns: { health: "GOOD", temp: 40, errors: 0 }
    
    # 3. Send to API
    send_to_api(metrics, smart)
    # Sends HTTP POST to backend

def start_scheduler():
    """Start the hourly scheduler"""
    
    # Run immediately when starting
    collect_and_send()
    
    # Then schedule to run every hour
    schedule.every(1).hours.do(collect_and_send)
    
    # Keep running forever
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute
```

**What happens**: 
- Collects data immediately
- Then repeats every hour
- Keeps running until you press Ctrl+C

---

#### Step 3: collector.py (Collects Metrics)

```python
# agent/src/collector.py

import psutil  # Library to get system info

def collect_system_metrics():
    """Collect CPU, RAM, and Disk usage"""
    
    # Get CPU usage (percentage)
    cpu = psutil.cpu_percent(interval=1)
    # Example: 25.8 means 25.8% CPU used
    
    # Get RAM usage
    memory = psutil.virtual_memory()
    memory_percent = memory.percent
    # Example: 74.2 means 74.2% RAM used
    
    # Get Disk usage
    disk = psutil.disk_usage('/')
    disk_percent = disk.percent
    # Example: 73.8 means 73.8% disk used
    
    return {
        'cpu_usage': cpu,
        'memory_usage': memory_percent,
        'disk_usage': disk_percent,
        'memory_available': memory.available,
        'disk_free': disk.free
    }
```

**What happens**: Uses `psutil` library to read system information

---

#### Step 4: smart_reader.py (Reads Disk Health)

```python
# agent/src/smart_reader.py

from pySMART import Device

def read_smart_data():
    """Read SMART data from hard drive"""
    
    try:
        # Try to read SMART data
        device = Device('/dev/sda')  # Main hard drive
        
        return {
            'health': device.assessment,  # "PASS" or "FAIL"
            'temperature': device.temperature,
            'read_errors': device.attributes[1].raw,
            'write_errors': device.attributes[5].raw
        }
    except:
        # If SMART not available, return fallback data
        return {
            'health': 'GOOD',
            'temperature': 40,
            'read_errors': 0,
            'write_errors': 0
        }
```

**What happens**: Tries to read disk health, uses fake data if not available

---

#### Step 5: sender.py (Sends to API)

```python
# agent/src/sender.py

import requests
import json

def send_to_api(metrics, smart):
    """Send collected data to backend API"""
    
    # Prepare the data
    data = {
        'machine': {
            'hostname': 'Mori',
            'ip_address': '192.168.0.113',
            'serial_number': 'MAC-df:7c:f2:cb:2e:b8'
        },
        'metrics': metrics,
        'smart': smart,
        'timestamp': '2026-02-13T15:27:18'
    }
    
    # Send HTTP POST request
    response = requests.post(
        'http://localhost:3000/api/data',
        headers={
            'Authorization': 'Bearer dev-token-12345',
            'Content-Type': 'application/json'
        },
        json=data
    )
    
    if response.status_code == 200:
        print("[OK] Data sent successfully")
    else:
        print("[ERROR] Failed to send data")
```

**What happens**: Sends data to backend via HTTP POST request

---

### Summary: Agent Flow

```
1. main.py starts
   ↓
2. scheduler.py begins hourly loop
   ↓
3. collector.py gets CPU/RAM/Disk
   ↓
4. smart_reader.py gets disk health
   ↓
5. sender.py sends to backend API
   ↓
6. Wait 1 hour, repeat from step 3
```

---

## 🔧 PART 2: Backend (Node.js)

### What Does It Do?

The backend is a **Node.js server** that:
1. Receives data from agents
2. Stores data in PostgreSQL database
3. Provides API endpoints for frontend
4. Sends email notifications for alerts

### File Structure

```
backend/
├── src/
│   ├── index.js              # 🚀 START HERE - Server entry point
│   ├── config/
│   │   └── database.js       # Database connection
│   ├── models/               # Database models (tables)
│   │   ├── Machine.js
│   │   ├── SystemMetrics.js
│   │   ├── Alert.js
│   │   └── index.js
│   ├── routes/               # API endpoints
│   │   ├── data.js           # POST /api/data
│   │   ├── machines.js       # GET /api/machines
│   │   ├── alerts.js         # GET /api/alerts
│   │   └── dashboard.js      # GET /api/dashboard
│   ├── controllers/          # Business logic
│   │   ├── dataController.js
│   │   ├── dashboardController.js
│   │   └── alertController.js
│   ├── middleware/           # Request processing
│   │   ├── auth.js           # Check JWT token
│   │   ├── validation.js     # Validate data
│   │   └── error.js          # Handle errors
│   └── services/
│       └── emailService.js   # Send emails
├── package.json              # Dependencies
└── .env                      # Configuration
```

### Step-by-Step Code Flow

#### Step 1: index.js (Server Entry Point)

```javascript
// backend/src/index.js

const express = require('express');
const app = express();

// 1. Load middleware
app.use(express.json());  // Parse JSON bodies

// 2. Load routes
const dataRoutes = require('./routes/data');
const machinesRoutes = require('./routes/machines');
const alertsRoutes = require('./routes/alerts');

app.use('/api/data', dataRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/alerts', alertsRoutes);

// 3. Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✓ Server started on port ${PORT}`);
});
```

**What happens**: 
- Creates Express server
- Registers routes (endpoints)
- Listens on port 3000

---

#### Step 2: routes/data.js (Receive Agent Data)

```javascript
// backend/src/routes/data.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataController = require('../controllers/dataController');

// POST /api/data - Receive data from agent
router.post('/', 
    auth.authenticateToken,      // Check token first
    dataController.receiveData   // Then process data
);

module.exports = router;
```

**What happens**: Defines the POST /api/data endpoint

---

#### Step 3: middleware/auth.js (Check Token)

```javascript
// backend/src/middleware/auth.js

function authenticateToken(req, res, next) {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Check if token is valid
    if (token !== process.env.API_TOKEN) {
        return res.status(403).json({ error: 'Invalid token' });
    }
    
    // Token is valid, continue
    next();
}

module.exports = { authenticateToken };
```

**What happens**: Verifies the agent's token before allowing access

---

#### Step 4: controllers/dataController.js (Process Data)

```javascript
// backend/src/controllers/dataController.js

const { Machine, SystemMetrics, SmartData } = require('../models');

async function receiveData(req, res) {
    try {
        const { machine, metrics, smart } = req.body;
        
        // 1. Find or create machine
        let machineRecord = await Machine.findOne({
            where: { serial_number: machine.serial_number }
        });
        
        if (!machineRecord) {
            // Create new machine
            machineRecord = await Machine.create({
                hostname: machine.hostname,
                ip_address: machine.ip_address,
                serial_number: machine.serial_number,
                status: 'ACTIVE'
            });
        }
        
        // 2. Save system metrics
        const metricsRecord = await SystemMetrics.create({
            machine_id: machineRecord.id,
            cpu_usage: metrics.cpu_usage,
            memory_usage: metrics.memory_usage,
            disk_usage: metrics.disk_usage,
            timestamp: new Date()
        });
        
        // 3. Save SMART data
        const smartRecord = await SmartData.create({
            machine_id: machineRecord.id,
            health: smart.health,
            temperature: smart.temperature,
            read_errors: smart.read_errors,
            write_errors: smart.write_errors,
            timestamp: new Date()
        });
        
        // 4. Send success response
        res.status(200).json({
            message: 'Data received successfully',
            machine_id: machineRecord.id,
            system_metrics_id: metricsRecord.id,
            smart_data_id: smartRecord.id
        });
        
    } catch (error) {
        console.error('Error receiving data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { receiveData };
```

**What happens**:
1. Receives data from agent
2. Finds or creates machine in database
3. Saves metrics to database
4. Saves SMART data to database
5. Returns success response

---

#### Step 5: models/Machine.js (Database Model)

```javascript
// backend/src/models/Machine.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Machine = sequelize.define('Machine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hostname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'MAINTENANCE', 'FAILED'),
        defaultValue: 'ACTIVE'
    }
}, {
    tableName: 'machines',
    timestamps: true
});

module.exports = Machine;
```

**What happens**: Defines the structure of the `machines` table

---

### Summary: Backend Flow (Receiving Data)

```
1. Agent sends POST /api/data
   ↓
2. index.js receives request
   ↓
3. routes/data.js routes to controller
   ↓
4. middleware/auth.js checks token
   ↓
5. controllers/dataController.js processes data
   ↓
6. models/Machine.js saves to database
   ↓
7. Response sent back to agent
```

---

## 🎨 PART 3: Frontend (React)

### What Does It Do?

The frontend is a **React web application** that:
1. Displays dashboard with all machines
2. Shows real-time metrics and predictions
3. Manages alerts
4. Provides interactive charts

### File Structure

```
frontend/
├── src/
│   ├── main.jsx              # 🚀 START HERE - App entry point
│   ├── App.jsx               # Main app component
│   ├── index.css             # Global styles
│   └── components/
│       ├── Dashboard.jsx     # Main dashboard view
│       ├── MachineList.jsx   # List of all machines
│       ├── MachineDetails.jsx # Details of one machine
│       ├── AlertsList.jsx    # List of alerts
│       ├── KPICards.jsx      # Top KPI cards
│       └── SystemHealthChart.jsx # Charts
├── index.html                # HTML template
└── package.json              # Dependencies
```

### Step-by-Step Code Flow

#### Step 1: main.jsx (Entry Point)

```javascript
// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Render the app into the HTML
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**What happens**: Renders the App component into the HTML page

---

#### Step 2: App.jsx (Main Component)

```javascript
// frontend/src/App.jsx

import { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <h1 className="text-3xl font-bold p-6">
          🖥️ Maintenance Prédictive
        </h1>
      </header>
      
      <main className="container mx-auto p-6">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
```

**What happens**: Creates the main layout with header and dashboard

---

#### Step 3: Dashboard.jsx (Main Dashboard)

```javascript
// frontend/src/components/Dashboard.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import KPICards from './KPICards';
import MachineList from './MachineList';
import AlertsList from './AlertsList';

function Dashboard() {
  // State to store data
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data when component loads
  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  async function fetchData() {
    try {
      // 1. Fetch machines
      const machinesRes = await axios.get('/api/machines');
      setMachines(machinesRes.data);
      
      // 2. Fetch alerts
      const alertsRes = await axios.get('/api/alerts');
      setAlerts(alertsRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* KPI Cards at top */}
      <KPICards 
        totalMachines={machines.length}
        activeAlerts={alerts.length}
      />
      
      {/* Machine List */}
      <MachineList machines={machines} />
      
      {/* Alerts List */}
      <AlertsList alerts={alerts} />
    </div>
  );
}

export default Dashboard;
```

**What happens**:
1. Fetches machines and alerts from API
2. Displays KPI cards, machine list, and alerts
3. Refreshes data every 30 seconds

---

#### Step 4: MachineList.jsx (List of Machines)

```javascript
// frontend/src/components/MachineList.jsx

function MachineList({ machines }) {
  // Function to get color based on risk level
  function getRiskColor(riskLevel) {
    switch(riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Machines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map(machine => (
          <div key={machine.id} className="border rounded-lg p-4">
            {/* Machine Name */}
            <h3 className="font-bold text-lg">{machine.hostname}</h3>
            
            {/* Risk Level Badge */}
            <span className={`inline-block px-2 py-1 rounded text-sm ${getRiskColor(machine.risk_level)}`}>
              {machine.risk_level}
            </span>
            
            {/* Metrics */}
            <div className="mt-4 space-y-2">
              <div>CPU: {machine.latest_cpu}%</div>
              <div>RAM: {machine.latest_memory}%</div>
              <div>Disk: {machine.latest_disk}%</div>
            </div>
            
            {/* View Details Button */}
            <button 
              onClick={() => viewDetails(machine.id)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineList;
```

**What happens**: Displays each machine as a card with metrics and risk level

---

#### Step 5: AlertsList.jsx (List of Alerts)

```javascript
// frontend/src/components/AlertsList.jsx

import axios from 'axios';

function AlertsList({ alerts }) {
  // Function to acknowledge an alert
  async function acknowledgeAlert(alertId) {
    try {
      await axios.patch(`/api/alerts/${alertId}/acknowledge`);
      alert('Alert acknowledged!');
      // Refresh page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
      
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4">
            {/* Alert Title */}
            <h3 className="font-bold">{alert.title}</h3>
            
            {/* Alert Message */}
            <p className="text-gray-700 mt-2">{alert.message}</p>
            
            {/* Machine and Severity */}
            <div className="mt-2 text-sm text-gray-600">
              <span>Machine: {alert.machine_hostname}</span>
              <span className="ml-4">Severity: {alert.severity}</span>
            </div>
            
            {/* Acknowledge Button */}
            {alert.status === 'ACTIVE' && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Accuser Réception
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsList;
```

**What happens**: Displays alerts with option to acknowledge them

---

### Summary: Frontend Flow

```
1. main.jsx starts React app
   ↓
2. App.jsx creates layout
   ↓
3. Dashboard.jsx fetches data from API
   ↓
4. MachineList.jsx displays machines
   ↓
5. AlertsList.jsx displays alerts
   ↓
6. User clicks button → API call → Update
```

---

## 🧠 PART 4: ML Service (Python)

### What Does It Do?

The ML service is a **Python application** that:
1. Extracts features from historical data
2. Trains a Random Forest model
3. Generates predictions for each machine
4. Creates alerts for high-risk machines

### File Structure

```
ml-service/
├── src/
│   ├── training_pipeline.py      # 🚀 Train the model
│   ├── feature_extractor.py      # Extract 65 features
│   ├── model_trainer.py          # Train Random Forest
│   ├── model_registry.py         # Save/load models
│   ├── predictor.py              # Generate predictions
│   ├── prediction_scheduler.py   # Daily predictions at 2AM
│   └── alert_notifier.py         # Create alerts
├── models/                        # Saved ML models
│   └── random_forest_v7.pkl
└── requirements.txt               # Python dependencies
```

### Step-by-Step Code Flow

#### Step 1: training_pipeline.py (Train Model)

```python
# ml-service/src/training_pipeline.py

from feature_extractor import extract_features
from model_trainer import train_model
from model_registry import save_model

def train_pipeline():
    """Complete training pipeline"""
    
    print("Step 1: Extracting features...")
    # Get data from database and extract features
    X, y = extract_features()
    # X = features (65 columns)
    # y = labels (0=healthy, 1=will fail)
    
    print("Step 2: Training model...")
    # Train Random Forest model
    model, metrics = train_model(X, y)
    # model = trained Random Forest
    # metrics = accuracy, precision, recall
    
    print("Step 3: Saving model...")
    # Save model to disk
    model_path = save_model(model, metrics)
    
    print(f"✓ Model trained and saved: {model_path}")
    print(f"  Accuracy: {metrics['accuracy']:.2%}")
    
    return model

if __name__ == "__main__":
    train_pipeline()
```

**What happens**: Trains a new ML model from scratch

---

#### Step 2: feature_extractor.py (Extract Features)

```python
# ml-service/src/feature_extractor.py

import pandas as pd
import numpy as np
from database import get_db_connection

def extract_features():
    """Extract 65 features from raw metrics"""
    
    # 1. Get data from database
    conn = get_db_connection()
    query = """
        SELECT 
            machine_id,
            cpu_usage,
            memory_usage,
            disk_usage,
            timestamp
        FROM system_metrics
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        ORDER BY machine_id, timestamp
    """
    df = pd.read_sql(query, conn)
    
    # 2. Group by machine
    features_list = []
    for machine_id in df['machine_id'].unique():
        machine_data = df[df['machine_id'] == machine_id]
        
        # Extract features for this machine
        features = extract_machine_features(machine_data)
        features_list.append(features)
    
    # 3. Convert to numpy arrays
    X = np.array(features_list)  # Features
    y = np.zeros(len(features_list))  # Labels (0=healthy for now)
    
    return X, y

def extract_machine_features(data):
    """Extract 65 features from one machine's data"""
    
    features = {}
    
    # CPU features (13 features)
    features['cpu_mean_7d'] = data['cpu_usage'].tail(168).mean()
    features['cpu_mean_14d'] = data['cpu_usage'].tail(336).mean()
    features['cpu_mean_30d'] = data['cpu_usage'].mean()
    features['cpu_std_7d'] = data['cpu_usage'].tail(168).std()
    features['cpu_std_14d'] = data['cpu_usage'].tail(336).std()
    features['cpu_std_30d'] = data['cpu_usage'].std()
    features['cpu_min'] = data['cpu_usage'].min()
    features['cpu_max'] = data['cpu_usage'].max()
    # ... 5 more CPU features
    
    # Memory features (13 features)
    features['memory_mean_7d'] = data['memory_usage'].tail(168).mean()
    features['memory_mean_14d'] = data['memory_usage'].tail(336).mean()
    # ... 11 more memory features
    
    # Disk features (13 features)
    features['disk_mean_7d'] = data['disk_usage'].tail(168).mean()
    # ... 12 more disk features
    
    # Temperature features (13 features)
    # ... 13 temperature features
    
    # SMART features (13 features)
    # ... 13 SMART features
    
    # Total: 65 features
    return list(features.values())
```

**What happens**: Converts raw metrics into 65 statistical features

---

#### Step 3: model_trainer.py (Train Random Forest)

```python
# ml-service/src/model_trainer.py

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score

def train_model(X, y):
    """Train Random Forest model"""
    
    # 1. Split data into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # 2. Create Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,      # 100 trees
        max_depth=10,          # Max depth of each tree
        random_state=42
    )
    
    # 3. Train the model
    model.fit(X_train, y_train)
    
    # 4. Evaluate on test set
    y_pred = model.predict(X_test)
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0)
    }
    
    return model, metrics
```

**What happens**: Trains a Random Forest with 100 trees

---

#### Step 4: predictor.py (Generate Predictions)

```python
# ml-service/src/predictor.py

import numpy as np
from model_registry import load_latest_model
from feature_extractor import extract_machine_features
from database import get_db_connection

def predict_for_machine(machine_id):
    """Generate prediction for one machine"""
    
    # 1. Load trained model
    model = load_latest_model()
    
    # 2. Get machine's recent data
    conn = get_db_connection()
    query = f"""
        SELECT * FROM system_metrics
        WHERE machine_id = {machine_id}
        AND timestamp >= NOW() - INTERVAL '30 days'
        ORDER BY timestamp
    """
    data = pd.read_sql(query, conn)
    
    # 3. Extract features
    features = extract_machine_features(data)
    X = np.array([features])  # Shape: (1, 65)
    
    # 4. Predict probability of failure
    proba = model.predict_proba(X)[0]
    # proba[0] = probability of healthy (0)
    # proba[1] = probability of failure (1)
    
    failure_probability = proba[1]
    
    # 5. Determine risk level
    if failure_probability < 0.30:
        risk_level = 'LOW'
    elif failure_probability < 0.50:
        risk_level = 'MEDIUM'
    elif failure_probability < 0.70:
        risk_level = 'HIGH'
    else:
        risk_level = 'CRITICAL'
    
    # 6. Save prediction to database
    save_prediction(machine_id, failure_probability, risk_level)
    
    # 7. Create alert if HIGH or CRITICAL
    if risk_level in ['HIGH', 'CRITICAL']:
        create_alert(machine_id, failure_probability, risk_level)
    
    return {
        'machine_id': machine_id,
        'probability': failure_probability,
        'risk_level': risk_level
    }

def predict_all_machines():
    """Generate predictions for all machines"""
    
    conn = get_db_connection()
    machines = pd.read_sql("SELECT id FROM machines", conn)
    
    results = []
    for machine_id in machines['id']:
        result = predict_for_machine(machine_id)
        results.append(result)
        print(f"✓ Machine {machine_id}: {result['risk_level']} ({result['probability']:.1%})")
    
    return results
```

**What happens**: 
1. Loads trained model
2. Extracts features for each machine
3. Predicts failure probability
4. Classifies risk level
5. Creates alerts if needed

---

#### Step 5: prediction_scheduler.py (Daily Predictions)

```python
# ml-service/src/prediction_scheduler.py

from apscheduler.schedulers.blocking import BlockingScheduler
from predictor import predict_all_machines
from datetime import datetime

def run_daily_predictions():
    """Run predictions for all machines"""
    
    print(f"[{datetime.now()}] Starting daily predictions...")
    
    try:
        results = predict_all_machines()
        print(f"✓ Generated {len(results)} predictions")
    except Exception as e:
        print(f"✗ Error: {e}")

def start_scheduler():
    """Start scheduler to run predictions daily at 2 AM"""
    
    scheduler = BlockingScheduler()
    
    # Schedule to run every day at 2:00 AM
    scheduler.add_job(
        run_daily_predictions,
        'cron',
        hour=2,
        minute=0
    )
    
    print("Prediction scheduler started")
    print("Will run daily at 2:00 AM")
    
    # Run immediately on start
    run_daily_predictions()
    
    # Start scheduler
    scheduler.start()

if __name__ == "__main__":
    start_scheduler()
```

**What happens**: Runs predictions automatically every day at 2 AM

---

### Summary: ML Service Flow

```
Training (Once):
1. training_pipeline.py starts
   ↓
2. feature_extractor.py gets data from DB
   ↓
3. Extract 65 features per machine
   ↓
4. model_trainer.py trains Random Forest
   ↓
5. model_registry.py saves model to disk

Prediction (Daily at 2 AM):
1. prediction_scheduler.py triggers
   ↓
2. predictor.py loads trained model
   ↓
3. For each machine:
   - Extract features
   - Predict failure probability
   - Classify risk level
   - Save to database
   - Create alert if HIGH/CRITICAL
```

---

## 💾 PART 5: Database (PostgreSQL)

### What Does It Do?

PostgreSQL stores all the data:
- Machines information
- System metrics (7.8M+ records)
- SMART data
- Predictions
- Alerts
- ML models metadata

### Database Tables

```
machines
├── id (primary key)
├── hostname
├── ip_address
├── serial_number
├── status
└── timestamps

system_metrics
├── id (primary key)
├── machine_id (foreign key → machines)
├── cpu_usage
├── memory_usage
├── disk_usage
├── temperature
└── timestamp

smart_data
├── id (primary key)
├── machine_id (foreign key → machines)
├── health
├── temperature
├── read_errors
├── write_errors
└── timestamp

predictions
├── id (primary key)
├── machine_id (foreign key → machines)
├── probability_7d
├── probability_14d
├── probability_30d
├── risk_level
├── model_version
└── timestamp

alerts
├── id (primary key)
├── machine_id (foreign key → machines)
├── type (PREDICTION, METRIC, SMART, ANOMALY)
├── severity (LOW, MEDIUM, HIGH, CRITICAL)
├── title
├── message
├── details (JSON)
├── status (ACTIVE, ACKNOWLEDGED, RESOLVED)
├── email_sent
└── timestamps
```

### Example Queries

#### Get All Machines

```sql
SELECT * FROM machines WHERE status = 'ACTIVE';
```

Result:
```
id | hostname  | ip_address    | serial_number
---+-----------+---------------+------------------
1  | PC-ADMIN  | 192.168.1.100 | SN-2024-001
2  | PC-DEV    | 192.168.1.101 | SN-2024-002
5  | Mori      | 192.168.0.113 | MAC-df:7c:f2:cb
```

#### Get Latest Metrics for a Machine

```sql
SELECT 
    cpu_usage,
    memory_usage,
    disk_usage,
    timestamp
FROM system_metrics
WHERE machine_id = 5
ORDER BY timestamp DESC
LIMIT 1;
```

Result:
```
cpu_usage | memory_usage | disk_usage | timestamp
----------+--------------+------------+-------------------
25.8      | 74.2         | 73.8       | 2026-02-13 15:27:18
```

#### Get Active Alerts

```sql
SELECT 
    a.id,
    m.hostname,
    a.severity,
    a.title,
    a.message,
    a.created_at
FROM alerts a
JOIN machines m ON a.machine_id = m.id
WHERE a.status = 'ACTIVE'
ORDER BY a.severity DESC, a.created_at DESC;
```

Result:
```
id | hostname  | severity | title                    | created_at
---+-----------+----------+--------------------------+-------------------
1  | PC-VIDEO  | CRITICAL | High Failure Risk        | 2026-02-13 15:14:40
2  | PC-LEGACY | HIGH     | Elevated Failure Risk    | 2026-02-13 15:13:54
```

#### Get Predictions for a Machine

```sql
SELECT 
    probability_7d,
    probability_14d,
    probability_30d,
    risk_level,
    timestamp
FROM predictions
WHERE machine_id = 5
ORDER BY timestamp DESC
LIMIT 1;
```

Result:
```
probability_7d | probability_14d | probability_30d | risk_level | timestamp
---------------+-----------------+-----------------+------------+-------------------
39.17          | 47.56           | 55.95           | HIGH       | 2026-02-13 15:12:28
```

---

## 🔄 PART 6: Complete Data Flow

### Scenario: Agent Collects Data

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Agent Collects Data (Every Hour)                   │
└─────────────────────────────────────────────────────────────┘

Agent (Python)
├── collector.py gets CPU=25.8%, RAM=74.2%, Disk=73.8%
├── smart_reader.py gets Health=GOOD, Temp=40°C
└── sender.py sends to backend

        │ HTTP POST /api/data
        │ {
        │   machine: { hostname: "Mori", ... },
        │   metrics: { cpu: 25.8, memory: 74.2, ... },
        │   smart: { health: "GOOD", ... }
        │ }
        ▼

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Receives and Stores                        │
└─────────────────────────────────────────────────────────────┘

Backend (Node.js)
├── routes/data.js receives request
├── middleware/auth.js checks token ✓
├── controllers/dataController.js processes
└── models/Machine.js saves to database

        │ SQL INSERT
        ▼

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Database Stores Data                               │
└─────────────────────────────────────────────────────────────┘

PostgreSQL
├── machines table: Find or create machine
├── system_metrics table: INSERT new metrics
└── smart_data table: INSERT new SMART data

        │ Data stored
        ▼

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: ML Service Analyzes (Daily at 2 AM)                │
└─────────────────────────────────────────────────────────────┘

ML Service (Python)
├── prediction_scheduler.py triggers
├── predictor.py loads model
├── feature_extractor.py extracts 65 features
├── model predicts: 55.95% probability → HIGH risk
└── Save prediction to database

        │ SQL INSERT prediction
        ▼

PostgreSQL
└── predictions table: INSERT new prediction

        │ If risk ≥ 50% (HIGH)
        ▼

┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Alert Created                                      │
└─────────────────────────────────────────────────────────────┘

ML Service
└── alert_notifier.py creates alert

        │ HTTP POST /api/alerts
        ▼

Backend
├── controllers/alertController.js creates alert
├── services/emailService.js sends email
└── Save to database

        │ SQL INSERT alert
        ▼

PostgreSQL
└── alerts table: INSERT new alert

        │ Email sent to technicien@example.com
        ▼

📧 Email: "ALERTE HIGH - Machine Mori - Risque de panne: 55.95%"

┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Frontend Displays                                  │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
├── Dashboard.jsx fetches data
│   ├── GET /api/machines → 20 machines
│   └── GET /api/alerts → 5 alerts
├── MachineList.jsx displays machines
│   └── Shows "Mori" with HIGH risk (orange)
└── AlertsList.jsx displays alerts
    └── Shows "ALERTE HIGH - Machine Mori"

        │ User clicks "Accuser Réception"
        ▼

Frontend
└── axios.patch('/api/alerts/1/acknowledge')

        │ HTTP PATCH /api/alerts/1/acknowledge
        ▼

Backend
└── controllers/alertController.js updates status

        │ SQL UPDATE alerts SET status='ACKNOWLEDGED'
        ▼

PostgreSQL
└── alerts table: UPDATE status

        │ Response 200 OK
        ▼

Frontend
└── Alert now shows "ACKNOWLEDGED" status
```

---

## 🎯 PART 7: Key Concepts Explained

### 1. What is an API?

**API** = Application Programming Interface

Think of it like a restaurant:
- **Frontend** = Customer (orders food)
- **API** = Waiter (takes order, brings food)
- **Backend** = Kitchen (prepares food)
- **Database** = Pantry (stores ingredients)

Example:
```javascript
// Frontend asks for machines
axios.get('/api/machines')

// Backend responds with data
{ machines: [...] }
```

### 2. What is REST?

**REST** = Representational State Transfer

It's a way to design APIs using HTTP methods:
- **GET** = Read data (like SELECT in SQL)
- **POST** = Create data (like INSERT in SQL)
- **PUT/PATCH** = Update data (like UPDATE in SQL)
- **DELETE** = Delete data (like DELETE in SQL)

Example:
```
GET    /api/machines      → Get all machines
GET    /api/machines/5    → Get machine #5
POST   /api/machines      → Create new machine
PATCH  /api/machines/5    → Update machine #5
DELETE /api/machines/5    → Delete machine #5
```

### 3. What is JSON?

**JSON** = JavaScript Object Notation

It's a way to format data:
```json
{
  "machine": {
    "id": 5,
    "hostname": "Mori",
    "cpu": 25.8,
    "memory": 74.2
  }
}
```

### 4. What is a Model (Database)?

A **model** defines the structure of a database table:

```javascript
// Model definition
const Machine = {
  id: INTEGER,
  hostname: STRING,
  ip_address: STRING
}

// Creates this table:
CREATE TABLE machines (
  id INTEGER PRIMARY KEY,
  hostname VARCHAR(255),
  ip_address VARCHAR(255)
);
```

### 5. What is Middleware?

**Middleware** = Functions that run BEFORE your main code

```javascript
Request → Middleware 1 → Middleware 2 → Controller → Response
          (auth)         (validation)    (logic)

Example:
1. Check if user is logged in (auth)
2. Check if data is valid (validation)
3. Process the request (controller)
```

### 6. What is a Component (React)?

A **component** is a reusable piece of UI:

```javascript
// Component
function MachineCard({ machine }) {
  return (
    <div>
      <h3>{machine.hostname}</h3>
      <p>CPU: {machine.cpu}%</p>
    </div>
  );
}

// Use it multiple times
<MachineCard machine={machine1} />
<MachineCard machine={machine2} />
<MachineCard machine={machine3} />
```

### 7. What is State (React)?

**State** = Data that can change

```javascript
// State
const [machines, setMachines] = useState([]);

// Update state
setMachines([...newMachines]);

// React automatically re-renders the UI
```

### 8. What is Machine Learning?

**Machine Learning** = Computer learns patterns from data

Your project:
1. **Training**: Show the computer 1000s of examples
   - "This machine had high CPU and failed"
   - "This machine had low CPU and was fine"
   
2. **Learning**: Computer finds patterns
   - "High CPU + High RAM + Old disk = Likely to fail"
   
3. **Prediction**: Computer predicts new machines
   - "This machine has high CPU and RAM → 55% chance of failure"

### 9. What is Random Forest?

**Random Forest** = Many decision trees voting together

```
Tree 1: "Will fail" (60%)
Tree 2: "Will fail" (55%)
Tree 3: "Won't fail" (45%)
Tree 4: "Will fail" (58%)
...
Tree 100: "Will fail" (52%)

Average: 55% chance of failure → HIGH risk
```

### 10. What are Features?

**Features** = Numbers that describe the machine

Your 65 features:
- CPU average last 7 days
- CPU average last 14 days
- CPU average last 30 days
- CPU standard deviation
- CPU min/max
- ... (same for RAM, Disk, Temperature, SMART)

---

## 📝 Summary: How Everything Works Together

```
1. AGENT collects data every hour
   ↓
2. BACKEND receives and stores in DATABASE
   ↓
3. ML SERVICE analyzes daily at 2 AM
   ↓
4. PREDICTIONS generated and saved
   ↓
5. ALERTS created if risk is high
   ↓
6. EMAILS sent to technicians
   ↓
7. FRONTEND displays everything
   ↓
8. USER acknowledges alerts
```

**That's your entire system!** 🎉

---

## 🎓 For Your Defense

### Key Points to Remember

1. **Architecture**: Microservices (4 independent services)
2. **Agent**: Python, collects hourly, sends to API
3. **Backend**: Node.js, REST API, stores in PostgreSQL
4. **Frontend**: React, displays dashboard, manages alerts
5. **ML**: Random Forest, 65 features, predicts failures
6. **Database**: PostgreSQL, 8 tables, 7.8M+ records

### When Jury Asks "How Does It Work?"

**Simple Answer**:
"The agent collects metrics every hour and sends to the backend API. The backend stores everything in PostgreSQL. Every day at 2 AM, the ML service analyzes the data with Random Forest and generates predictions. If a machine has high risk, an alert is created and an email is sent. The frontend displays everything in a dashboard where technicians can manage alerts."

**Technical Answer**:
"We use a microservices architecture with 4 services. The Python agent uses psutil to collect system metrics and pySMART for disk health, sending data via HTTP POST to our Node.js backend API. The backend uses Express with Sequelize ORM to store data in PostgreSQL. Our ML service uses scikit-learn's Random Forest with 65 extracted features to predict failure probabilities. The React frontend fetches data via REST API and displays it with TailwindCSS and Recharts."

---

## 🚀 Next Steps

Now that you understand the code structure:

1. **Read the actual code files** - They follow this structure
2. **Run the system** - See it in action
3. **Make small changes** - Learn by doing
4. **Prepare your demo** - Use QUICK_START_DEMO.md
5. **Review FAQ** - Read FAQ_DEFENSE.md for jury questions

**You've got this!** 💪

