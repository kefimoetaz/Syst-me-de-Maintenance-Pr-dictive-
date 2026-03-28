# Guide de Déploiement - Service ML de Maintenance Prédictive

## Table des Matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Démarrage des Services](#démarrage-des-services)
5. [Vérification](#vérification)
6. [Maintenance](#maintenance)
7. [Dépannage](#dépannage)

---

## Prérequis

### Logiciels Requis
- **Python 3.8+** - Langage de programmation
- **PostgreSQL 12+** - Base de données
- **Node.js 16+** - Pour le backend API
- **Git** - Contrôle de version

### Dépendances Système (Windows)
```powershell
# Installer Python depuis python.org
# Installer PostgreSQL depuis postgresql.org
# Installer Node.js depuis nodejs.org
```

### Dépendances Système (Linux/Mac)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv postgresql nodejs npm

# macOS (avec Homebrew)
brew install python postgresql node
```

---

## Installation

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd plateform
```

### 2. Configuration de la Base de Données

#### Créer la base de données
```sql
-- Se connecter à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE maintenance_predictive;

-- Créer un utilisateur (optionnel)
CREATE USER ml_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE maintenance_predictive TO ml_user;
```

#### Exécuter les migrations
```bash
cd backend
node src/database/create-db.js
node src/database/migrate.js
node src/database/seed.js
```

### 3. Installation du Service ML

#### Windows
```powershell
cd ml-service

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
.\venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt
```

#### Linux/Mac
```bash
cd ml-service

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 4. Installation du Backend Node.js
```bash
cd backend
npm install
```

### 5. Installation du Frontend React
```bash
cd frontend
npm install
```

### 6. Installation de l'Agent de Collecte
```bash
cd agent

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel (Windows)
.\venv\Scripts\Activate.ps1
# OU (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

---

## Configuration

### 1. Configuration du Service ML

Créer le fichier `.env` dans `ml-service/`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maintenance_predictive
DB_USER=postgres
DB_PASSWORD=123

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
API_TOKEN=dev-token-12345

# Model Configuration
MODEL_DIR=./models
MODEL_TYPE=random_forest

# Logging
LOG_LEVEL=INFO
LOG_FILE=ml-service.log

# Scheduler Configuration
PREDICTION_SCHEDULE_HOUR=2
PREDICTION_SCHEDULE_MINUTE=0
```

### 2. Configuration du Backend

Créer le fichier `.env` dans `backend/`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maintenance_predictive
DB_USER=postgres
DB_PASSWORD=123

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_TOKEN=dev-token-12345

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Configuration de l'Agent

Créer le fichier `config.json` dans `agent/`:
```json
{
  "api_url": "http://localhost:3000/api/data",
  "machine_id": 1,
  "collection_interval": 60,
  "batch_size": 10,
  "retry_attempts": 3,
  "retry_delay": 5
}
```

---

## Démarrage des Services

### Ordre de Démarrage Recommandé

#### 1. Démarrer le Service ML (Terminal 1)
```bash
cd ml-service
.\venv\Scripts\Activate.ps1  # Windows
# OU
source venv/bin/activate      # Linux/Mac

python -m src.app
```

Le service ML démarre sur `http://localhost:5000`

#### 2. Démarrer le Backend API (Terminal 2)
```bash
cd backend
npm start
```

Le backend démarre sur `http://localhost:3000`

#### 3. Démarrer le Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

#### 4. Démarrer l'Agent de Collecte (Terminal 4)
```bash
cd agent
.\venv\Scripts\Activate.ps1  # Windows
# OU
source venv/bin/activate      # Linux/Mac

python src/main.py
```

---

## Vérification

### 1. Vérifier le Service ML
```bash
# Test de santé
curl http://localhost:5000/health

# Lister les modèles
curl -H "Authorization: Bearer dev-token-12345" http://localhost:5000/api/models
```

### 2. Vérifier le Backend
```bash
# Test de santé
curl http://localhost:3000/api/dashboard/overview

# Lister les machines
curl http://localhost:3000/api/dashboard/machines
```

### 3. Vérifier le Frontend
Ouvrir le navigateur: `http://localhost:5173`

Vous devriez voir le dashboard avec:
- KPI cards en haut
- Liste des machines
- Graphiques de santé système
- Alertes récentes

### 4. Vérifier l'Agent
Vérifier les logs dans `agent/agent.log`:
```bash
tail -f agent/agent.log
```

---

## Maintenance

### Entraînement Manuel du Modèle
```bash
cd ml-service
.\venv\Scripts\Activate.ps1

python -c "from src.training_pipeline import TrainingPipeline; pipeline = TrainingPipeline(); pipeline.run_training()"
```

### Génération de Prédictions Manuelles
```bash
cd ml-service
.\venv\Scripts\Activate.ps1

python -c "from src.prediction_scheduler import PredictionScheduler; scheduler = PredictionScheduler(); scheduler.run_prediction_job()"
```

### Sauvegarde de la Base de Données
```bash
# Créer une sauvegarde
pg_dump -U postgres maintenance_predictive > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
psql -U postgres maintenance_predictive < backup_20260212.sql
```

### Rotation des Logs
Les logs sont automatiquement rotés par le système de logging Python (10 MB max, 5 fichiers).

---

## Dépannage

### Problème: Service ML ne démarre pas

**Erreur: "ModuleNotFoundError"**
```bash
# Solution: Réinstaller les dépendances
pip install -r requirements.txt
```

**Erreur: "Connection refused" (Database)**
```bash
# Solution: Vérifier que PostgreSQL est démarré
# Windows
Get-Service postgresql*

# Linux
sudo systemctl status postgresql
```

### Problème: Backend ne peut pas se connecter au Service ML

**Vérifier la configuration:**
```bash
# Dans backend/.env
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_TOKEN=dev-token-12345

# Dans ml-service/.env
API_TOKEN=dev-token-12345
```

### Problème: Prédictions ne sont pas générées

**Vérifier les logs:**
```bash
# Service ML
tail -f ml-service/ml-service.log

# Backend
tail -f backend/backend.log
```

**Vérifier qu'un modèle est actif:**
```sql
SELECT * FROM ml_models WHERE is_active = true;
```

**Entraîner un modèle si nécessaire:**
```bash
cd ml-service
python -c "from src.training_pipeline import TrainingPipeline; TrainingPipeline().run_training()"
```

### Problème: Agent ne collecte pas de données

**Vérifier la configuration:**
```json
// agent/config.json
{
  "api_url": "http://localhost:3000/api/data",
  "machine_id": 1
}
```

**Vérifier que la machine existe:**
```sql
SELECT * FROM machines WHERE id = 1;
```

### Problème: Dashboard affiche "N/A" pour les prédictions

**Causes possibles:**
1. Service ML n'est pas démarré
2. Aucun modèle actif
3. Aucune prédiction générée

**Solutions:**
```bash
# 1. Démarrer le service ML
cd ml-service
python -m src.app

# 2. Entraîner un modèle
python -c "from src.training_pipeline import TrainingPipeline; TrainingPipeline().run_training()"

# 3. Générer des prédictions
python -c "from src.prediction_scheduler import PredictionScheduler; PredictionScheduler().run_prediction_job()"
```

---

## Déploiement en Production

### Recommandations

1. **Utiliser des variables d'environnement sécurisées**
   - Ne jamais commiter les fichiers `.env`
   - Utiliser des secrets managers (AWS Secrets Manager, Azure Key Vault)

2. **Configurer HTTPS**
   - Utiliser un reverse proxy (Nginx, Apache)
   - Obtenir des certificats SSL (Let's Encrypt)

3. **Utiliser des gestionnaires de processus**
   - PM2 pour Node.js: `pm2 start backend/src/index.js`
   - Systemd pour Python services
   - Supervisor pour l'agent

4. **Configurer la surveillance**
   - Logs centralisés (ELK Stack, Splunk)
   - Monitoring (Prometheus, Grafana)
   - Alertes (PagerDuty, Slack)

5. **Optimiser les performances**
   - Utiliser un cache Redis pour les prédictions
   - Configurer un load balancer
   - Optimiser les requêtes SQL avec des index

---

## Support

Pour toute question ou problème:
- Consulter la documentation: `ml-service/README.md`
- Consulter l'API documentation: `ml-service/API_DOCUMENTATION.md`
- Vérifier les logs dans les fichiers `.log`

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
