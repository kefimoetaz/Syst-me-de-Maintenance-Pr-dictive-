# Guide du Backlog et Planning - Maintenance Prédictive

## 📋 Introduction

Le backlog produit est la liste ordonnée de toutes les fonctionnalités, améliorations et corrections à développer pour le projet. Ce guide présente 3 visualisations différentes du backlog.

---

## 📊 Les 3 Diagrammes Créés

### 1. **Diagramme WBS (Work Breakdown Structure)**
**Fichier:** `Diagramme_Backlog_Projet.puml`

**Objectif:** Décomposer le projet en sprints et user stories

**Structure:**
```
Projet PFE
├── Sprint 0: Initialisation (2 semaines)
│   ├── US0.1: Configuration environnement
│   └── US0.2: Architecture de base
├── Sprint 1: Collecte de Données (3 semaines)
│   ├── US1.1: Agent de collecte
│   ├── US1.2: API réception
│   └── US1.3: Base de données
├── Sprint 2: Intelligence Artificielle (4 semaines)
│   ├── US2.1: Préparation données
│   ├── US2.2: Entraînement modèle
│   └── US2.3: Service prédiction
├── Sprint 3: Alertes et Notifications (2 semaines)
├── Sprint 4: Interface Web (3 semaines)
├── Sprint 5: Maintenance et Admin (2 semaines)
└── Sprint 6: Tests et Déploiement (2 semaines)
```

**Total: 6 sprints sur 18 semaines (≈ 4.5 mois)**

---

### 2. **Diagramme de Gantt**
**Fichier:** `Diagramme_Gantt_Planning.puml`

**Objectif:** Visualiser la planification temporelle du projet

**Phases:**
1. **Phase 1: Initialisation** (2 semaines) - Bleu clair
2. **Phase 2: Backend & Collecte** (3 semaines) - Vert clair
3. **Phase 3: Intelligence Artificielle** (4 semaines) - Orange
4. **Phase 4: Alertes** (2 semaines) - Jaune
5. **Phase 5: Frontend** (3 semaines) - Corail
6. **Phase 6: Administration** (2 semaines) - Rose
7. **Phase 7: Finalisation** (2 semaines) - Gris

**Jalons importants:**
- ✅ Jalon 1: Backend fonctionnel (fin Sprint 1)
- ✅ Jalon 2: IA opérationnelle (fin Sprint 2)
- ✅ Jalon 3: Système complet (fin Sprint 4)
- ✅ Jalon 4: Production (fin Sprint 6)

---

### 3. **Mind Map du Backlog**
**Fichier:** `Diagramme_Backlog_MindMap.puml`

**Objectif:** Vue d'ensemble des fonctionnalités par domaine

**Domaines principaux:**
- **Collecte de Données** (droite)
- **Intelligence Artificielle** (droite)
- **Alertes & Notifications** (droite)
- **Interface Utilisateur** (gauche)
- **Maintenance** (gauche)
- **Administration** (gauche)

---

## 📅 Planning Détaillé

### Sprint 0: Initialisation (2 semaines)
**Objectif:** Préparer l'environnement de développement

**User Stories:**
- **US0.1: Configuration environnement dev**
  - Installer Python 3.9+, Node.js 18+
  - Configurer PostgreSQL
  - Setup Git repository
  - **Estimation:** 3 jours

- **US0.2: Architecture de base**
  - Créer structure projet (backend/frontend)
  - Définir API REST (OpenAPI)
  - Setup Docker & Docker Compose
  - **Estimation:** 4 jours

**Livrables:**
- ✅ Environnement dev fonctionnel
- ✅ Architecture projet définie
- ✅ Documentation technique initiale

---

### Sprint 1: Collecte de Données (3 semaines)
**Objectif:** Développer le système de collecte automatique

**User Stories:**
- **US1.1: Développer l'agent de collecte**
  - Collecter métriques CPU/RAM/Disque
  - Collecter données SMART
  - Timer automatique (toutes les heures)
  - **Estimation:** 5 jours

- **US1.2: API de réception données**
  - Endpoint POST /api/data
  - Validation des données (JSON Schema)
  - Stockage en base de données
  - **Estimation:** 4 jours

- **US1.3: Base de données**
  - Tables: Machine, SystemMetrics, SmartData, Agent
  - Relations et contraintes
  - Indexes pour performance
  - **Estimation:** 3 jours

**Livrables:**
- ✅ Agent fonctionnel sur Windows
- ✅ API backend opérationnelle
- ✅ Base de données structurée

---

### Sprint 2: Intelligence Artificielle (4 semaines)
**Objectif:** Développer le système de prédiction ML

