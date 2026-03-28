# Sprint Planning - Système de Maintenance Prédictive
## Période: 1er Février 2025 - 30 Avril 2025 (3 mois)

---

## 📅 Vue d'Ensemble des Sprints

| Sprint | Dates | Durée | Objectif | User Stories | Jours |
|--------|-------|-------|----------|--------------|-------|
| **Sprint 1** | 01/02 - 14/02 | 2 semaines | Collecte de données | US1.1, US1.2, US1.3 | 12 |
| **Sprint 2** | 15/02 - 07/03 | 3 semaines | Intelligence Artificielle | US2.1, US2.2, US2.3 | 18 |
| **Sprint 3** | 08/03 - 21/03 | 2 semaines | Alertes & Notifications | US3.1, US3.2, US3.3 | 10 |
| **Sprint 4** | 22/03 - 04/04 | 2 semaines | Interface Web | US4.1, US4.2, US4.3 | 13 |
| **Sprint 5** | 05/04 - 18/04 | 2 semaines | Maintenance & Admin | US5.1, US5.2, US5.3, US5.4 | 12 |
| **Sprint 6** | 19/04 - 30/04 | 2 semaines | Tests & Déploiement | US6.1, US6.2, US6.3 | 10 |

**Durée totale: 13 semaines (3 mois)**

---

## 🚀 Sprint 1: Collecte de Données
**Dates: 1er Février - 14 Février 2025 (2 semaines)**

### Objectif du Sprint
Mettre en place le système de collecte automatique des données depuis les machines du parc informatique.

### User Stories

#### US1.1: Agent de collecte (5 jours)
**En tant qu'administrateur, je veux déployer un agent sur chaque PC afin de collecter automatiquement les données système**

**Tâches:**
- [ ] Jour 1-2: Développer agent Python (collecte CPU, RAM, Disque, Température)
- [ ] Jour 3: Intégrer collecte données SMART
- [ ] Jour 4: Implémenter timer automatique (1h)
- [ ] Jour 5: Tests et packaging (installeur Windows)

**Critères d'acceptation:**
- ✅ Agent installable sur Windows 10/11
- ✅ Collecte toutes les métriques requises
- ✅ Envoi automatique toutes les heures
- ✅ Gestion des erreurs et logs

---

#### US1.2: API de réception (4 jours)
**En tant que système, je veux recevoir et stocker les données des agents afin de constituer un historique**

**Tâches:**
- [ ] Jour 1: Setup projet backend (FastAPI/Flask)
- [ ] Jour 2: Créer endpoint POST /api/data
- [ ] Jour 3: Validation données (JSON Schema)
- [ ] Jour 4: Tests API (Postman)

**Critères d'acceptation:**
- ✅ API REST fonctionnelle
- ✅ Validation des données entrantes
- ✅ Stockage en base PostgreSQL
- ✅ Gestion des erreurs (400, 500)

---

#### US1.3: Base de données (3 jours)
**En tant que développeur, je veux une base de données structurée afin de stocker efficacement les données**

**Tâches:**
- [ ] Jour 1: Design schéma base de données
- [ ] Jour 2: Créer tables (Machine, SystemMetrics, SmartData, Agent)
- [ ] Jour 3: Relations, contraintes, indexes

**Critères d'acceptation:**
- ✅ Tables créées avec relations
- ✅ Contraintes d'intégrité
- ✅ Indexes pour performance
- ✅ Scripts de migration

---

### Cérémonies du Sprint

**Sprint Planning** - 01/02 (2h)
- Présentation des user stories
- Estimation et engagement de l'équipe

**Daily Standup** - Tous les jours à 9h00 (15 min)
- Qu'ai-je fait hier?
- Que vais-je faire aujourd'hui?
- Ai-je des blocages?

**Sprint Review** - 14/02 (1h)
- Démonstration: Agent collecte et envoie données
- Démonstration: API reçoit et stocke données
- Feedback

**Sprint Retrospective** - 14/02 (1h)
- Ce qui a bien fonctionné
- Ce qui peut être amélioré
- Actions d'amélioration

---

### Livrables
- ✅ Agent de collecte installable
- ✅ API backend fonctionnelle
- ✅ Base de données opérationnelle
- ✅ Documentation technique

---

