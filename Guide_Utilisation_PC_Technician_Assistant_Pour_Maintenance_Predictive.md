# Guide : Utilisation du "PC Technician Assistant" pour la Maintenance Prédictive

## 📋 Introduction

Ce document explique comment ton programme existant **"PC Technician Assistant"** peut être utilisé et adapté pour créer un système de **maintenance prédictive avec IA** pour ton projet PFE.

---

## 🎯 Situation Actuelle vs Objectif

### Programme Actuel : PC Technician Assistant

**Ce qu'il fait :**
- Fonctionne sur **UN seul PC** (local)
- Interface graphique (Tkinter)
- Scan manuel (tu cliques sur "Scan System")
- Génère des rapports locaux
- Outils de maintenance (nettoyage, startup manager)

**Limitations :**
- ❌ Pas de collecte automatique continue
- ❌ Pas de surveillance de plusieurs PC en même temps
- ❌ Pas de serveur central
- ❌ Pas d'intelligence artificielle
- ❌ Pas de prédiction de pannes

### Objectif : Système de Maintenance Prédictive

**Ce qu'on veut :**
- Surveiller **100+ ordinateurs** en même temps
- Collecte **automatique** des données (toutes les heures)
- Serveur central qui reçoit toutes les données
- **IA** qui analyse et prédit les pannes
- **Alertes** automatiques avant les pannes
- **Dashboard** web pour visualiser tout le parc

---

## 🔄 Comment Transformer Ton Programme

### Architecture Cible

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE GLOBALE                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PC 1 (Ahmed)   │  │   PC 2 (Fatma)   │  │  PC 100 (Ali)    │
│                  │  │                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │   Agent    │  │  │  │   Agent    │  │  │  │   Agent    │  │
│  │ (Version   │  │  │  │ (Version   │  │  │  │ (Version   │  │
│  │  légère de │  │  │  │  légère de │  │  │  │  légère de │  │
│  │  ton prog) │  │  │  │  ton prog) │  │  │  │  ton prog) │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│        │         │  │        │         │  │        │         │
└────────┼─────────┘  └────────┼─────────┘  └────────┼─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │ (Envoi données via API)
                               ↓
         ┌─────────────────────────────────────────────┐
         │         SERVEUR CENTRAL (Cloud/Local)       │
         │                                             │
         │  ┌──────────────────────────────────────┐  │
         │  │  API REST (Réception des données)    │  │
         │  └──────────────────────────────────────┘  │
         │                    ↓                        │
         │  ┌──────────────────────────────────────┐  │
         │  │  Base de Données (PostgreSQL)        │  │
         │  │  - Historique de toutes les données  │  │
         │  │  - Interventions de maintenance      │  │
         │  └──────────────────────────────────────┘  │
         │                    ↓                        │
         │  ┌──────────────────────────────────────┐  │
         │  │  Service IA (Python + ML)            │  │
         │  │  - Analyse les données               │  │
         │  │  - Prédit les pannes                 │  │
         │  │  - Détecte les anomalies             │  │
         │  └──────────────────────────────────────┘  │
         │                    ↓                        │
         │  ┌──────────────────────────────────────┐  │
         │  │  Dashboard Web (React/Vue)           │  │
         │  │  - Vue d'ensemble du parc            │  │
         │  │  - Alertes et prédictions            │  │
         │  │  - Rapports                          │  │
         │  └──────────────────────────────────────┘  │
         └─────────────────────────────────────────────┘
```

---

## 📦 Composants à Développer

### 1. Agent de Collecte (Basé sur ton programme actuel)

**Rôle :** Installé sur chaque PC, collecte les données et les envoie au serveur

**Fonctionnalités à garder de ton programme :**
- ✅ Collecte CPU, RAM, Disque (via `psutil`)
- ✅ Informations système (OS, BIOS)
- ✅ Analyse disque
- ✅ Statistiques réseau

**Fonctionnalités à ajouter :**
- ✅ Envoi automatique des données vers le serveur (API REST)
- ✅ Exécution en arrière-plan (service Windows)
- ✅ Collecte périodique (toutes les heures)
- ✅ Collecte des données SMART du disque
- ✅ Collecte des logs d'erreurs système

**Code Python de l'Agent (Simplifié) :**

```python
# agent_collecte.py
import psutil
import requests
import time
import platform
import json
from datetime import datetime