**User Stories:**
- **US2.1: Préparation des données**
  - Feature engineering (statistiques, tendances)
  - Nettoyage des données (outliers, valeurs manquantes)
  - Labellisation (panne dans 30 jours?)
  - **Estimation:** 5 jours

- **US2.2: Entraînement modèle ML**
  - Choix algorithme (Random Forest)
  - Entraînement sur données historiques (6 mois)
  - Validation croisée (accuracy > 85%)
  - **Estimation:** 8 jours

- **US2.3: Service de prédiction**
  - API prédiction (/api/predict)
  - Calcul probabilité de panne
  - Sauvegarde prédictions en base
  - **Estimation:** 5 jours

**Livrables:**
- ✅ Modèle ML entraîné et validé
- ✅ Service de prédiction opérationnel
- ✅ Prédictions quotidiennes automatiques

---

### Sprint 3: Alertes et Notifications (2 semaines)
**Objectif:** Système d'alertes automatiques

**User Stories:**
- **US3.1: Système d'alertes**
  - Génération alertes (seuil 70%)
  - Niveaux de risque (HIGH, CRITICAL)
  - Statuts alertes (NEW, ACKNOWLEDGED, RESOLVED)
  - **Estimation:** 3 jours

- **US3.2: Service de notification**
  - Envoi email (SMTP)
  - Envoi SMS (Twilio)
  - Push notifications (Firebase)
  - **Estimation:** 4 jours

- **US3.3: Détection d'anomalies**
  - Analyse statistique (moyenne, écart-type)
  - Détection temps réel
  - Types d'anomalies (CPU_SPIKE, MEMORY_LEAK, etc.)
  - **Estimation:** 3 jours

**Livrables:**
- ✅ Alertes générées automatiquement
- ✅ Notifications multi-canaux
- ✅ Détection anomalies en temps réel

---

### Sprint 4: Interface Web (3 semaines)
**Objectif:** Développer l'interface utilisateur

**User Stories:**
- **US4.1: Dashboard principal**
  - Vue d'ensemble du parc informatique
  - Graphiques temps réel (Chart.js)
  - KPIs principaux (nombre machines, alertes actives)
  - **Estimation:** 5 jours

- **US4.2: Gestion des alertes**
  - Liste des alertes (filtres, tri)
  - Détails alerte (machine, prédiction, métriques)
  - Accusé réception
  - **Estimation:** 4 jours

- **US4.3: Historique machines**
  - Visualisation métriques (graphiques)
  - Historique prédictions
  - Historique interventions
  - **Estimation:** 4 jours

**Livrables:**
- ✅ Interface web responsive (React)
- ✅ Dashboard fonctionnel
- ✅ Gestion complète des alertes

---

### Sprint 5: Maintenance et Admin (2 semaines)
**Objectif:** Modules de maintenance et administration

**User Stories:**
- **US5.1: Gestion interventions**
  - Créer intervention (urgente/planifiée)
  - Suivi interventions (statuts)
  - Clôture intervention (commentaires, coût)
  - **Estimation:** 4 jours

- **US5.2: Module administration**
  - Gestion utilisateurs (CRUD)
  - Configuration seuils alertes
  - Déploiement agents (script automatique)
  - **Estimation:** 4 jours

- **US5.3: Reporting**
  - Export PDF (jsPDF)
  - Export Excel (xlsx)
  - Rapports personnalisés
  - **Estimation:** 2 jours

**Livrables:**
- ✅ Module interventions complet
- ✅ Panel administration fonctionnel
- ✅ Système de reporting

---

### Sprint 6: Tests et Déploiement (2 semaines)
**Objectif:** Tests complets et mise en production

**User Stories:**
- **US6.1: Tests unitaires**
  - Tests backend (pytest)
  - Tests frontend (Jest)
  - Couverture > 80%
  - **Estimation:** 3 jours

- **US6.2: Tests d'intégration**
  - Tests end-to-end (Cypress)
  - Tests API (Postman)
  - Tests ML (validation modèle)
  - **Estimation:** 3 jours

- **US6.3: Déploiement production**
  - Configuration serveur (Ubuntu)
  - Migration données
  - Documentation utilisateur
  - **Estimation:** 4 jours

**Livrables:**
- ✅ Tests complets (>80% couverture)
- ✅ Système déployé en production
- ✅ Documentation complète

---

## 📊 Estimation Globale

### Durée Totale
- **6 sprints** = 18 semaines = **4.5 mois**
- Avec marge de sécurité: **5-6 mois**

### Répartition du Temps

