# 🖥️ Système de Maintenance Prédictive par Intelligence Artificielle

> Plateforme complète de surveillance et maintenance prédictive pour parcs informatiques.
> Utilise LSTM + Random Forest pour anticiper les pannes matérielles avant qu'elles surviennent.

---

## 📋 Description

Ce système collecte en temps réel les métriques système (CPU, RAM, disque) et les données SMART des machines via un agent Python déployé sur chaque poste. Ces données alimentent deux modèles de Machine Learning qui calculent des probabilités de panne à 7, 14 et 30 jours. Un tableau de bord React permet aux techniciens de visualiser l'état du parc, les alertes actives et les prédictions. Un chatbot IA hybride (Ollama + règles déterministes) répond aux questions en langage naturel.

---

## 🏗️ Architecture

```
┌─────────────┐     HTTP/REST      ┌──────────────────┐
│   Frontend  │ ◄────────────────► │  Backend API     │
│  React/Vite │                    │  Node.js/Express │
│  Port 5173  │                    │  Port 3000       │
└─────────────┘                    └────────┬─────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │   PostgreSQL DB  │
                                   │   Port 5432      │
                                   └────────▲─────────┘
┌─────────────┐     HTTP/REST      ┌────────┴─────────┐
│  ML Service │ ◄────────────────► │  Backend (proxy) │
│  Python/    │                    └──────────────────┘
│  Flask 5000 │
└─────────────┘
       ▲
┌──────┴──────┐
│  Agent      │  ← runs on each monitored PC
│  Python     │
└─────────────┘
```

---

## 🛠️ Stack Technique

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TailwindCSS 3, Recharts, Axios |
| Backend | Node.js 20+, Express 4, Sequelize ORM, Winston |
| Database | PostgreSQL 14 |
| ML Service | Python 3.9+, Flask, PyTorch (LSTM), scikit-learn (Random Forest) |
| Agent | Python 3.9+, psutil, smartctl/pySMART, schedule |
| Chatbot | Ollama (llama3.2:1b) + deterministic rules |
| Auth | JWT (users) + Bearer tokens (agents/ML service) |
| Email | Nodemailer (SMTP) |
| Deployment | Docker Compose |

---

## 📊 Fonctionnalités

- [x] Collecte automatique CPU, RAM, Disque toutes les heures
- [x] Lecture données SMART disques (health_status, température, erreurs)
- [x] Prédiction LSTM — risque temps réel depuis séquences SMART
- [x] Prédiction Random Forest — probabilité panne 7/14/30 jours
- [x] Dashboard web responsive avec KPIs, graphiques, tableau machines
- [x] Système d'alertes ACTIVE → ACKNOWLEDGED → RESOLVED
- [x] Notifications email automatiques (HIGH/CRITICAL)
- [x] Chatbot IA en français (Ollama + fallback déterministe)
- [x] Authentification JWT avec rôles (admin / technician)
- [x] Gestion utilisateurs (admin uniquement)
- [x] Export CSV machines et alertes
- [x] Score Santé calculé en temps réel
- [x] Détection d'anomalies (Isolation Forest)
- [x] Déploiement Docker Compose complet

---

## 🚀 Installation

### Prérequis

- Node.js 20+
- Python 3.9+
- PostgreSQL 14+
- Git

### Option A — Docker (recommandé)

```bash
git clone <repository-url>
cd plateform
cp .env.example .env
# Éditez .env avec vos mots de passe
docker-compose up --build
```

Accès : http://localhost:5173

### Option B — Manuel

**Ordre de démarrage obligatoire :** PostgreSQL → Backend → ML Service → Frontend → Agent

#### 1. Base de données

```bash
createdb -U postgres maintenance_predictive
cd backend
npm install
node src/database/migrate.js
node src/database/seed.js
```

#### 2. Backend

```bash
cd backend
# Créez backend/.env (voir section Configuration)
npm start
# http://localhost:3000
```

#### 3. ML Service

```bash
cd ml-service
pip install -r requirements.txt
# Créez ml-service/.env (voir section Configuration)
python create_app.py
# http://localhost:5000
```

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

#### 5. Agent (sur chaque PC à surveiller)

```bash
cd agent
pip install -r requirements.txt
# Créez agent/config.json (voir section Configuration)
python src/main.py
```

#### 6. Chatbot IA (optionnel)

```bash
# Installer Ollama depuis https://ollama.com
ollama pull llama3.2:1b
ollama serve
# http://localhost:11434
```

---

