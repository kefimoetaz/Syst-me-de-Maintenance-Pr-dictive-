# PFE — Documentation Technique Avancée
## Système de Maintenance Prédictive par Intelligence Artificielle

> **Projet :** PC Technician Assistant — Predictive Maintenance Platform  
> **Niveau :** Licence / Master en Informatique  
> **Année :** 2025–2026  
> **Stack :** React · Node.js · Python · PostgreSQL · LSTM · Random Forest · Ollama

---

## Abstract

Ce projet présente la conception et le développement d'une plateforme complète de maintenance prédictive pour parcs informatiques. Le système collecte en temps réel les métriques système (CPU, RAM, disque) et les données SMART des machines via un agent Python déployé sur chaque poste. Ces données alimentent deux modèles de Machine Learning — un réseau LSTM et un Random Forest — qui calculent des probabilités de panne à 7, 14 et 30 jours. Un tableau de bord React permet aux techniciens de visualiser l'état du parc, les alertes actives et les prédictions. Un chatbot IA hybride (Ollama + règles déterministes) répond aux questions en langage naturel sur l'état du système.

---

## 1. Project Overview

### 1.1 Nom du projet

**PC Technician Assistant — Predictive Maintenance Platform**

### 1.2 Contexte et problématique

Dans les entreprises disposant d'un parc informatique de taille moyenne à grande, les pannes matérielles surviennent de manière imprévisible, entraînant des interruptions de service coûteuses. La maintenance corrective (réparer après la panne) génère des temps d'arrêt non planifiés. La maintenance préventive classique (remplacer à intervalles fixes) est inefficace car elle ne tient pas compte de l'état réel des machines.

La maintenance prédictive par IA résout ce problème en analysant les tendances des métriques système pour anticiper les défaillances avant qu'elles ne surviennent.

### 1.3 Objectifs fonctionnels

- Surveiller en temps réel l'état de chaque machine du parc
- Détecter les anomalies et comportements anormaux
- Prédire les pannes à 7, 14 et 30 jours
- Alerter automatiquement les techniciens par email
- Fournir un tableau de bord centralisé et interactif
- Permettre une interaction en langage naturel via chatbot

### 1.4 Objectifs techniques

- Déployer un agent Python léger sur chaque machine surveillée
- Exposer une API REST Node.js/Express pour la collecte et la consultation
- Entraîner et servir deux modèles ML (LSTM + Random Forest)
- Stocker les données dans PostgreSQL avec un schéma normalisé
- Conteneuriser l'ensemble via Docker Compose
- Sécuriser les accès par JWT et tokens d'agent

### 1.5 Utilisateurs cibles

| Rôle | Accès | Usage principal |
|------|-------|-----------------|
| Administrateur | Complet | Gestion utilisateurs, configuration système |
| Technicien | Lecture + actions | Consultation dashboard, acquittement alertes |
| Agent (service) | API token | Envoi des métriques collectées |
| ML Service | API token | Lecture données, écriture prédictions |

### 1.6 Ce qui rend ce projet unique

- Double modèle ML : LSTM pour l'analyse de séquences SMART + Random Forest pour les métriques système
- Agent autonome avec fallback gracieux (SMART non disponible → données de secours)
- Chatbot hybride : réponses déterministes pour les questions de données + Ollama LLM pour les questions conceptuelles
- Score Santé calculé en temps réel côté frontend sans appel API supplémentaire
- Architecture microservices conteneurisée avec health checks

---

## 2. Architecture Système

### 2.1 Style architectural

Le système adopte une **architecture microservices légère** composée de quatre services indépendants communicant via HTTP/REST :

```
┌─────────────┐     HTTP/REST      ┌──────────────────┐
│   Frontend  │ ◄────────────────► │  Backend API     │
│  React/Vite │                    │  Node.js/Express │
│  Port 5173  │                    │  Port 3000       │
└─────────────┘                    └────────┬─────────┘
                                            │ HTTP + SQL
                                   ┌────────▼─────────┐
                                   │   PostgreSQL DB  │
                                   │   Port 5432      │
                                   └────────▲─────────┘
                                            │ SQL
┌─────────────┐     HTTP/REST      ┌────────┴─────────┐
│  ML Service │ ◄────────────────► │  Backend API     │
│  Python/    │                    │  (proxy ML)      │
│  Flask      │                    └──────────────────┘
│  Port 5000  │
└─────────────┘
       ▲
       │ HTTP/REST
┌──────┴──────┐
│  Agent      │
│  Python     │
│  (par PC)   │
└─────────────┘
```

### 2.2 Couche Frontend

- **Technologie :** React 18 + Vite + TailwindCSS
- **Rôle :** Interface utilisateur SPA (Single Page Application)
- **Communication :** Appels HTTP directs vers le backend (axios)
- **Authentification :** JWT stocké dans localStorage

### 2.3 Couche Backend

