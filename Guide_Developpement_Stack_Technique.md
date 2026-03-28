# Guide de Développement - Stack Technique

## 🎯 Stack Technique Choisie

### Frontend
- **Framework**: React 18
- **UI Library**: Tailwind CSS
- **Charts**: Chart.js / Recharts
- **State Management**: Redux Toolkit / Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Sequelize / Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi / Zod
- **API Documentation**: Swagger/OpenAPI

### Base de Données
- **SGBD**: PostgreSQL 15
- **Migration**: Sequelize CLI / Prisma Migrate
- **Backup**: pg_dump

### Machine Learning
- **Langage**: Python 3.9+
- **Framework**: scikit-learn
- **Data Processing**: pandas, numpy
- **API ML**: Flask (microservice séparé)

### DevOps
- **Containerisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions / GitLab CI
- **Versioning**: Git
- **Monitoring**: PM2 (Node.js)

### Méthodologie
- **Scrum Agile**: Sprints de 2 semaines
- **Outils**: Jira / Trello
- **Code Review**: Pull Requests
- **Tests**: Jest (Backend), React Testing Library (Frontend)

---

## 📁 Structure du Projet

```
maintenance-predictive/
├── agent/                          # Agent de collecte (Python)
│   ├── collector.py
│   ├── smart_reader.py
│   ├── config.json
│   └── requirements.txt
│
├── backend/                        # API Backend (Node.js)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── models/
│   │   │   ├── Machine.js
│   │   │   ├── SystemMetrics.js
│   │   │   ├── SmartData.js
│   │   │   ├── Prediction.js
│   │   │   ├── Alert.js
│   │   │   ├── User.js
│   │   │   └── MaintenanceIntervention.js
│   │   ├── controllers/
│   │   │   ├── dataController.js
│   │   │   ├── alertController.js
│   │   │   ├── machineController.js
│   │   │   ├── interventionController.js
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   ├── data.routes.js
│   │   │   ├── alert.routes.js
│   │   │   ├── machine.routes.js
│   │   │   ├── intervention.routes.js
│   │   │   └── auth.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── services/
│   │   │   ├── predictionService.js
│   │   │   ├── notificationService.js
│   │   │   └── anomalyService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   └── app.js
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── ml-service/                     # Service ML (Python/Flask)
│   ├── app.py
│   ├── model/
│   │   ├── train.py
│   │   ├── predict.py
│   │   └── model.pkl
│   ├── utils/
│   │   ├── feature_engineering.py
│   │   └── data_preprocessing.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                       # Interface Web (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── KPICard.jsx
│   │   │   │   └── Chart.jsx
│   │   │   ├── Alerts/
│   │   │   │   ├── AlertList.jsx
│   │   │   │   ├── AlertDetails.jsx
│   │   │   │   └── AlertCard.jsx
│   │   │   ├── Machines/
│   │   │   │   ├── MachineList.jsx
│   │   │   │   ├── MachineDetails.jsx
│   │   │   │   └── MachineHistory.jsx
│   │   │   ├── Interventions/
│   │   │   │   ├── InterventionList.jsx
│   │   │   │   ├── InterventionForm.jsx
│   │   │   │   └── InterventionDetails.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── PrivateRoute.jsx
│   │   │   └── Common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Loading.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── MachinesPage.jsx
│   │   │   ├── InterventionsPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── alertService.js
│   │   │   └── machineService.js
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── alertSlice.js
│   │   │   │   └── machineSlice.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
├── database/                       # Scripts SQL
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.ml
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
└── README.md
```

---

## 🔧 Technologies Détaillées

### Backend (Node.js + Express)

**Packages principaux:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "sequelize": "^6.32.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "joi": "^17.9.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "nodemailer": "^6.9.0",
    "axios": "^1.4.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

**Fonctionnalités:**
- API RESTful
- Authentification JWT
- Validation des données (Joi)
- Gestion des erreurs centralisée
- Logging (Winston)
- Cron jobs pour prédictions quotidiennes

---

### Frontend (React + Tailwind)