## 🤖 Sprint 2: Intelligence Artificielle
**Dates: 15 Février - 7 Mars 2025 (3 semaines)**

### Objectif du Sprint
Développer le système de prédiction basé sur le Machine Learning pour anticiper les pannes.

### User Stories

#### US2.1: Préparation des données (5 jours)
**En tant que data scientist, je veux préparer les données pour le ML afin d'entraîner un modèle performant**

**Tâches:**
- [ ] Jour 1-2: Feature engineering (moyennes, tendances, ratios)
- [ ] Jour 3: Nettoyage données (outliers, valeurs manquantes)
- [ ] Jour 4: Labellisation (panne dans 30 jours?)
- [ ] Jour 5: Split train/test (80/20)

---

#### US2.2: Entraînement modèle ML (8 jours)
**En tant que système, je veux un modèle ML entraîné afin de prédire les pannes**

**Tâches:**
- [ ] Jour 1-2: Choix algorithme (Random Forest, XGBoost)
- [ ] Jour 3-5: Entraînement sur données historiques
- [ ] Jour 6-7: Validation croisée et tuning hyperparamètres
- [ ] Jour 8: Sérialisation modèle (pickle/joblib)

**Critères d'acceptation:**
- ✅ Accuracy > 85%
- ✅ Precision > 80%
- ✅ Recall > 75%
- ✅ Modèle sérialisé

---

#### US2.3: Service de prédiction (5 jours)
**En tant que système, je veux un service de prédiction afin d'analyser quotidiennement les machines**

**Tâches:**
- [ ] Jour 1-2: API prédiction (/api/predict)
- [ ] Jour 3: Scheduler (cron job 2h00)
- [ ] Jour 4: Calcul probabilité pour chaque machine
- [ ] Jour 5: Sauvegarde prédictions en base

---

### Livrables
- ✅ Dataset préparé et labellisé
- ✅ Modèle ML entraîné (accuracy > 85%)
- ✅ Service de prédiction automatique
- ✅ Documentation modèle ML

---

## 🔔 Sprint 3: Alertes & Notifications
**Dates: 8 Mars - 21 Mars 2025 (2 semaines)**

### Objectif du Sprint
Mettre en place le système d'alertes automatiques et de notifications multi-canaux.

### User Stories

#### US3.1: Génération alertes (3 jours)
**Tâches:**
- [ ] Jour 1: Logique génération (seuil 70%)
- [ ] Jour 2: Niveaux de risque (HIGH, CRITICAL)
- [ ] Jour 3: Gestion statuts (NEW, ACKNOWLEDGED, RESOLVED)

---

#### US3.2: Notifications (4 jours)
**Tâches:**
- [ ] Jour 1-2: Service email (SMTP)
- [ ] Jour 3: Service SMS (Twilio)
- [ ] Jour 4: Push notifications (Firebase)

---

#### US3.3: Détection anomalies (3 jours)
**Tâches:**
- [ ] Jour 1-2: Analyse statistique (Z-score)
- [ ] Jour 3: Types anomalies (CPU_SPIKE, MEMORY_LEAK, DISK_FULL)

---

### Livrables
- ✅ Système d'alertes automatique
- ✅ Notifications multi-canaux
- ✅ Détection anomalies temps réel

---

## 💻 Sprint 4: Interface Web
**Dates: 22 Mars - 4 Avril 2025 (2 semaines)**

### Objectif du Sprint
Développer l'interface web pour les techniciens et administrateurs.

### User Stories

#### US4.1: Dashboard (5 jours)
**Tâches:**
- [ ] Jour 1-2: Setup React + Tailwind CSS
- [ ] Jour 3: Vue d'ensemble (KPIs, graphiques)
- [ ] Jour 4: Graphiques temps réel (Chart.js)
- [ ] Jour 5: Responsive design

---

#### US4.2: Gestion alertes (4 jours)
**Tâches:**
- [ ] Jour 1-2: Liste alertes (filtres, tri, pagination)
- [ ] Jour 3: Détails alerte (modal)
- [ ] Jour 4: Accusé réception et changement statut

---

#### US4.3: Historique machines (4 jours)
**Tâches:**
- [ ] Jour 1-2: Graphiques métriques (30 jours)
- [ ] Jour 3: Historique prédictions et interventions
- [ ] Jour 4: Export CSV