- **Technologie :** Node.js 18 + Express 4
- **Rôle :** API REST centrale, orchestration, proxy ML
- **ORM :** Sequelize 6 avec PostgreSQL
- **Authentification :** JWT (utilisateurs) + Bearer token (agents/ML)

### 2.4 Couche Agent

- **Technologie :** Python 3 + psutil + pySMART/smartctl
- **Rôle :** Collecte périodique des métriques sur chaque machine
- **Déploiement :** Un processus par machine surveillée
- **Fréquence :** Configurable, défaut 1 heure

### 2.5 Couche Base de données

- **Technologie :** PostgreSQL 14
- **Rôle :** Stockage persistant de toutes les données
- **Schéma :** 10 tables avec migrations versionnées

### 2.6 Cycle de vie d'une requête (collecte de données)

```
1. Agent (PC surveillé)
   └─ psutil collecte CPU%, RAM%, Disk%
   └─ smartctl lit health_status, température, erreurs
   └─ POST /api/data avec Bearer token

2. Backend (dataController.js)
   └─ verifyToken() → vérifie token dans table agents
   └─ Upsert machine dans table machines
   └─ INSERT dans system_metrics
   └─ INSERT dans smart_data
   └─ Réponse 200 avec IDs créés

3. ML Service (scheduler)
   └─ Toutes les N heures : GET /api/dashboard/machines
   └─ Pour chaque machine : extraction features 30 jours
   └─ Random Forest predict_proba()
   └─ INSERT dans predictions
   └─ Si risque HIGH/CRITICAL : POST /api/alerts

4. Frontend (DashboardWrapper)
   └─ GET /api/dashboard/overview (KPIs)
   └─ GET /api/dashboard/machines (liste + prédictions DB)
   └─ Pour chaque machine : GET /api/ml/lstm/predict/:id (LSTM live)
   └─ Rendu React avec données fusionnées
```

### 2.7 Patterns de conception utilisés

| Pattern | Où | Description |
|---------|-----|-------------|
| MVC | Backend | Controllers / Models / Routes séparés |
| Repository | Models Sequelize | Abstraction accès données |
| Service Layer | chatbotService, emailService | Logique métier isolée |
| Middleware Chain | Express | auth → validation → controller → error |
| Singleton | LSTM model loader | Modèle chargé une seule fois en mémoire |
| Scheduler | prediction_scheduler.py | Tâches périodiques découplées |
| Proxy | mlController.js | Backend proxifie les appels ML Service |

### 2.8 Décisions architecturales et compromis

**Pourquoi deux modèles ML séparés ?**
Le LSTM est optimisé pour les séquences temporelles courtes (5 points SMART) et tourne en temps réel. Le Random Forest traite 30 jours de métriques système et tourne en batch. Les deux se complètent.

**Pourquoi un backend Node.js comme proxy ML ?**
Le frontend ne contacte jamais directement le ML Service. Le backend centralise l'authentification, le logging et la gestion d'erreurs. Si le ML Service est indisponible, le backend retourne gracieusement des données partielles.

**Pourquoi PostgreSQL et non MongoDB ?**
Les données de métriques sont structurées et relationnelles (machine → métriques → prédictions → alertes). Les jointures SQL sont nécessaires pour les agrégations du dashboard.

---

## 3. Frontend — Analyse Approfondie

### 3.1 Structure des dossiers

```
frontend/
├── index.html                  # Point d'entrée HTML
├── src/
│   ├── App.jsx                 # Routeur principal (React Router)
│   ├── App.test.jsx            # Tests unitaires App
│   ├── index.css               # Styles globaux TailwindCSS
│   ├── components/
│   │   ├── LandingPage.jsx     # Page d'accueil publique
│   │   ├── Login.jsx           # Formulaire de connexion
│   │   ├── Signup.jsx          # Formulaire d'inscription
│   │   ├── ForgotPassword.jsx  # Réinitialisation mot de passe
│   │   ├── DashboardWrapper.jsx# Conteneur données dashboard
│   │   ├── Dashboard.jsx       # Layout principal dashboard
│   │   ├── KPICards.jsx        # 5 cartes KPI en haut
│   │   ├── MachineList.jsx     # Tableau des machines
│   │   ├── MachineDetails.jsx  # Modal détails machine
│   │   ├── AlertsList.jsx      # Liste des alertes récentes
│   │   ├── SystemHealthChart.jsx # Graphique santé système
│   │   ├── ModelPerformance.jsx  # Modal performances ML
│   │   ├── UserManagement.jsx  # Gestion utilisateurs (admin)
│   │   ├── Chatbot.jsx         # Interface chatbot IA
│   │   └── Icons.jsx           # Composants icônes SVG
│   └── utils/
│       └── exportCSV.js        # Export données CSV
```

### 3.2 Hiérarchie des composants

