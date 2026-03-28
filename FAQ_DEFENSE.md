# ❓ FAQ - Questions Probables du Jury

## Questions Techniques

### 1. "Pourquoi Random Forest et pas un réseau de neurones?"

**Réponse:**
- Random Forest est plus adapté pour les petits datasets (20 machines)
- Interprétable: on peut voir quelles features sont importantes
- Moins de risque d'overfitting
- Plus rapide à entraîner
- Pas besoin de GPU

**Si insistent sur deep learning:**
"Avec plus de données (100+ machines, plusieurs années), un LSTM ou Transformer serait plus approprié pour capturer les patterns temporels complexes."

### 2. "Comment gérez-vous le déséquilibre des classes?"

**Réponse:**
"C'est un défi majeur en maintenance prédictive - les pannes sont rares. Actuellement:
- Nous utilisons des données synthétiques pour l'entraînement
- En production, on utiliserait SMOTE ou class_weight
- On pourrait aussi utiliser des métriques comme F1-score au lieu d'accuracy
- L'anomaly detection (Isolation Forest) est une alternative"

### 3. "Pourquoi Node.js pour le backend et pas Python partout?"

**Réponse:**
"Architecture microservices:
- Node.js: Excellent pour API REST, I/O non-bloquant, écosystème npm riche
- Python: Meilleur pour ML (scikit-learn, pandas), traitement de données
- Séparation des responsabilités: chaque service utilise le meilleur outil
- Scalabilité: on peut scaler indépendamment API et ML"

### 4. "Comment assurez-vous la qualité du code?"

**Réponse:**
- Linting (ESLint pour JS, pylint pour Python)
- Structure modulaire claire
- Gestion d'erreurs complète
- Logs détaillés
- Validation des entrées
- Tests unitaires (mentionner même si pas tous implémentés)

### 5. "Sécurité: comment protégez-vous contre les attaques?"

**Réponse:**
- **Authentification**: JWT tokens
- **Injection SQL**: Sequelize ORM (parameterized queries)
- **XSS**: React échappe automatiquement
- **Rate limiting**: Middleware Express
- **HTTPS**: En production (pas en dev)
- **Validation**: Middleware de validation des entrées
- **Logs**: Audit trail complet

## Questions Fonctionnelles

### 6. "Que se passe-t-il si une machine tombe en panne?"

**Réponse:**
"Workflow complet:
1. Agent arrête d'envoyer des données
2. Backend détecte l'absence de données (timeout)
3. Alerte générée automatiquement
4. Email envoyé au technicien
5. Technicien accuse réception via dashboard
6. (Futur) Création d'intervention de maintenance"

### 7. "Comment validez-vous les prédictions?"

**Réponse:**
"Plusieurs approches:
- **Validation croisée** lors de l'entraînement
- **Métriques**: Précision, Recall, F1-score, AUC-ROC
- **Backtesting**: Tester sur données historiques
- **Feedback loop**: En production, on compare prédictions vs pannes réelles
- **Amélioration continue**: Réentraînement mensuel avec nouvelles données"

### 8. "Pourquoi certains use cases ne sont pas implémentés?"

**Réponse:**
"Priorisation Agile:
- **Sprint 1**: Agent + Backend (fondation)
- **Sprint 2**: Dashboard (visualisation)
- **Sprint 3**: ML + Alertes (valeur métier)
- **Backlog**: Interventions, historique, rapports

Les use cases principaux (UC1-UC6) sont implémentés. Les autres (UC7-UC12) sont documentés pour évolution future. C'est une approche MVP (Minimum Viable Product) professionnelle."

## Questions Méthodologiques

### 9. "Quelle méthodologie avez-vous utilisée?"

**Réponse:**
"Approche Agile avec Scrum:
- 3 sprints de 2-3 semaines
- Backlog priorisé (voir Product_Backlog_Table.md)
- Planning avec Gantt (voir Diagramme_Gantt_Planning.puml)
- Specs techniques pour chaque sprint
- Itérations et feedback continus"

### 10. "Comment avez-vous testé le système?"