---

### Livrables
- ✅ Interface web responsive
- ✅ Dashboard fonctionnel
- ✅ Gestion complète des alertes
- ✅ Consultation historique

---

## 🔧 Sprint 5: Maintenance & Admin
**Dates: 5 Avril - 18 Avril 2025 (2 semaines)**

### Objectif du Sprint
Compléter les fonctionnalités de maintenance et d'administration.

### User Stories

#### US5.1: Gestion interventions (4 jours)
#### US5.2: Gestion utilisateurs (3 jours)
#### US5.3: Configuration système (2 jours)
#### US5.4: Reporting (3 jours)

---

### Livrables
- ✅ Module interventions
- ✅ Gestion utilisateurs et rôles
- ✅ Configuration système
- ✅ Export rapports (PDF, Excel)

---

## ✅ Sprint 6: Tests & Déploiement
**Dates: 19 Avril - 30 Avril 2025 (2 semaines)**

### Objectif du Sprint
Finaliser le projet avec tests complets et déploiement en production.

### User Stories

#### US6.1: Tests unitaires (3 jours)
**Tâches:**
- [ ] Jour 1: Tests backend (pytest)
- [ ] Jour 2: Tests frontend (Jest)
- [ ] Jour 3: Couverture > 80%

---

#### US6.2: Tests d'intégration (3 jours)
**Tâches:**
- [ ] Jour 1-2: Tests end-to-end (Cypress)
- [ ] Jour 3: Tests API et ML

---

#### US6.3: Déploiement production (4 jours)
**Tâches:**
- [ ] Jour 1: Configuration serveur Ubuntu
- [ ] Jour 2: Docker Compose
- [ ] Jour 3: Migration données
- [ ] Jour 4: Documentation et formation

---

### Livrables
- ✅ Tests complets (>80% couverture)
- ✅ Système déployé en production
- ✅ Documentation utilisateur
- ✅ Formation techniciens

---

## 📊 Jalons du Projet

| Date | Jalon | Description |
|------|-------|-------------|
| **14/02** | 🎯 Jalon 1 | Backend fonctionnel - Collecte de données opérationnelle |
| **07/03** | 🎯 Jalon 2 | IA opérationnelle - Prédictions automatiques |
| **21/03** | 🎯 Jalon 3 | Alertes actives - Notifications fonctionnelles |
| **04/04** | 🎯 Jalon 4 | Interface complète - Système utilisable |
| **30/04** | 🎯 Jalon 5 | Production - Système déployé et opérationnel |

---

## 📈 Vélocité et Capacité

### Vélocité Moyenne
- **Sprint 1**: 12 jours
- **Sprint 2**: 18 jours
- **Sprint 3**: 10 jours
- **Sprint 4**: 13 jours
- **Sprint 5**: 12 jours
- **Sprint 6**: 10 jours

**Moyenne: 12.5 jours par sprint**

### Capacité de l'Équipe
- **1 développeur full-time**: 10 jours par sprint (2 semaines)
- **Marge de sécurité**: 20%

---

## 🎯 Risques et Mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Qualité des données insuffisante | Moyenne | Élevé | Validation précoce des données (Sprint 1) |
| Performance modèle ML < 85% | Moyenne | Élevé | Prévoir temps pour tuning (Sprint 2) |
| Complexité interface | Faible | Moyen | Utiliser framework UI (React + Tailwind) |
| Retard sur planning | Moyenne | Moyen | Marge de sécurité 20%, priorisation MVP |

---

## ✅ Définition de "Done"

Une user story est terminée quand:
- ✅ Code écrit et fonctionnel
- ✅ Tests unitaires écrits et passent
- ✅ Code review effectuée
- ✅ Documentation à jour
- ✅ Critères d'acceptation validés
- ✅ Déployé en environnement de test

---

## 📝 Notes Importantes

- **Durée projet**: 3 mois (1er février - 30 avril 2025)
- **Nombre de sprints**: 6 sprints
- **Méthodologie**: Scrum/Agile
- **Outils**: Jira/Trello pour suivi, Git pour versioning
- **Réunions**: Daily standup, Sprint planning, Review, Retrospective

---

**Planning créé le: Janvier 2025**
**Dernière mise à jour: Janvier 2025**
