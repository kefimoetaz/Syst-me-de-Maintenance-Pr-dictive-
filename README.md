# 🖥️ Système de Maintenance Prédictive avec IA

## 📋 Description
Système intelligent de surveillance et maintenance prédictive pour parcs informatiques utilisant l'apprentissage automatique pour anticiper les pannes matérielles.

## 🎯 Objectifs
- Surveillance automatique en temps réel des machines
- Prédiction des pannes avec Machine Learning (Random Forest)
- Alertes automatiques par email
- Dashboard web interactif
- Réduction des temps d'arrêt et coûts de maintenance

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Agent     │─────▶│  Backend    │─────▶│  PostgreSQL  │
│  (Python)   │      │  (Node.js)  │      │   Database   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │                      │
                            ▼                      ▼
                     ┌─────────────┐      ┌──────────────┐
                     │  Frontend   │      │  ML Service  │
                     │   (React)   │      │   (Python)   │
                     └─────────────┘      └──────────────┘
```

## 🛠️ Stack Technique

### Frontend
- **React** 18.3 + **Vite** 5.4
- **TailwindCSS** 3.4 pour le design
- **Recharts** pour les graphiques
- **Axios** pour les appels API

### Backend
- **Node.js** 20+ avec **Express** 4.21
- **PostgreSQL** 14+ pour la base de données
- **Sequelize** ORM
- **JWT** pour l'authentification
- **Nodemailer** pour les emails

### Agent de Collecte
- **Python** 3.9+
- **psutil** pour les métriques système
- **pySMART** pour les données SMART
- **schedule** pour la collecte automatique

### Service ML
- **Python** 3.9+
- **scikit-learn** 1.7+ (Random Forest)
- **pandas** & **numpy** pour le traitement
- **APScheduler** pour les prédictions quotidiennes

## 📊 Fonctionnalités

### ✅ Implémentées
- [x] Collecte automatique des métriques (CPU, RAM, Disque)
- [x] Lecture des données SMART des disques
- [x] API RESTful complète
- [x] Dashboard web responsive
- [x] Prédictions ML avec Random Forest
- [x] Système d'alertes avec 4 niveaux (LOW, MEDIUM, HIGH, CRITICAL)
- [x] Notifications email automatiques
- [x] Gestion de 20 machines
- [x] 7.8M+ enregistrements de métriques
- [x] Historique sur 30 jours

### 🔜 Évolutions Futures
- [ ] Module d'interventions de maintenance
- [ ] Historique des interventions
- [ ] Statistiques avancées
- [ ] Export de rapports PDF
- [ ] Application mobile
- [ ] Intégration avec systèmes de ticketing

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 20+
- Python 3.9+
- PostgreSQL 14+
- Git

### 1. Cloner le projet
```bash
git clone <repository-url>
cd plateform
```

### 2. Configuration de la base de données
```bash
# Créer la base de données
createdb -U postgres predictive_maintenance

# Exécuter les migrations
cd backend
npm install
npm run migrate
npm run seed
```

### 3. Démarrer le Backend
```bash
cd backend
npm install
npm start
# Backend: http://localhost:3000
```

### 4. Démarrer le Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

### 5. Démarrer l'Agent
```bash
cd agent
pip install -r requirements.txt
python src/main.py
# Collecte automatique toutes les heures
```

### 6. Service ML (Optionnel)
```bash
cd ml-service
pip install -r requirements.txt
python -m src.training_pipeline  # Entraîner le modèle
python run_predictions_once.py   # Générer des prédictions
```

## 📱 Utilisation

### Dashboard Web
Accédez à http://localhost:5173 pour:
- Voir toutes les machines surveillées
- Consulter les prédictions de pannes
- Gérer les alertes
- Visualiser les graphiques de santé système

### API REST
Documentation complète: `backend/API_DOCUMENTATION.md`

Endpoints principaux:
- `GET /api/machines` - Liste des machines
- `GET /api/predictions` - Prédictions ML
- `GET /api/alerts` - Alertes actives
- `POST /api/data` - Envoi de métriques (agent)

## 📈 Métriques du Projet

- **20 machines** surveillées
- **7.8M+ enregistrements** de métriques
- **Collecte automatique** toutes les heures
- **Prédictions quotidiennes** à 2h00
- **Alertes en temps réel** pour risques HIGH/CRITICAL
- **Précision ML**: 50-70% (amélioration avec plus de données)

## 🎓 Contexte Académique

**Projet de Fin d'Études (PFE)**
- **Établissement**: [Votre université]
- **Année**: 2025-2026
- **Filière**: Licence en Systèmes Informatiques (LSI)
- **Encadrant**: [Nom de l'encadrant]

## 📚 Documentation

- `Guide_Utilisation_PC_Technician_Assistant_Pour_Maintenance_Predictive.md` - Guide utilisateur
- `Guide_Developpement_Stack_Technique.md` - Guide développeur
- `MACHINE_SCALING_GUIDE.md` - Guide de scalabilité
- `ALERT_SYSTEM_SETUP.md` - Configuration des alertes
- Diagrammes UML dans le dossier racine

## 🔒 Sécurité

- Authentification par token JWT
- Validation des entrées API
- Protection contre les injections SQL (Sequelize ORM)
- Limitation du taux de requêtes
- Logs d'audit complets

## 🐳 Docker (Optionnel)

```bash
docker-compose up -d
```

Services disponibles:
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- PostgreSQL: localhost:5432
- ML Service: http://localhost:5000

## 🤝 Contribution

Ce projet est un PFE académique. Pour toute question:
- Email: [votre-email]
- GitHub: [votre-github]

## 📄 Licence

Projet académique - Tous droits réservés

## 🙏 Remerciements

- Encadrant académique
- Équipe pédagogique LSI
- Communauté open-source (React, Node.js, scikit-learn)

---

**Développé avec ❤️ pour la maintenance prédictive intelligente**