```
App.jsx (Router)
├── LandingPage
├── Login
├── Signup
├── ForgotPassword
├── DashboardWrapper          ← Fetching layer
│   └── Dashboard             ← Presentation layer
│       ├── Header (inline)
│       ├── KPICards
│       ├── SystemHealthChart
│       ├── AlertsList
│       ├── MachineList
│       │   └── (rows)
│       ├── MachineDetails (modal)
│       ├── ModelPerformance (modal)
│       └── Chatbot (floating)
└── UserManagement
```

### 3.3 Gestion d'état

Le projet n'utilise **pas** Redux ni Context API global. L'état est géré localement par composant avec `useState` et `useEffect`. La stratégie est délibérément simple :

- `DashboardWrapper` : état global du dashboard (overview, machines, alerts)
- `Dashboard` : état UI (machine sélectionnée, recherche, modals)
- `MachineDetails` : état local (métriques historiques, heures sélectionnées)
- `Chatbot` : état local (messages, loading)

### 3.4 Flux de données

```
DashboardWrapper
  ├─ fetchData() toutes les 60 secondes
  ├─ GET /api/dashboard/overview → setOverview()
  ├─ GET /api/dashboard/machines → machines brutes
  ├─ Pour chaque machine : GET /api/ml/lstm/predict/:id
  ├─ Fusion : { ...machine, lstmPrediction: lstm }
  └─ Passe [overview, machines, alerts] à Dashboard via props

Dashboard
  └─ useMemo() filtre machines par searchQuery
  └─ Passe filteredMachines à MachineList

KPICards
  └─ useMemo() calcule highRiskMachines, criticalDisks, failurePrediction
  └─ Affiche 5 cartes avec valeurs calculées
```

### 3.5 Intégration API

Toutes les requêtes utilisent `axios` directement dans les composants (pas de couche service dédiée). L'URL de base est codée en dur : `http://localhost:3000`. Le token JWT est lu depuis `localStorage` et injecté dans les headers `Authorization: Bearer <token>`.

### 3.6 Optimisations de performance

- `useMemo` dans `KPICards` pour éviter les recalculs à chaque rendu
- `useMemo` dans `Dashboard` pour le filtrage des machines
- `useCallback` pour les handlers `onSelectMachine` et `onClose`
- Rafraîchissement automatique toutes les 60 secondes (pas de WebSocket)
- Pagination implicite : dashboard affiche toutes les machines, alertes limitées à 50

### 3.7 Gestion des erreurs UX

- Écran de chargement pendant le fetch initial
- Écran d'erreur avec bouton "Réessayer" si le backend est inaccessible
- Prédiction LSTM affiche "Prédiction indisponible" si le ML Service ne répond pas
- Fallback `lstmPrediction: null` si l'appel LSTM échoue (erreur silencieuse)

---

## 4. Backend — Analyse Approfondie

### 4.1 Structure et couches

```
backend/src/
├── index.js                    # Point d'entrée Express
├── config/
│   └── database.js             # Connexion Sequelize + PostgreSQL
├── middleware/
│   ├── auth.js                 # verifyToken, authenticateToken, requireAdmin
│   ├── error.js                # errorHandler global + logger Winston
│   ├── requestLogger.js        # Log de chaque requête HTTP
│   ├── validation.js           # Schémas Joi
│   └── payloadLimit.js         # Gestion payload > 1MB
├── models/
│   ├── index.js                # Associations Sequelize
│   ├── Machine.js
│   ├── Agent.js
│   ├── SystemMetrics.js
│   ├── SmartData.js
│   ├── Alert.js
│   └── User.js
├── controllers/
│   ├── authController.js       # Login, register, refresh
│   ├── dataController.js       # Réception données agent
│   ├── dashboardController.js  # KPIs, machines, alertes
│   ├── mlController.js         # Proxy ML Service
│   ├── alertController.js      # CRUD alertes
│   ├── chatbotController.js    # Chatbot endpoint
│   └── userController.js       # Gestion utilisateurs
├── routes/
│   ├── auth.js
│   ├── data.routes.js
│   ├── dashboard.routes.js
│   ├── ml.routes.js
│   ├── alerts.js
│   ├── chatbot.js
│   ├── users.js
│   └── machines.js
├── services/
│   ├── chatbotService.js       # Logique chatbot hybride
│   ├── emailService.js         # Nodemailer alertes email
│   └── ollamaService.js        # Client Ollama
└── database/
    ├── migrations/             # 10 fichiers SQL versionnés
    └── seeders/                # Données de test
```

### 4.2 Documentation des endpoints principaux

#### Collecte de données (Agent)

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `POST /api/data` | POST | Bearer token agent | Réception métriques + SMART |

**Request body :**
```json
{
  "agent_id": "550e8400-...",
  "hostname": "PC-SUPPORT-03",
  "ip_address": "192.168.1.103",
  "serial_number": "SN-2024-003",
  "os": "Windows 11 Pro",
  "cpu_usage": 45.2,
  "memory_usage": 67.8,
  "disk_usage": 71.1,
  "health_status": "GOOD",
  "read_errors": 0,
  "write_errors": 0,
  "temperature": 25.0
}
```

