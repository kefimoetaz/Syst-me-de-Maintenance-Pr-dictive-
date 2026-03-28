# Product Backlog - Système de Maintenance Prédictive

## 📋 Tableau du Product Backlog

| ID | User Story | Priorité | Estimation | Sprint | Critères d'Acceptation |
|----|------------|----------|------------|--------|------------------------|
| **US1.1** | En tant qu'**administrateur**, je veux **déployer un agent sur chaque PC** afin de **collecter automatiquement les données système** | HAUTE | 5 jours | Sprint 1 | - Agent installable sur Windows<br>- Collecte CPU, RAM, Disque, Température<br>- Collecte données SMART<br>- Envoi automatique toutes les heures |
| **US1.2** | En tant que **système**, je veux **recevoir et stocker les données des agents** afin de **constituer un historique** | HAUTE | 4 jours | Sprint 1 | - API REST POST /api/data<br>- Validation des données JSON<br>- Stockage en base PostgreSQL<br>- Gestion des erreurs |
| **US1.3** | En tant que **développeur**, je veux **une base de données structurée** afin de **stocker efficacement les données** | HAUTE | 3 jours | Sprint 1 | - Tables: Machine, SystemMetrics, SmartData, Agent<br>- Relations et contraintes<br>- Indexes pour performance |
| **US2.1** | En tant que **data scientist**, je veux **préparer les données pour le ML** afin d'**entraîner un modèle performant** | HAUTE | 5 jours | Sprint 2 | - Feature engineering (moyennes, tendances)<br>- Nettoyage des outliers<br>- Labellisation (panne dans 30 jours)<br>- Dataset train/test (80/20) |
| **US2.2** | En tant que **système**, je veux **un modèle ML entraîné** afin de **prédire les pannes** | HAUTE | 8 jours | Sprint 2 | - Algorithme Random Forest<br>- Entraînement sur 6 mois de données<br>- Accuracy > 85%<br>- Modèle sérialisé (pickle) |
| **US2.3** | En tant que **système**, je veux **un service de prédiction** afin d'**analyser quotidiennement les machines** | HAUTE | 5 jours | Sprint 2 | - Analyse automatique (cron 2h00)<br>- Calcul probabilité pour chaque machine<br>- Sauvegarde prédictions en base<br>- Logs d'exécution |
| **US3.1** | En tant que **système**, je veux **générer des alertes automatiquement** afin d'**avertir les techniciens des risques** | HAUTE | 3 jours | Sprint 3 | - Génération si probabilité > 70%<br>- Niveaux: HIGH (70-85%), CRITICAL (>85%)<br>- Statuts: NEW, ACKNOWLEDGED, RESOLVED |
| **US3.2** | En tant que **technicien**, je veux **recevoir des notifications** afin d'**être alerté rapidement** | HAUTE | 4 jours | Sprint 3 | - Envoi email (SMTP)<br>- Envoi SMS (Twilio)<br>- Push notifications (Firebase)<br>- Contenu: machine, probabilité, actions |
| **US3.3** | En tant que **système**, je veux **détecter les anomalies en temps réel** afin de **réagir rapidement** | MOYENNE | 3 jours | Sprint 3 | - Analyse statistique (moyenne, écart-type)<br>- Détection: CPU_SPIKE, MEMORY_LEAK, DISK_FULL<br>- Alerte si sévérité >= HIGH |
| **US4.1** | En tant que **technicien**, je veux **un dashboard** afin de **visualiser l'état du parc** | HAUTE | 5 jours | Sprint 4 | - Vue d'ensemble (nombre machines, alertes)<br>- Graphiques temps réel (Chart.js)<br>- KPIs: taux disponibilité, MTBF<br>- Interface responsive |
| **US4.2** | En tant que **technicien**, je veux **gérer les alertes** afin de **traiter les problèmes** | HAUTE | 4 jours | Sprint 4 | - Liste alertes (filtres, tri, pagination)<br>- Détails alerte (machine, métriques, historique)<br>- Accusé réception<br>- Changement statut |
| **US4.3** | En tant que **technicien**, je veux **consulter l'historique d'une machine** afin de **comprendre son évolution** | HAUTE | 4 jours | Sprint 4 | - Graphiques métriques (30 jours)<br>- Historique prédictions<br>- Historique interventions<br>- Export données CSV |
| **US5.1** | En tant que **technicien**, je veux **gérer les interventions** afin de **tracer les actions** | HAUTE | 4 jours | Sprint 5 | - Créer intervention (urgente/planifiée)<br>- Suivi statuts (PENDING, IN_PROGRESS, COMPLETED)<br>- Clôture avec commentaires et coût<br>- Lien avec alerte |
| **US5.2** | En tant que **administrateur**, je veux **gérer les utilisateurs** afin de **contrôler les accès** | MOYENNE | 3 jours | Sprint 5 | - CRUD utilisateurs<br>- Rôles: ADMIN, TECHNICIAN<br>- Authentification JWT<br>- Permissions par rôle |
| **US5.3** | En tant que **administrateur**, je veux **configurer le système** afin d'**adapter les seuils** | MOYENNE | 2 jours | Sprint 5 | - Configuration seuils alertes<br>- Paramètres notifications<br>- Fréquence analyse<br>- Interface admin |
| **US5.4** | En tant que **technicien**, je veux **exporter des rapports** afin de **communiquer les résultats** | BASSE | 3 jours | Sprint 5 | - Export PDF (jsPDF)<br>- Export Excel (xlsx)<br>- Rapports: santé parc, interventions, coûts<br>- Personnalisation période |
| **US6.1** | En tant que **développeur**, je veux **des tests unitaires** afin de **garantir la qualité** | HAUTE | 3 jours | Sprint 6 | - Tests backend (pytest)<br>- Tests frontend (Jest)<br>- Couverture > 80%<br>- CI/CD intégré |
| **US6.2** | En tant que **développeur**, je veux **des tests d'intégration** afin de **valider le système complet** | HAUTE | 3 jours | Sprint 6 | - Tests end-to-end (Cypress)<br>- Tests API (Postman)<br>- Tests ML (validation modèle)<br>- Scénarios utilisateur |
| **US6.3** | En tant que **administrateur**, je veux **déployer en production** afin de **mettre le système en service** | HAUTE | 4 jours | Sprint 6 | - Configuration serveur Ubuntu<br>- Docker Compose<br>- Migration données<br>- Documentation déploiement |