## ⚙️ Configuration

### `backend/.env`

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maintenance_predictive
DB_USER=postgres
DB_PASSWORD=123
JWT_SECRET=your-super-secret-jwt-key
API_TOKEN=dev-token-12345
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_TOKEN=dev-token-12345
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
OLLAMA_URL=http://localhost:11434
```

### `ml-service/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maintenance_predictive
DB_USER=postgres
DB_PASSWORD=123
API_HOST=0.0.0.0
API_PORT=5000
API_TOKEN=dev-token-12345
MODEL_DIR=./models
LOG_LEVEL=INFO
```

### `agent/config.json`

```json
{
  "api_url": "http://localhost:3000/api/data",
  "agent_id": "550e8400-e29b-41d4-a716-446655440001",
  "token": "token_support_2024_secure_003",
  "collection_interval_hours": 1,
  "log_level": "INFO",
  "log_file": "agent.log",
  "max_log_size_mb": 10
}
```

> `agent_id` et `token` doivent correspondre à une ligne dans la table `agents` en base.

---

## 🔑 Identifiants par défaut

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@maintenance.com | admin123 | Administrateur |
| technicien@maintenance.com | tech123 | Technicien |

> Si la connexion échoue : `node backend/create-users.js`

---

## 🧠 Modèles ML

### LSTM (temps réel)

- Analyse les 5 dernières lectures SMART par machine
- Features : read_errors, write_errors, temperature, health_score
- Sortie : probabilité 0–1 → LOW / MEDIUM / HIGH
- Fichier : `ml-service/models/lstm_model.pth`

```bash
# Entraîner le LSTM
python train_lstm_schema.py
```

### Random Forest (batch quotidien)

- Analyse 30 jours de métriques système
- Sortie : failure_probability_7d / 14d / 30d + risk_level
- Fichier : `ml-service/models/random_forest_vX.joblib`

```bash
# Entraîner le Random Forest
cd ml-service
python -m src.training_pipeline
```

> Les modèles entraînés ne sont pas dans le repo (fichiers binaires volumineux).
> Sans modèle LSTM : affiche "Prédiction indisponible".
> Sans Random Forest : pas de prédictions dans la table predictions.

---

## 💿 Données SMART (Windows)

L'agent lit la santé réelle des disques via `smartctl`.
Sans installation, toutes les machines affichent `GOOD / 40°C` (fallback).

**Installation smartmontools :** https://www.smartmontools.org/wiki/Download

Vérification :
```bash
smartctl --scan
smartctl -H /dev/sda -d nvme   # NVMe
smartctl -H /dev/pd0           # HDD
```

L'agent détecte automatiquement `C:\Program Files\smartmontools\bin\smartctl.exe`.

---

## 🌱 Données de démo

Pour peupler le dashboard avec des machines de test :

```bash
cd backend
node src/database/seed.js                  # données de base
node seed-diverse-machines.js              # 15 machines variées
node seed-smart-data-all-machines.js       # historique SMART
node seed-lstm-model.js                    # enregistrement modèle ML en DB
```

---

## 🔌 Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3000 | http://localhost:3000 |
| ML Service | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| Ollama | 11434 | http://localhost:11434 |

---

## 📡 API — Endpoints principaux

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `POST /api/auth/login` | POST | — | Connexion utilisateur |
| `POST /api/data` | POST | Agent token | Envoi métriques agent |
| `GET /api/dashboard/overview` | GET | JWT | KPIs globaux |
| `GET /api/dashboard/machines` | GET | JWT | Liste machines + prédictions |
| `GET /api/ml/lstm/predict/:id` | GET | JWT | Prédiction LSTM temps réel |
| `GET /api/alerts` | GET | JWT | Liste alertes |
| `PATCH /api/alerts/:id/acknowledge` | PATCH | JWT | Acquitter alerte |
| `GET /api/chatbot/ask` | POST | JWT | Question chatbot |

---

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (rounds: 10)
- JWT signé avec `JWT_SECRET` (expiration 24h)
- Tokens agents vérifiés en base de données
- Payload JSON limité à 1MB
- Middleware de validation Joi sur les entrées
- Rôles : admin (accès complet) / technician (lecture + acquittement)

---

## 🐳 Docker

```bash
docker-compose up --build
```

Services : postgres, ml-service, backend, frontend
Agent optionnel : `docker-compose --profile with-agent up`

---


---

## 📄 Licence

Projet académique PFE — Licence Informatique 2025–2026. Tous droits réservés.