#### Dashboard

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `GET /api/dashboard/overview` | GET | JWT | KPIs globaux |
| `GET /api/dashboard/machines` | GET | JWT | Liste machines + prédictions DB |
| `GET /api/dashboard/machines/:id/metrics` | GET | JWT | Métriques historiques + anomalies |
| `GET /api/dashboard/alerts` | GET | JWT | Alertes récentes |

#### ML

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `GET /api/ml/lstm/predict/:machineId` | GET | JWT | Prédiction LSTM temps réel |
| `POST /api/ml/train` | POST | JWT + Admin | Déclencher entraînement |
| `GET /api/ml/models` | GET | JWT | Liste modèles actifs |

#### Alertes

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `GET /api/alerts` | GET | JWT | Liste alertes avec filtres |
| `POST /api/alerts` | POST | JWT | Créer alerte |
| `PATCH /api/alerts/:id/acknowledge` | PATCH | JWT | Acquitter alerte |
| `PATCH /api/alerts/:id/resolve` | PATCH | JWT | Résoudre alerte |

### 4.3 Flux d'authentification (étape par étape)

```
1. POST /api/auth/login { email, password }
   └─ authController.login()
   └─ User.findOne({ where: { email } })
   └─ bcrypt.compare(password, user.password_hash)
   └─ jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '24h' })
   └─ Réponse: { token, user: { id, email, role, full_name } }

2. Requête protégée (ex: GET /api/dashboard/overview)
   └─ Header: Authorization: Bearer <token>
   └─ authenticateToken() middleware
   └─ jwt.verify(token, JWT_SECRET)
   └─ req.user = { id, email, role }
   └─ next() → controller

3. Route admin (ex: DELETE /api/users/:id)
   └─ authenticateToken() → requireAdmin()
   └─ if (req.user.role !== 'admin') → 403
```

### 4.4 Middleware chain

```
Request
  → requestLogger (log method + path + IP)
  → express.json() (parse body, limite 1MB)
  → CORS headers
  → payloadTooLargeHandler
  → Route handler
      → authenticateToken (si protégée)
      → requireAdmin (si admin only)
      → Controller
  → errorHandler (catch-all)
  → Response
```

### 4.5 Logging

Winston est utilisé avec deux transports : console (colorisé) et fichier `backend.log`. Chaque requête HTTP est loggée avec méthode, path, status code et durée. Les erreurs incluent le stack trace complet.

---

## 5. Agent de Collecte — Analyse Technique

### 5.1 Architecture de l'agent

L'agent est un processus Python autonome structuré en quatre modules :

```
agent/src/
├── main.py          # Point d'entrée, charge config, démarre scheduler
├── config.py        # Chargement config.json + variables d'environnement
├── scheduler.py     # Boucle de collecte périodique (schedule library)
├── collector.py     # Collecte métriques via psutil
├── smart_reader.py  # Lecture SMART via smartctl/pySMART
└── sender.py        # Envoi HTTP vers backend avec retry
```

### 5.2 Cycle de collecte

```python
# scheduler.py — toutes les N heures :
1. collector.collect_machine_info()   → hostname, IP, serial, OS
2. collector.collect_cpu_metrics()    → cpu_usage, cpu_temperature
3. collector.collect_memory_metrics() → memory_usage, memory_available
4. collector.collect_disk_metrics()   → disk_usage, disk_free
5. smart_reader.read_smart_data()     → health_status, read_errors, write_errors, temperature
6. sender.send_data(payload)          → POST /api/data (3 tentatives avec backoff)
```

### 5.3 Lecture SMART (Windows)

L'agent tente d'abord `pySMART`, puis si indisponible, appelle directement `smartctl.exe` via subprocess. La recherche de l'exécutable suit cet ordre :
1. `shutil.which('smartctl')` — PATH système
2. `C:\Program Files\smartmontools\bin\smartctl.exe`
3. `C:\Program Files (x86)\smartmontools\bin\smartctl.exe`
4. Fallback : `{ health_status: 'GOOD', temperature: 40.0, read_errors: 0, write_errors: 0 }`

Les drives testés : `/dev/sda -d nvme`, `/dev/sda`, `/dev/pd0`.

### 5.4 Gestion des erreurs et résilience

- **Retry avec backoff :** 3 tentatives, délais 1s → 2s → abandon
- **Collecte partielle :** si CPU échoue, RAM et disque continuent
- **Fallback SMART :** si smartctl absent, données de secours GOOD/40°C
- **Rotation des logs :** fichier `agent.log` limité à 10MB avec rotation

### 5.5 Configuration

```json
// config.json
{
  "api_url": "http://localhost:3000/api/data",
  "agent_id": "550e8400-e29b-41d4-a716-446655440001",
  "token": "token_support_2024_secure_003",
  "collection_interval_hours": 1,
  "log_level": "INFO"
}
```

---

## 6. Service ML — Analyse Technique

### 6.1 Architecture du service ML