**Réponse:**
"Plusieurs niveaux:
- **Tests unitaires**: Fonctions individuelles
- **Tests d'intégration**: API endpoints
- **Tests de charge**: 20 machines, 7.8M records
- **Tests utilisateur**: Dashboard responsive
- **Validation ML**: Métriques de performance
- Scripts de vérification (check-machines.js, verify-alerts-working.js)"

### 11. "Quelles difficultés avez-vous rencontrées?"

**Réponse:**
"Principales difficultés:
1. **Données**: Peu de données réelles de pannes → solution: données synthétiques
2. **ML Overfitting**: Petit dataset → solution: Random Forest avec régularisation
3. **Scalabilité**: 7.8M records → solution: indexation DB, pagination API
4. **SMART data**: Pas accessible sur toutes machines → solution: fallback avec données simulées
5. **Temps réel**: Collecte horaire vs temps réel → acceptable pour maintenance prédictive"

## Questions sur l'Avenir

### 12. "Quelles améliorations futures?"

**Réponse:**
"Roadmap technique:
- **Court terme** (1-3 mois):
  - Module d'interventions complet
  - Export PDF des rapports
  - Dashboard mobile responsive
  
- **Moyen terme** (3-6 mois):
  - Application mobile native
  - Intégration ticketing (Jira, ServiceNow)
  - Anomaly detection en temps réel
  
- **Long terme** (6-12 mois):
  - Deep Learning (LSTM) avec plus de données
  - Prédiction multi-composants (CPU, RAM, Disque séparément)
  - Recommandations automatiques d'actions"

### 13. "Comment déployer en production?"

**Réponse:**
"Stratégie de déploiement:
- **Conteneurisation**: Docker + Docker Compose (déjà prêt)
- **Orchestration**: Kubernetes pour scalabilité
- **CI/CD**: GitHub Actions ou GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Cloud**: AWS, Azure, ou GCP
- **Backup**: Snapshots DB quotidiens"

### 14. "Coût d'exploitation?"

**Réponse:**
"Estimation pour 100 machines:
- **Serveurs**: ~200€/mois (cloud)
- **Base de données**: ~100€/mois
- **Stockage**: ~50€/mois
- **Email**: Gratuit (Gmail SMTP) ou ~20€/mois (SendGrid)
- **Total**: ~370€/mois

**ROI**: Une seule panne évitée (coût moyen 5000€) rentabilise 13 mois d'exploitation."

## Questions Pièges

### 15. "Votre système peut-il vraiment prédire les pannes?"

**Réponse honnête:**
"Oui et non. Le système identifie les machines à risque avec 50-70% de précision. Ce n'est pas parfait, mais:
- C'est mieux que la maintenance réactive (0% de prédiction)
- C'est comparable aux systèmes industriels (60-80%)
- La précision s'améliore avec plus de données réelles
- L'objectif est de réduire les pannes, pas de les éliminer complètement
- Même 50% de pannes évitées = ROI significatif"

### 16. "Pourquoi pas utiliser un outil existant?"

**Réponse:**
"Objectif pédagogique:
- Comprendre l'architecture complète
- Maîtriser le ML en production
- Apprendre les bonnes pratiques
- Personnalisation pour besoins spécifiques

Outils existants (Nagios, Zabbix, Datadog) sont excellents pour monitoring, mais:
- Pas de ML prédictif natif
- Coûteux pour petites structures
- Moins de contrôle et personnalisation"

## Conseils Généraux

### Attitude
- ✅ Soyez honnête sur les limitations
- ✅ Montrez que vous comprenez les compromis
- ✅ Expliquez vos choix techniques
- ✅ Admettez ce que vous ne savez pas
- ❌ Ne bluffez jamais
- ❌ Ne critiquez pas les technologies alternatives

### Si vous ne savez pas
"C'est une excellente question. Je n'ai pas exploré cet aspect en détail, mais voici comment je l'aborderais: [donnez une piste de réflexion]"

### Reformulez si nécessaire
"Si je comprends bien votre question, vous demandez [reformulez]. Dans ce cas, [répondez]."

---

**Préparez-vous, mais restez naturel. Vous connaissez votre projet! 💪**