| Phase | Durée | % du projet |
|-------|-------|-------------|
| Initialisation | 2 semaines | 11% |
| Backend & Collecte | 3 semaines | 17% |
| Intelligence Artificielle | 4 semaines | 22% |
| Alertes | 2 semaines | 11% |
| Frontend | 3 semaines | 17% |
| Administration | 2 semaines | 11% |
| Tests & Déploiement | 2 semaines | 11% |

---

## 🎯 Priorisation du Backlog

### Priorité HAUTE (MVP - Minimum Viable Product)
1. ✅ Collecte de données (Sprint 1)
2. ✅ Prédiction IA (Sprint 2)
3. ✅ Alertes (Sprint 3)
4. ✅ Dashboard basique (Sprint 4)

**Durée MVP: 3 mois**

### Priorité MOYENNE
5. ✅ Interface complète (Sprint 4)
6. ✅ Gestion interventions (Sprint 5)

### Priorité BASSE (Nice to have)
7. ⚪ Reporting avancé (Sprint 5)
8. ⚪ Détection anomalies avancée (Sprint 3)

---

## 💡 Méthodologie Agile

### Cérémonies Scrum

**Sprint Planning** (début de sprint)
- Durée: 2h
- Sélection user stories
- Estimation (Planning Poker)

**Daily Standup** (quotidien)
- Durée: 15 min
- Qu'ai-je fait hier?
- Que vais-je faire aujourd'hui?
- Blocages?

**Sprint Review** (fin de sprint)
- Durée: 1h
- Démonstration des fonctionnalités
- Feedback

**Sprint Retrospective** (fin de sprint)
- Durée: 1h
- Ce qui a bien fonctionné
- Ce qui peut être amélioré
- Actions d'amélioration

---

## 🎓 Comment Défendre Devant le Jury

### Question 1: "Comment avez-vous planifié le projet?"

**Réponse:**
> "J'ai utilisé une approche Agile avec 6 sprints de 2-4 semaines. J'ai priorisé les fonctionnalités essentielles (collecte, IA, alertes) dans les 3 premiers sprints pour avoir un MVP fonctionnel rapidement. Les sprints suivants ajoutent l'interface utilisateur et les fonctionnalités d'administration."

---

### Question 2: "Pourquoi 4 semaines pour l'IA?"

**Réponse:**
> "Le sprint IA est le plus long car il inclut la préparation des données (feature engineering, nettoyage), l'entraînement du modèle avec validation croisée, et le développement du service de prédiction. C'est le cœur du système, donc j'ai alloué plus de temps pour garantir la qualité."

---

### Question 3: "Comment gérez-vous les risques?"

**Réponse:**
> "J'ai identifié plusieurs risques: qualité des données, performance du modèle ML, complexité de l'interface. Pour mitiger ces risques, j'ai prévu des jalons de validation à la fin de chaque phase critique, et une marge de sécurité de 10-15% sur la durée totale."

---

## 📋 Checklist de Validation

Ton backlog est bon si:

- ✅ User stories claires et testables
- ✅ Estimation réaliste (en jours)
- ✅ Priorisation logique (MVP d'abord)
- ✅ Sprints équilibrés (2-4 semaines)
- ✅ Jalons de validation définis
- ✅ Durée totale réaliste (4-6 mois pour PFE)

**Ton backlog coche toutes les cases! ✅**

---

## 🚀 Utilisation pour ton PFE

### Dans le Rapport

**Chapitre Gestion de Projet:**
```
5. Gestion de Projet
   5.1 Méthodologie Agile
   5.2 Backlog Produit
       [Image du WBS]
       [Tableau des user stories]
   5.3 Planning
       [Image du Gantt]
       [Jalons et livrables]
   5.4 Estimation et Risques
```

---

### Pour la Soutenance

**Slide Planning (2-3 minutes):**
- "J'ai utilisé une approche Agile avec 6 sprints"
- "MVP fonctionnel après 3 mois (collecte + IA + alertes)"
- "Durée totale: 5-6 mois"
- Montrer le diagramme de Gantt

---

## ✅ Résumé

**Tu as maintenant 3 diagrammes de backlog:**

1. ✅ WBS (Work Breakdown Structure) - Décomposition en sprints et user stories
2. ✅ Gantt - Planning temporel avec jalons
3. ✅ Mind Map - Vue d'ensemble des fonctionnalités

**Ces diagrammes montrent que tu as une vision claire de la gestion de projet! 🎉**

---

**Ton backlog est maintenant prêt pour ton PFE! 🚀**

Besoin d'ajustements ou d'autres diagrammes?