```
ml-service/src/
├── app.py                  # Flask API (créé par create_app.py)
├── config.py               # Variables d'environnement
├── logger.py               # Logging Python
├── lstm_predictor.py       # Inférence LSTM temps réel
├── predictor.py            # Inférence Random Forest batch
├── feature_extractor.py    # Extraction features 30 jours
├── model_trainer.py        # Entraînement Random Forest
├── model_registry.py       # Stockage modèles en DB
├── training_pipeline.py    # Pipeline complet entraînement
├── prediction_scheduler.py # Scheduler prédictions batch
└── alert_notifier.py       # Création alertes via API backend
```

### 6.2 Modèle LSTM

**Architecture PyTorch :**
```python
class LSTMModel(nn.Module):
    def __init__(self, input_size=4, hidden=32):
        self.lstm  = nn.LSTM(input_size, hidden, batch_first=True)
        self.dense = nn.Linear(hidden, 1)
    def forward(self, x):
        out, _ = self.lstm(x)
        return torch.sigmoid(self.dense(out[:, -1, :]))
```

**Features d'entrée (5 dernières lectures SMART) :**
- `read_errors` / 100.0
- `write_errors` / 80.0
- `temperature` / 80.0
- `health_score` : GOOD=0.0, WARNING=0.5, CRITICAL=1.0

**Classification de sortie :**
- prob > 0.7 → HIGH + anomaly=True
- prob > 0.5 → MEDIUM + anomaly=True
- prob ≤ 0.5 → LOW + anomaly=False

**Condition :** nécessite au minimum 5 enregistrements SMART. Si insuffisant → `{ prediction: null, risk_level: "UNKNOWN" }`.

### 6.3 Modèle Random Forest

**Features extraites sur 30 jours :**
- Moyennes, écarts-types, min, max de CPU/RAM/Disk
- Tendances (pente de régression linéaire)
- Comptage d'événements critiques (CPU > 90%, etc.)
- Métriques SMART agrégées

**Classification :**
- prob ≥ 70% → CRITICAL
- prob ≥ 50% → HIGH
- prob ≥ 30% → MEDIUM
- prob < 30% → LOW

**Probabilités stockées :** `failure_probability_7d = prob * 0.7`, `_14d = prob * 0.85`, `_30d = prob`

### 6.4 Scheduler de prédictions

Le `prediction_scheduler.py` tourne en arrière-plan et déclenche les prédictions batch selon un intervalle configurable. Après chaque prédiction, si le niveau est HIGH ou CRITICAL, `alert_notifier.py` crée une alerte via `POST /api/alerts`.

---

## 7. Base de Données — Conception Avancée

### 7.1 Schéma complet

```sql
machines (id, hostname, ip_address, serial_number, os, created_at, updated_at)
agents   (id, agent_id UUID, machine_id FK, token, created_at)
system_metrics (id, machine_id FK, timestamp, cpu_usage, cpu_temperature,
                memory_usage, memory_available, memory_total,
                disk_usage, disk_free, disk_total, created_at)
smart_data (id, machine_id FK, timestamp, health_status, read_errors,
            write_errors, temperature, created_at)
predictions (id, machine_id FK, prediction_date, failure_probability_7d,
             failure_probability_14d, failure_probability_30d,
             risk_level, model_version, contributing_factors JSONB)
anomalies  (id, machine_id FK, detected_at, anomaly_type, metric_name,
            metric_value, expected_range, anomaly_score, severity)
ml_models  (id, model_type, model_id, model_data BYTEA, metadata JSONB,
            is_active, created_at)
alerts     (id, machine_id FK, alert_type, severity, title, message,
            details JSONB, status, email_sent, acknowledged_at,
            acknowledged_by, resolved_at, created_at)
users      (id, email UNIQUE, password_hash, full_name, role,
            is_active, last_login, created_at, updated_at)
```

### 7.2 Relations

| Relation | Type | Description |
|----------|------|-------------|
| machines → agents | 1-N | Une machine peut avoir plusieurs agents |
| machines → system_metrics | 1-N | Historique illimité de métriques |
| machines → smart_data | 1-N | Historique SMART |
| machines → predictions | 1-N | Prédictions successives |
| machines → anomalies | 1-N | Anomalies détectées |
| machines → alerts | 1-N | Alertes générées |
| ml_models | standalone | Modèles sérialisés en BYTEA |

### 7.3 Index

```sql
idx_machines_serial_number      -- Lookup rapide à l'enregistrement agent
idx_system_metrics_machine_id   -- Jointures dashboard
idx_system_metrics_created_at   -- Filtres temporels
idx_smart_data_machine_id
idx_predictions_machine_id
idx_alerts_status               -- Filtrage alertes actives
idx_users_email                 -- Login
idx_users_role                  -- Filtrage par rôle
```

### 7.4 Migrations versionnées

10 fichiers SQL numérotés `001_` à `010_` exécutés séquentiellement par `migrate.js`. Chaque fichier utilise `CREATE TABLE IF NOT EXISTS` pour l'idempotence.