# Configuration
SERVER_URL = "http://serveur-central.poulina.tn/api/data"
PC_ID = "PC-001"  # Identifiant unique du PC
INTERVAL = 3600  # Collecte toutes les heures (3600 secondes)

def collect_system_data():
    """
    Collecte toutes les données système
    (Utilise les fonctions de ton programme actuel)
    """
    data = {
        "pc_id": PC_ID,
        "timestamp": datetime.now().isoformat(),
        
        # Informations système
        "os": platform.system(),
        "os_version": platform.version(),
        "hostname": platform.node(),
        
        # Performance CPU
        "cpu_percent": psutil.cpu_percent(interval=1),
        "cpu_count": psutil.cpu_count(),
        "cpu_freq": psutil.cpu_freq().current if psutil.cpu_freq() else None,
        
        # Mémoire RAM
        "memory_total": psutil.virtual_memory().total,
        "memory_used": psutil.virtual_memory().used,
        "memory_percent": psutil.virtual_memory().percent,
        
        # Disque
        "disk_total": psutil.disk_usage('/').total,
        "disk_used": psutil.disk_usage('/').used,
        "disk_percent": psutil.disk_usage('/').percent,
        
        # Réseau
        "network_sent": psutil.net_io_counters().bytes_sent,
        "network_recv": psutil.net_io_counters().bytes_recv,
        
        # Système
        "boot_time": psutil.boot_time(),
        "uptime_seconds": time.time() - psutil.boot_time(),
        
        # Température (si disponible)
        "temperature": get_cpu_temperature(),
        
        # Données SMART du disque (si disponible)
        "smart_data": get_smart_data(),
        
        # Logs d'erreurs récents
        "error_logs": get_recent_errors()
    }
    
    return data

def get_cpu_temperature():
    """Récupère la température du CPU (si disponible)"""
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            # Cherche la température CPU
            for name, entries in temps.items():
                for entry in entries:
                    if 'cpu' in name.lower() or 'core' in entry.label.lower():
                        return entry.current
    except:
        pass
    return None

def get_smart_data():
    """
    Récupère les données SMART du disque
    (Nécessite des outils externes comme smartctl)
    """
    try:
        import subprocess
        result = subprocess.run(
            ['smartctl', '-A', '/dev/sda'], 
            capture_output=True, 
            text=True
        )
        # Parser les données SMART
        # Retourner les indicateurs importants
        return parse_smart_output(result.stdout)
    except:
        return None

def get_recent_errors():
    """
    Récupère les erreurs système récentes
    (Logs Windows Event Viewer)
    """
    try:
        import win32evtlog
        # Lire les logs d'erreurs des dernières 24h
        # Retourner le nombre d'erreurs critiques
        return count_recent_errors()
    except:
        return 0