---

## 📊 Statistiques du Backlog

### Par Priorité
- **HAUTE**: 14 user stories (78%)
- **MOYENNE**: 3 user stories (17%)
- **BASSE**: 1 user story (5%)

### Par Sprint
- **Sprint 1**: 3 user stories (12 jours)
- **Sprint 2**: 3 user stories (18 jours)
- **Sprint 3**: 3 user stories (10 jours)
- **Sprint 4**: 3 user stories (13 jours)
- **Sprint 5**: 4 user stories (12 jours)
- **Sprint 6**: 3 user stories (10 jours)

### Estimation Totale
- **Total**: 19 user stories
- **Effort total**: 75 jours
- **Durée projet**: 3 mois (1 fév - 30 avril)

---

## 🎯 Définition de "Done" (DoD)

Une user story est considérée comme terminée quand:

✅ Le code est écrit et fonctionne
✅ Les tests unitaires sont écrits et passent
✅ Le code est revu (code review)
✅ La documentation est à jour
✅ Les critères d'acceptation sont validés
✅ Le déploiement en environnement de test est réussi

---

## 📝 Notes

- Les estimations sont en jours-homme
- Les sprints durent 2 semaines
- La vélocité moyenne est de 12-13 jours par sprint
- Les user stories HAUTE priorité constituent le MVP (Minimum Viable Product)