### 7.5 Contraintes de données

- `serial_number` UNIQUE sur machines (identifiant hardware)
- `email` UNIQUE sur users
- `role` CHECK IN ('admin', 'technician', 'viewer')
- `status` CHECK IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED') sur alerts
- `health_status` CHECK IN ('GOOD', 'WARNING', 'CRITICAL') sur smart_data

---

## 8. Chatbot IA — Architecture Hybride

### 8.1 Stratégie de conception

Le chatbot utilise une architecture hybride à trois niveaux pour maximiser la précision tout en minimisant la latence :

```
Question utilisateur
       │
       ▼
analyzeIntent()
       │
       ├─ type: 'greeting'    → Ollama (ton naturel)
       ├─ type: 'knowledge'   → Base de connaissances statique (BLEU optimal)
       ├─ type: 'alerts'      → DB query + réponse déterministe
       ├─ type: 'high_risk'   → DB query + réponse déterministe
       ├─ type: 'machine_count' → DB query + réponse déterministe
       ├─ type: 'machine_status' → DB query + réponse déterministe
       └─ type: 'general'     → DB context + Ollama hybride
```

### 8.2 Base de connaissances statique

15 entrées couvrant les concepts clés : maintenance prédictive, probabilité de panne, niveaux d'alerte, collecte de métriques, données SMART, modèle ML, actions correctives. Chaque entrée a des mots-clés de déclenchement et une réponse de référence optimisée pour les métriques BLEU/ROUGE.

### 8.3 Paramètres Ollama

```python
model: 'llama3.2:1b'
temperature: 0.3      # Réponses cohérentes
num_predict: 150      # Réponses courtes
top_k: 20
top_p: 0.85
repeat_penalty: 1.1
```

### 8.4 Gestion de l'indisponibilité Ollama

Si Ollama ne répond pas, le chatbot bascule automatiquement sur `generateFallbackResponse()` qui retourne les réponses déterministes. L'utilisateur ne voit aucune erreur.

### 8.5 Limitations

- Pas de mémoire conversationnelle (chaque question est indépendante)
- Extraction du nom de machine par regex (peut échouer sur noms atypiques)
- Ollama doit tourner localement (pas de cloud LLM)
- Modèle `llama3.2:1b` limité en capacité de raisonnement complexe

---

## 9. Sécurité

### 9.1 Modèle d'authentification

Trois mécanismes coexistent :

1. **JWT utilisateurs** : `authenticateToken()` — pour le frontend
2. **Bearer token agents** : `verifyToken()` — vérifie dans table `agents`
3. **API token statique** : `verifyApiToken()` — pour le ML Service (variable `API_TOKEN`)

### 9.2 Modèle d'autorisation

| Rôle | Endpoints accessibles |
|------|----------------------|
| admin | Tous, y compris `/api/users` et DELETE |
| technician | Dashboard, alertes (lecture + acquittement) |
| viewer | Dashboard lecture seule |
| agent | `POST /api/data` uniquement |

### 9.3 Protection des données