def send_to_server(data):
    """Envoie les données au serveur central"""
    try:
        response = requests.post(
            SERVER_URL,
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Données envoyées avec succès : {datetime.now()}")
            return True
        else:
            print(f"❌ Erreur serveur : {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion : {e}")
        # Sauvegarder localement pour envoi ultérieur
        save_locally(data)
        return False

def save_locally(data):
    """Sauvegarde les données localement si le serveur est inaccessible"""
    with open('pending_data.json', 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    """Boucle principale de l'agent"""
    print(f"🚀 Agent de collecte démarré pour {PC_ID}")
    print(f"📡 Serveur : {SERVER_URL}")
    print(f"⏱️  Intervalle : {INTERVAL} secondes")
    
    while True:
        try:
            # Collecter les données
            print(f"\n📊 Collecte des données...")
            data = collect_system_data()
            
            # Envoyer au serveur
            print(f"📤 Envoi vers le serveur...")
            send_to_server(data)
            
            # Attendre avant la prochaine collecte
            print(f"⏳ Prochaine collecte dans {INTERVAL} secondes")
            time.sleep(INTERVAL)
            
        except KeyboardInterrupt:
            print("\n🛑 Arrêt de l'agent")
            break
        except Exception as e:
            print(f"❌ Erreur : {e}")
            time.sleep(60)  # Attendre 1 minute avant de réessayer

if __name__ == "__main__":
    main()
```

**Installation de l'Agent sur chaque PC :**

```bash
# 1. Copier l'agent sur le PC
# 2. Installer les dépendances
pip install psutil requests

# 3. Exécuter l'agent
python agent_collecte.py

# 4. (Optionnel) Installer comme service Windows
# Pour qu'il démarre automatiquement au démarrage du PC
```

---

### 2. Serveur Central (Backend)

**Rôle :** Reçoit les données de tous les agents, les stocke, et les traite

**Technologies :**
- Python (FastAPI ou Flask)
- PostgreSQL (base de données)
- Redis (cache, optionnel)

**Code du Serveur (Simplifié) :**

```python
# server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import psycopg2
from typing import Optional

app = FastAPI()

# Connexion à la base de données
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="maintenance_predictive",
        user="admin",
        password="password"
    )

# Modèle de données
class SystemData(BaseModel):
    pc_id: str
    timestamp: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    temperature: Optional[float]
    # ... autres champs

@app.post("/api/data")
async def receive_data(data: SystemData):
    """
    Endpoint pour recevoir les données des agents
    """
    try:
        # Sauvegarder dans la base de données
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO system_metrics 
            (pc_id, timestamp, cpu_percent, memory_percent, disk_percent, temperature)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data.pc_id,
            data.timestamp,
            data.cpu_percent,
            data.memory_percent,
            data.disk_percent,
            data.temperature
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Déclencher l'analyse IA (optionnel, en temps réel)
        # trigger_ai_analysis(data.pc_id)
        
        return {"status": "success", "message": "Données reçues"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pc/{pc_id}/status")
async def get_pc_status(pc_id: str):
    """
    Récupère le statut actuel d'un PC
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM system_metrics 
        WHERE pc_id = %s 
        ORDER BY timestamp DESC 
        LIMIT 1
    """, (pc_id,))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if result:
        return {"pc_id": pc_id, "data": result}
    else:
        raise HTTPException(status_code=404, detail="PC non trouvé")

@app.get("/api/predictions/{pc_id}")
async def get_predictions(pc_id: str):
    """
    Récupère les prédictions de panne pour un PC
    """
    # Appeler le service IA pour obtenir les prédictions
    predictions = get_ai_predictions(pc_id)
    return predictions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

### 3. Service IA (Machine Learning)

**Rôle :** Analyse les données historiques et prédit les pannes

**Technologies :**
- Python
- scikit-learn (Machine Learning)
- pandas (manipulation de données)
- joblib (sauvegarde des modèles)

**Code du Service IA (Simplifié) :**

```python
# ai_service.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import psycopg2

def load_historical_data():
    """
    Charge les données historiques depuis la base de données
    """
    conn = psycopg2.connect(
        host="localhost",
        database="maintenance_predictive",
        user="admin",
        password="password"
    )
    
    query = """
        SELECT 
            sm.pc_id,
            sm.cpu_percent,
            sm.memory_percent,
            sm.disk_percent,
            sm.temperature,
            sm.uptime_seconds,
            sm.error_logs,
            -- Calculer si une panne est survenue dans les 30 jours
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM maintenance_interventions mi
                    WHERE mi.pc_id = sm.pc_id
                    AND mi.intervention_date BETWEEN sm.timestamp AND sm.timestamp + INTERVAL '30 days'
                    AND mi.type = 'corrective'
                ) THEN 1
                ELSE 0
            END as panne_30j
        FROM system_metrics sm
        WHERE sm.timestamp < NOW() - INTERVAL '30 days'
    """
    
    df = pd.read_sql(query, conn)
    conn.close()
    
    return df

def engineer_features(df):
    """
    Crée des features supplémentaires pour améliorer le modèle
    """
    # Calculer des statistiques sur les 7 derniers jours
    df['cpu_mean_7d'] = df.groupby('pc_id')['cpu_percent'].transform(
        lambda x: x.rolling(window=7*24, min_periods=1).mean()
    )
    
    df['cpu_std_7d'] = df.groupby('pc_id')['cpu_percent'].transform(
        lambda x: x.rolling(window=7*24, min_periods=1).std()
    )
    
    df['temp_max_7d'] = df.groupby('pc_id')['temperature'].transform(
        lambda x: x.rolling(window=7*24, min_periods=1).max()
    )
    
    # Calculer l'âge du PC (en jours)
    # df['age_days'] = ...
    
    return df

def train_model():
    """
    Entraîne le modèle de prédiction de pannes
    """
    print("📊 Chargement des données historiques...")
    df = load_historical_data()
    
    print("🔧 Feature engineering...")
    df = engineer_features(df)
    
    # Séparer les features (X) et la cible (y)
    features = [
        'cpu_percent', 'memory_percent', 'disk_percent', 
        'temperature', 'uptime_seconds', 'error_logs',
        'cpu_mean_7d', 'cpu_std_7d', 'temp_max_7d'
    ]
    
    X = df[features]
    y = df['panne_30j']
    
    # Séparer en train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("🤖 Entraînement du modèle...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Évaluation
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ Précision du modèle : {accuracy:.2%}")
    print("\n📊 Rapport de classification :")
    print(classification_report(y_test, y_pred))
    
    # Sauvegarder le modèle
    joblib.dump(model, 'model_prediction_pannes.pkl')
    print("💾 Modèle sauvegardé : model_prediction_pannes.pkl")
    
    return model

def predict_failure(pc_id):
    """
    Prédit si un PC va tomber en panne dans les 30 jours
    """
    # Charger le modèle
    model = joblib.load('model_prediction_pannes.pkl')
    
    # Récupérer les données récentes du PC
    conn = psycopg2.connect(
        host="localhost",
        database="maintenance_predictive",
        user="admin",
        password="password"
    )
    
    query = f"""
        SELECT 
            cpu_percent, memory_percent, disk_percent,
            temperature, uptime_seconds, error_logs
        FROM system_metrics
        WHERE pc_id = '{pc_id}'
        ORDER BY timestamp DESC
        LIMIT 1
    """
    
    df = pd.read_sql(query, conn)
    conn.close()
    
    if df.empty:
        return {"error": "Pas de données pour ce PC"}
    
    # Feature engineering
    df = engineer_features(df)
    
    # Prédiction
    X = df[['cpu_percent', 'memory_percent', 'disk_percent', 
            'temperature', 'uptime_seconds', 'error_logs',
            'cpu_mean_7d', 'cpu_std_7d', 'temp_max_7d']]
    
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]  # Probabilité de panne
    
    result = {
        "pc_id": pc_id,
        "prediction": "Panne probable" if prediction == 1 else "OK",
        "probability": float(probability),
        "risk_level": "Élevé" if probability > 0.7 else "Moyen" if probability > 0.4 else "Faible"
    }
    
    return result

if __name__ == "__main__":
    # Entraîner le modèle
    train_model()
    
    # Tester une prédiction
    result = predict_failure("PC-001")
    print(f"\n🔮 Prédiction pour PC-001 :")
    print(result)
```

---

### 4. Dashboard Web (Frontend)

**Rôle :** Interface pour visualiser les données et les prédictions

**Technologies :**
- React.js ou Vue.js
- Chart.js (graphiques)
- Axios (appels API)

**Fonctionnalités :**
- Vue d'ensemble du parc (nombre de PC, statut)
- Liste des PC avec score de santé
- Alertes de pannes prédites
- Graphiques d'évolution (CPU, RAM, température)
- Historique des interventions

---

## 📊 Flux de Données Complet

```
1. COLLECTE (Toutes les heures)
   ┌──────────────────────────────────────┐
   │ Agent sur PC-001                     │
   │ - Lit CPU: 65%                       │
   │ - Lit RAM: 80%                       │
   │ - Lit Température: 72°C              │
   │ - Lit SMART disque: 88%              │
   └──────────────────────────────────────┘
                    ↓
2. ENVOI
   ┌──────────────────────────────────────┐
   │ POST /api/data                       │
   │ {                                    │
   │   "pc_id": "PC-001",                 │
   │   "cpu_percent": 65,                 │
   │   "memory_percent": 80,              │
   │   "temperature": 72,                 │
   │   "smart_health": 88                 │
   │ }                                    │
   └──────────────────────────────────────┘
                    ↓
3. STOCKAGE
   ┌──────────────────────────────────────┐
   │ Base de Données PostgreSQL           │
   │ Table: system_metrics                │
   │ - Insertion des données              │
   │ - Historique conservé                │
   └──────────────────────────────────────┘
                    ↓
4. ANALYSE IA (Quotidienne)
   ┌──────────────────────────────────────┐
   │ Service IA                           │
   │ - Charge les données de PC-001       │
   │ - Applique le modèle ML              │
   │ - Calcule: Probabilité panne = 82%   │
   │ - Génère une alerte                  │
   └──────────────────────────────────────┘
                    ↓
5. ALERTE
   ┌──────────────────────────────────────┐
   │ Notification                         │
   │ ⚠️ PC-001 risque de tomber en panne  │
   │    dans les 15 jours (82%)           │
   │                                      │
   │ Action recommandée:                  │
   │ Remplacer le disque dur              │
   └──────────────────────────────────────┘
                    ↓
6. VISUALISATION
   ┌──────────────────────────────────────┐
   │ Dashboard Web                        │
   │ - Liste des alertes                  │
   │ - Graphiques d'évolution             │
   │ - Recommandations                    │
   └──────────────────────────────────────┘
```

---

## 🚀 Plan d'Implémentation

### Phase 1 : Adapter ton programme (Semaines 1-2)
1. Extraire la logique de collecte de ton programme
2. Créer l'agent léger (sans interface graphique)
3. Ajouter l'envoi vers le serveur (API REST)
4. Tester sur 2-3 PC

### Phase 2 : Développer le serveur (Semaines 3-4)
1. Créer l'API REST (FastAPI)
2. Créer la base de données (PostgreSQL)
3. Tester la réception des données

### Phase 3 : Développer l'IA (Semaines 5-8)
1. Collecter des données historiques (ou simuler)
2. Entraîner le modèle de prédiction
3. Intégrer le modèle au serveur
4. Tester les prédictions

### Phase 4 : Développer le dashboard (Semaines 9-12)
1. Créer l'interface web
2. Afficher les données en temps réel
3. Afficher les prédictions et alertes
4. Créer les graphiques

### Phase 5 : Tests et déploiement (Semaines 13-16)
1. Tests sur le parc réel
2. Corrections et optimisations
3. Documentation
4. Formation des utilisateurs

---

## 💡 Résumé

**Ton programme "PC Technician Assistant" est une excellente base !**

✅ **Ce que tu gardes :**
- La logique de collecte (psutil)
- Les fonctions de scan système
- La génération de rapports

✅ **Ce que tu ajoutes :**
- Envoi automatique vers un serveur
- Exécution en arrière-plan
- Collecte périodique
- Serveur central
- Intelligence artificielle
- Dashboard web

✅ **Résultat final :**
Un système complet de maintenance prédictive qui surveille 100+ PC, prédit les pannes, et alerte les techniciens avant que les problèmes arrivent !

---

**Questions ? Besoin de plus de détails sur une partie spécifique ?** 🚀