**Packages principaux:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.0.5",
    "axios": "^1.4.0",
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "tailwindcss": "^3.3.0",
    "react-icons": "^4.8.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "vite": "^4.3.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.5"
  }
}
```

**Fonctionnalités:**
- Dashboard interactif
- Graphiques temps réel
- Gestion des alertes
- Historique des machines
- Interface responsive
- Dark mode (optionnel)

---

### Base de Données (PostgreSQL)

**Tables principales:**

1. **machines**
   - id (UUID, PK)
   - hostname (VARCHAR)
   - ip_address (VARCHAR)
   - serial_number (VARCHAR)
   - model (VARCHAR)
   - status (ENUM: ACTIVE, MAINTENANCE, FAILED)
   - location (VARCHAR)
   - purchase_date (DATE)
   - created_at, updated_at

2. **system_metrics**
   - id (UUID, PK)
   - machine_id (UUID, FK)
   - timestamp (TIMESTAMP)
   - cpu_usage (FLOAT)
   - memory_usage (FLOAT)
   - disk_usage (FLOAT)
   - temperature (FLOAT)

3. **smart_data**
   - id (UUID, PK)
   - machine_id (UUID, FK)
   - timestamp (TIMESTAMP)
   - disk_health (INTEGER)
   - read_errors (INTEGER)
   - write_errors (INTEGER)

4. **predictions**
   - id (UUID, PK)
   - machine_id (UUID, FK)
   - timestamp (TIMESTAMP)
   - probability (FLOAT)
   - risk_level (ENUM: LOW, MEDIUM, HIGH, CRITICAL)
   - estimated_failure_date (DATE)

5. **alerts**
   - id (UUID, PK)
   - machine_id (UUID, FK)
   - type (ENUM: PREDICTION, ANOMALY)
   - level (ENUM: WARNING, CRITICAL)
   - message (TEXT)
   - status (ENUM: NEW, ACKNOWLEDGED, RESOLVED)
   - created_at, updated_at

6. **users**
   - id (UUID, PK)
   - username (VARCHAR, UNIQUE)
   - email (VARCHAR, UNIQUE)
   - password_hash (VARCHAR)
   - role (ENUM: ADMIN, TECHNICIAN)
   - created_at, updated_at

7. **maintenance_interventions**
   - id (UUID, PK)
   - machine_id (UUID, FK)
   - alert_id (UUID, FK, nullable)
   - user_id (UUID, FK)
   - type (ENUM: CORRECTIVE, PREVENTIVE)
   - description (TEXT)
   - date (TIMESTAMP)
   - cost (DECIMAL)
   - status (ENUM: PENDING, IN_PROGRESS, COMPLETED)

---

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+
- Python 3.9+
- PostgreSQL 15
- Docker (optionnel)

### Installation Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer .env avec les credentials PostgreSQL
npm run migrate
npm run seed
npm run dev
```

### Installation Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer REACT_APP_API_URL
npm start
```

### Installation ML Service

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Docker Compose (Recommandé)

```bash
docker-compose up -d
```

---

## 📊 Méthodologie Scrum Agile

### Sprints (2 semaines)

**Sprint 1 (01/02 - 14/02): Collecte de Données**
- Setup projet (backend + frontend + DB)
- Agent de collecte Python
- API réception données
- Tests unitaires

**Sprint 2 (15/02 - 07/03): Intelligence Artificielle**
- Service ML (Flask)
- Entraînement modèle Random Forest
- API prédiction
- Intégration backend

**Sprint 3 (08/03 - 21/03): Alertes & Notifications**
- Système d'alertes
- Service notifications (email/SMS)
- Détection anomalies
- Tests d'intégration

**Sprint 4 (22/03 - 04/04): Interface Web**
- Dashboard React
- Gestion alertes
- Historique machines
- Responsive design

**Sprint 5 (05/04 - 18/04): Maintenance & Admin**
- Gestion interventions
- Module administration
- Reporting (PDF/Excel)
- Tests end-to-end

**Sprint 6 (19/04 - 30/04): Tests & Déploiement**
- Tests complets
- Optimisation performance
- Déploiement production
- Documentation

---

## 🧪 Tests

### Backend (Jest + Supertest)
```bash
npm test
npm run test:coverage
```

### Frontend (React Testing Library)
```bash
npm test
npm run test:coverage
```

### ML Service (pytest)
```bash
pytest
pytest --cov
```

---

## 📦 Déploiement

### Production

**Backend:**
- Serveur: Ubuntu 22.04
- Process Manager: PM2
- Reverse Proxy: Nginx
- SSL: Let's Encrypt

**Frontend:**
- Build: `npm run build`
- Hosting: Nginx / Vercel / Netlify

**Base de Données:**
- PostgreSQL 15
- Backup quotidien (pg_dump)
- Réplication (optionnel)

**ML Service:**
- Docker container
- API Flask
- Modèle pré-entraîné

---

## 🔐 Sécurité

- Authentification JWT
- Hachage mots de passe (bcrypt)
- Validation des entrées (Joi)
- Protection CSRF
- Rate limiting
- HTTPS obligatoire
- Variables d'environnement (.env)

---

## 📈 Monitoring

- Logs: Winston (Backend)
- Monitoring: PM2
- Métriques: Prometheus (optionnel)
- Alertes: Email/SMS

---

## 📚 Documentation

- API: Swagger/OpenAPI
- Code: JSDoc (Backend), PropTypes (Frontend)
- README: Installation, configuration, utilisation
- Wiki: Architecture, décisions techniques

---

## ✅ Checklist de Développement

### Sprint 1
- [ ] Setup projet (backend, frontend, database)
- [ ] Configuration PostgreSQL
- [ ] Modèles Sequelize
- [ ] API endpoints de base
- [ ] Agent de collecte Python
- [ ] Tests unitaires backend

### Sprint 2
- [ ] Service ML Flask
- [ ] Entraînement modèle Random Forest
- [ ] API prédiction
- [ ] Intégration backend ↔ ML
- [ ] Tests ML

### Sprint 3
- [ ] Système d'alertes
- [ ] Service notifications
- [ ] Détection anomalies
- [ ] Tests d'intégration

### Sprint 4
- [ ] Setup React + Tailwind
- [ ] Dashboard
- [ ] Gestion alertes
- [ ] Historique machines
- [ ] Tests frontend

### Sprint 5
- [ ] Gestion interventions
- [ ] Module admin
- [ ] Reporting
- [ ] Tests end-to-end

### Sprint 6
- [ ] Tests complets
- [ ] Optimisation
- [ ] Déploiement
- [ ] Documentation

---

**Stack Technique Validée! 🎉**

**Prêt pour le développement!**