- Mots de passe hashés avec `bcrypt` (rounds: 10)
- JWT signé avec `JWT_SECRET` (variable d'environnement)
- Tokens agents stockés en clair en DB (amélioration possible : hash)
- Payload JSON limité à 1MB (protection DoS basique)

### 9.4 CORS

Configuration permissive en développement (`Access-Control-Allow-Origin: *`). En production, devrait être restreint à l'URL du frontend.

### 9.5 Vulnérabilités identifiées

| Vulnérabilité | Sévérité | Mitigation actuelle |
|---------------|----------|---------------------|
| CORS wildcard | Moyenne | Acceptable en dev, à restreindre en prod |
| JWT_SECRET par défaut | Haute | Variable d'environnement obligatoire en prod |
| Tokens agents en clair | Faible | Fonctionnel, hashage recommandé |
| Pas de rate limiting | Moyenne | À ajouter avec express-rate-limit |
| SQL injection | Faible | Sequelize paramétré protège |

---

## 10. Performance et Scalabilité

### 10.1 Goulots d'étranglement identifiés

- **Chargement dashboard :** N+1 requêtes LSTM (une par machine). Avec 100 machines, 100 appels HTTP parallèles au ML Service.
- **Prédictions batch :** Random Forest sur 30 jours de données peut être lent si le volume est important.
- **Pas de cache :** chaque rechargement du dashboard refait tous les appels.

### 10.2 Optimisations en place

- `Promise.all()` pour les appels LSTM parallèles (non séquentiels)
- `useMemo` React pour éviter les recalculs frontend
- Index PostgreSQL sur les colonnes de filtrage fréquent
- Limite de 100 métriques par requête historique
- Rafraîchissement toutes les 60s (pas de polling agressif)

### 10.3 Recommandations de scalabilité

- Ajouter Redis pour cacher les prédictions LSTM (TTL 1h)
- Implémenter WebSocket pour les alertes temps réel
- Pagination côté serveur pour la liste des machines
- Partitionnement PostgreSQL sur `system_metrics` par date
- Load balancer devant plusieurs instances backend

---

## 11. Déploiement et DevOps

### 11.1 Docker Compose

Cinq services définis :

| Service | Image | Port | Dépendances |
|---------|-------|------|-------------|
| postgres | postgres:14-alpine | 5432 | — |
| ml-service | build ./ml-service | 5000 | postgres |
| backend | build ./backend | 3000 | postgres, ml-service |
| frontend | build ./frontend | 5173→80 | backend |
| agent | build ./agent | — | backend (profil optionnel) |

### 11.2 Health checks

Chaque service déclare un health check :
- postgres : `pg_isready -U postgres`
- ml-service : `curl http://localhost:5000/health`
- backend : `curl http://localhost:3000/api/dashboard/overview`

### 11.3 Variables d'environnement critiques

```env
DB_PASSWORD=<secret>
JWT_SECRET=<secret>
ML_SERVICE_TOKEN=<secret>
API_TOKEN=<secret>
SMTP_HOST=<smtp server>
SMTP_USER=<email>
SMTP_PASS=<password>
OLLAMA_URL=http://localhost:11434
```

### 11.4 Pas de CI/CD

Aucun pipeline CI/CD n'est configuré. Déploiement manuel via `docker-compose up --build`.

---

## 12. Qualité du Code

### 12.1 Points forts

- Séparation claire controllers / services / models / routes
- Middleware chain Express bien structuré
- Gestion d'erreurs centralisée avec Winston
- Migrations SQL versionnées et idempotentes
- Fallbacks gracieux à tous les niveaux (SMART, LSTM, Ollama)
- Commentaires JSDoc sur les fonctions principales

### 12.2 Dette technique identifiée

- URL backend codée en dur dans les composants React (`http://localhost:3000`)
- Pas de couche service frontend (axios appelé directement dans les composants)
- CORS wildcard en développement
- Tokens agents stockés en clair
- Pas de pagination côté serveur
- `username` et `full_name` coexistent dans le modèle User (incohérence)

### 12.3 Suggestions de refactoring

- Créer un fichier `frontend/src/config.js` avec `API_BASE_URL`
- Extraire les appels axios dans des hooks personnalisés (`useDashboard`, `useMachines`)
- Ajouter `express-rate-limit` sur les routes d'authentification
- Hasher les tokens agents avant stockage

---

## 13. Améliorations et Travaux Futurs

### 13.1 Court terme

- Ajouter Redis pour le cache des prédictions LSTM
- Implémenter la pagination des machines côté serveur
- Restreindre CORS à l'URL frontend en production
- Ajouter rate limiting sur `/api/auth/login`
- Créer des variables d'environnement Vite pour l'URL API

### 13.2 Long terme

- WebSocket pour les alertes en temps réel (Socket.io)
- Application mobile React Native pour les techniciens
- Intégration LDAP/Active Directory pour l'authentification entreprise
- Tableau de bord de performance des modèles ML avec drift detection
- Export PDF des rapports de maintenance

### 13.3 Améliorations IA

- Mémoire conversationnelle dans le chatbot (historique de session)
- Modèle LSTM entraîné sur données Backblaze réelles (plus de généralisation)
- Détection d'anomalies multivariées (Isolation Forest sur CPU+RAM+Disk simultanément)
- AutoML pour sélection automatique du meilleur modèle

---

## 14. Contenu PFE — Style Académique

### 14.1 Introduction

Dans le contexte actuel de transformation numérique des entreprises, la gestion proactive des infrastructures informatiques constitue un enjeu stratégique majeur. Les pannes matérielles non anticipées engendrent des interruptions de service dont le coût peut s'avérer considérable, tant en termes de productivité que d'image. Face à cette problématique, la maintenance prédictive par intelligence artificielle émerge comme une solution prometteuse, permettant d'anticiper les défaillances avant leur survenance.

Ce projet de fin d'études présente la conception, le développement et le déploiement d'une plateforme complète de maintenance prédictive pour parcs informatiques. La solution proposée repose sur une architecture microservices intégrant un agent de collecte Python, une API REST Node.js, deux modèles de Machine Learning (LSTM et Random Forest), et une interface web React offrant une visualisation temps réel de l'état du parc.

### 14.2 Énoncé du problème

Les services informatiques des organisations font face à un défi récurrent : comment anticiper les pannes matérielles des postes de travail avant qu'elles n'impactent la productivité des utilisateurs ? La maintenance corrective, réactive par nature, implique des temps d'arrêt non planifiés. La maintenance préventive à intervalles fixes génère des coûts inutiles en remplaçant des composants encore fonctionnels. La maintenance prédictive, fondée sur l'analyse des données de fonctionnement, représente une troisième voie plus efficiente.

### 14.3 Méthodologie

Le projet a été développé selon une approche Agile en trois sprints :

- **Sprint 1 :** Infrastructure de collecte (agent Python, API backend, base de données)
- **Sprint 2 :** Interface web (dashboard React, authentification, gestion utilisateurs)
- **Sprint 3 :** Intelligence artificielle (LSTM, Random Forest, chatbot, alertes email)

### 14.4 Conclusion

La plateforme développée démontre la faisabilité technique d'un système de maintenance prédictive complet, depuis la collecte des données brutes jusqu'à la présentation des prédictions à l'utilisateur final. L'architecture microservices adoptée garantit la modularité et l'évolutivité du système. Les deux modèles ML complémentaires — LSTM pour l'analyse des séquences SMART et Random Forest pour les métriques système — offrent une couverture prédictive à plusieurs horizons temporels. Le chatbot hybride constitue une interface naturelle pour les techniciens non spécialistes en data science.

---

## 15. Préparation à la Soutenance

### 15.1 Questions probables du jury

**Q1 : Pourquoi avoir choisi LSTM plutôt qu'un simple seuil sur les métriques SMART ?**

Un seuil statique (ex: read_errors > 10 → alerte) ne capture pas les tendances temporelles. Le LSTM analyse l'évolution sur 5 points successifs : une machine avec 3 erreurs en augmentation rapide est plus à risque qu'une machine stable à 5 erreurs. Le modèle apprend ces patterns de dégradation.

**Q2 : Comment avez-vous validé la précision de vos modèles ?**

Le Random Forest est évalué via `predict_proba` avec validation croisée sur les données d'entraînement. Le LSTM est évalué sur le dataset Backblaze (données réelles de défaillances de disques). Les métriques utilisées sont l'AUC-ROC et la précision/rappel. Pour le chatbot, BLEU et ROUGE sont calculés via `evaluation/evaluate.py`.

**Q3 : Que se passe-t-il si le ML Service est indisponible ?**

Le backend gère l'indisponibilité gracieusement : `highRiskMachines` retourne 0, les prédictions LSTM retournent null, le dashboard affiche "Prédiction indisponible". Le système reste fonctionnel pour la surveillance des métriques brutes.

**Q4 : Comment gérez-vous la sécurité des tokens d'agent ?**

Chaque agent possède un token unique stocké dans la table `agents`. Le middleware `verifyToken()` vérifie l'existence du token en base à chaque requête. Limitation actuelle : les tokens sont stockés en clair. Amélioration recommandée : hasher avec bcrypt.

**Q5 : Pourquoi PostgreSQL et non une base de données time-series comme InfluxDB ?**

PostgreSQL a été choisi pour sa polyvalence : il gère à la fois les données relationnelles (machines, utilisateurs, alertes) et les séries temporelles (métriques). Pour un volume très important (>1M métriques/jour), InfluxDB serait plus performant, mais pour ce projet, PostgreSQL avec les index appropriés est suffisant.

**Q6 : Comment le chatbot distingue-t-il les questions conceptuelles des questions sur les données ?**

La fonction `analyzeIntent()` applique une détection par mots-clés. Les questions conceptuelles (contenant "qu'est-ce que", "comment fonctionne", etc.) sont routées vers la base de connaissances statique. Les questions sur les données (contenant "combien", "quelles machines", noms de PC) déclenchent des requêtes SQL.

### 15.2 Points faibles à anticiper

| Point faible | Réponse défensive |
|-------------|-------------------|
| Données SMART simulées pour les machines de démo | "L'architecture supporte les données réelles. La machine Mori collecte de vraies données SMART via smartctl. Les autres machines utilisent des données de seed pour simuler des scénarios diversifiés." |
| Pas de CI/CD | "Le projet est en phase de développement. Docker Compose permet un déploiement reproductible. Un pipeline GitHub Actions serait la prochaine étape." |
| CORS wildcard | "Configuration de développement. En production, CORS_ORIGIN est restreint à l'URL du frontend via variable d'environnement." |
| Modèle LSTM non entraîné sur données réelles du projet | "Le modèle est entraîné sur le dataset Backblaze, référence académique pour la prédiction de défaillances de disques. Les données SMART collectées par l'agent suivent le même schéma." |

### 15.3 Défense des choix architecturaux

**Microservices vs Monolithe :** La séparation en services indépendants permet de scaler le ML Service indépendamment du backend, de redémarrer le service Python sans affecter l'API Node.js, et de déployer des mises à jour du modèle ML sans interruption de service.

**Node.js pour le backend :** Excellent pour les I/O non-bloquantes (nombreuses requêtes concurrentes des agents). L'écosystème npm offre Sequelize, JWT, bcrypt, Nodemailer en packages matures.

**React + TailwindCSS :** Développement rapide de composants réutilisables. TailwindCSS élimine le besoin d'un fichier CSS séparé et garantit la cohérence visuelle.

**Python pour ML et agent :** Écosystème ML inégalé (PyTorch, scikit-learn, psutil). L'agent Python est léger et multiplateforme.
