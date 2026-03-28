# Projet PFE #3 : Système de Maintenance Prédictive avec Intelligence Artificielle

## 📋 Résumé du Projet

Développement d'une plateforme intelligente qui utilise le Machine Learning pour prédire les pannes d'équipements informatiques avant qu'elles ne surviennent, détecter les anomalies, et proposer des recommandations d'actions préventives pour optimiser la maintenance et réduire les coûts.

---

## 🎯 Objectifs Principaux

### Objectif 1 : Prédire les pannes avant qu'elles arrivent
Utiliser l'IA pour analyser l'historique et les indicateurs techniques afin de prédire quand un équipement risque de tomber en panne.

### Objectif 2 : Détecter les comportements anormaux
Identifier automatiquement les équipements qui présentent des signes de dysfonctionnement ou des coûts de maintenance anormalement élevés.

### Objectif 3 : Optimiser les décisions de maintenance
Fournir des recommandations intelligentes : réparer, remplacer, réaffecter, ou surveiller un équipement.

---

## 🔧 Fonctionnalités Détaillées

### Module 1 : Gestion de la Maintenance

#### 1.1 Enregistrement des interventions
- Formulaire de création d'intervention :
  - Actif concerné (lié à la base des actifs)
  - Type d'intervention :
    - **Corrective** : réparation suite à panne
    - **Préventive** : maintenance planifiée
    - **Évolutive** : mise à niveau
  - Date et heure de l'intervention
  - Technicien responsable
  - Description du problème
  - Actions effectuées
  - Pièces remplacées (avec coûts)
  - Temps passé (heures)
  - Coût total de l'intervention
  - Statut : Planifiée, En cours, Terminée, Annulée
- Upload de photos et documents (rapports techniques)

#### 1.2 Historique de maintenance
- Vue complète de l'historique par actif :
  - Toutes les interventions passées
  - Fréquence des pannes
  - Coût total de maintenance
  - Temps d'immobilisation cumulé
  - Pièces remplacées
- Timeline visuelle des interventions
- Indicateurs clés :
  - MTBF (Mean Time Between Failures) : temps moyen entre pannes
  - MTTR (Mean Time To Repair) : temps moyen de réparation
  - Taux de disponibilité

#### 1.3 Plans de maintenance préventive
- Création de plans de maintenance récurrents :
  - Maintenance mensuelle, trimestrielle, annuelle
  - Checklist d'opérations à effectuer
  - Affectation automatique aux techniciens
- Génération automatique d'ordres de travail
- Notifications et rappels
- Suivi de l'exécution des plans

#### 1.4 Gestion des pièces détachées
- Catalogue de pièces de rechange
- Stock de pièces par site
- Alertes de stock bas
- Historique d'utilisation des pièces
- Coûts et fournisseurs

### Module 2 : Collecte de Données Techniques

#### 2.1 Sources de données

**Données manuelles (saisies par les techniciens) :**
- Interventions et pannes
- Observations terrain
- Résultats de diagnostics

**Données automatiques (collectées par des agents) :**
- **Pour les serveurs et PC :**
  - Utilisation CPU (%)
  - Utilisation RAM (%)
  - Utilisation disque (%)
  - Température CPU
  - Données SMART des disques (indicateurs de santé)
  - Uptime (temps de fonctionnement)
  - Nombre de redémarrages
  - Erreurs système (logs Windows/Linux)
- **Pour les imprimantes :**
  - Nombre de pages imprimées
  - Niveau d'encre/toner
  - Erreurs papier
  - Erreurs mécaniques
- **Pour les équipements réseau :**
  - Trafic réseau
  - Latence
  - Paquets perdus
  - Température

**Données contextuelles :**
- Âge de l'équipement
- Environnement (température ambiante, humidité)
- Intensité d'utilisation
- Utilisateur assigné

#### 2.2 Agents de collecte
- Développement d'agents légers installés sur les équipements
- Collecte périodique (toutes les heures, tous les jours)
- Envoi des données vers le serveur central
- Support Windows et Linux
- Gestion de la bande passante (compression)

#### 2.3 Intégration avec des outils existants
- Intégration avec des outils de monitoring :
  - Nagios
  - Zabbix
  - PRTG
  - Prometheus
- Import de logs système
- API pour recevoir des données externes

### Module 3 : Intelligence Artificielle Prédictive

#### 3.1 Préparation des données (Data Engineering)

**Nettoyage des données :**
- Gestion des valeurs manquantes
- Détection et traitement des outliers
- Normalisation des données

**Feature Engineering (création de variables) :**
- Calcul de statistiques :
  - Moyenne, médiane, écart-type sur les derniers 7/30/90 jours
  - Tendances (augmentation/diminution)
  - Variabilité
- Création de features temporelles :
  - Âge de l'équipement
  - Temps depuis la dernière panne
  - Nombre de pannes dans les 6 derniers mois
- Création de features métier :
  - Ratio coût maintenance / coût d'achat
  - Taux de disponibilité
  - Fréquence d'utilisation

**Labellisation des données :**
- Création de labels pour l'apprentissage supervisé :
  - **Panne dans les 30 jours** : Oui/Non
  - **Niveau de risque** : Faible/Moyen/Élevé
  - **Action recommandée** : Surveiller/Réparer/Remplacer

#### 3.2 Modèles de Machine Learning

**Modèle 1 : Prédiction de panne (Classification)**
- **Objectif** : Prédire si un équipement va tomber en panne dans les X jours
- **Type** : Classification binaire (Panne / Pas de panne)
- **Algorithmes possibles** :
  - Random Forest (recommandé pour commencer)
  - Gradient Boosting (XGBoost, LightGBM)
  - Réseaux de neurones (si beaucoup de données)
  - Support Vector Machine (SVM)
- **Features** : Toutes les données collectées + features engineerées
- **Output** : Probabilité de panne (0-100%)

**Modèle 2 : Estimation du temps avant panne (Régression)**
- **Objectif** : Estimer dans combien de jours l'équipement va tomber en panne
- **Type** : Régression
- **Algorithmes possibles** :
  - Random Forest Regressor
  - Gradient Boosting Regressor
  - Linear Regression (baseline)
- **Output** : Nombre de jours estimés avant panne

**Modèle 3 : Classification du type de panne**
- **Objectif** : Prédire quel composant va tomber en panne (disque, RAM, CPU, etc.)
- **Type** : Classification multi-classes
- **Output** : Type de panne probable

**Modèle 4 : Calcul du score de santé**
- **Objectif** : Attribuer un score de santé global (0-100)
- **Approche** : Combinaison pondérée de plusieurs indicateurs
- **Output** : Score de santé (100 = parfait, 0 = critique)

#### 3.3 Entraînement et évaluation

**Pipeline d'entraînement :**
1. Chargement des données historiques
2. Prétraitement et feature engineering
3. Séparation train/test (80/20)
4. Entraînement du modèle
5. Validation croisée (cross-validation)
6. Optimisation des hyperparamètres (Grid Search)
7. Évaluation finale

**Métriques d'évaluation :**
- **Pour la classification** :
  - Accuracy (précision globale)
  - Precision (précision des prédictions positives)
  - Recall (taux de détection des pannes)
  - F1-Score (équilibre precision/recall)
  - AUC-ROC (aire sous la courbe)
  - Matrice de confusion
- **Pour la régression** :
  - MAE (Mean Absolute Error)
  - RMSE (Root Mean Squared Error)
  - R² (coefficient de détermination)

**Réentraînement périodique :**
- Réentraînement mensuel avec nouvelles données
- Monitoring de la performance du modèle
- Détection de la dérive du modèle (model drift)

#### 3.4 Inférence et prédictions

**Processus de prédiction :**
1. Collecte des données récentes de l'équipement
2. Prétraitement et feature engineering
3. Passage dans le modèle ML
4. Génération de la prédiction
5. Calcul du score de confiance
6. Stockage de la prédiction

**Fréquence des prédictions :**
- Prédictions quotidiennes pour tous les équipements
- Prédictions à la demande (pour un équipement spécifique)
- Prédictions après chaque intervention

### Module 4 : Détection d'Anomalies

#### 4.1 Types d'anomalies détectées

**Anomalies techniques :**
- Utilisation CPU/RAM anormalement élevée
- Température excessive
- Redémarrages fréquents
- Erreurs système répétées
- Dégradation des performances

**Anomalies de maintenance :**
- Pannes trop fréquentes (> moyenne)
- Coût de maintenance anormal (> 50% du coût d'achat)
- Temps de réparation excessif
- Pièces remplacées trop souvent

**Anomalies d'utilisation :**
- Équipement sous-utilisé (< 20% du temps)
- Équipement sur-utilisé (> 95% du temps)
- Utilisation en dehors des heures normales

#### 4.2 Algorithmes de détection

**Approche 1 : Détection basée sur des seuils**
- Définition de seuils normaux pour chaque métrique
- Alerte si dépassement du seuil
- Simple mais efficace

**Approche 2 : Détection statistique**
- Calcul de la moyenne et écart-type par type d'équipement
- Détection des valeurs > 2 ou 3 écarts-types
- Z-score, IQR (Interquartile Range)

**Approche 3 : Machine Learning (plus avancé)**
- Isolation Forest
- One-Class SVM
- Autoencoders (deep learning)
- Détection d'anomalies non supervisée

#### 4.3 Gestion des alertes
- Génération automatique d'alertes
- Niveaux de criticité :
  - **Info** : Anomalie mineure
  - **Warning** : Anomalie à surveiller
  - **Critical** : Anomalie grave, action immédiate
- Notifications :
  - Email
  - SMS (pour les alertes critiques)
  - Dashboard en temps réel
- Workflow de traitement des alertes :
  - Accusé de réception
  - Investigation
  - Action corrective
  - Clôture

### Module 5 : Système de Recommandations

#### 5.1 Types de recommandations

**Recommandation 1 : Maintenance préventive**
- "Planifier une maintenance préventive pour l'équipement X dans les 7 jours"
- Basé sur : Prédiction de panne imminente

**Recommandation 2 : Remplacement**
- "Remplacer l'équipement X, coût de maintenance trop élevé"
- Basé sur : Ratio coût maintenance / coût d'achat > 70%
- Calcul du ROI du remplacement

**Recommandation 3 : Réaffectation**
- "Réaffecter l'équipement X (sous-utilisé) vers le site Y (besoin identifié)"
- Basé sur : Taux d'utilisation < 20%

**Recommandation 4 : Surveillance renforcée**
- "Surveiller de près l'équipement X (comportement anormal)"
- Basé sur : Anomalies détectées mais pas encore critiques

**Recommandation 5 : Optimisation du stock de pièces**
- "Commander des pièces Y, stock bas et demande élevée prévue"
- Basé sur : Prédictions de pannes + niveau de stock

#### 5.2 Moteur de recommandations

**Règles métier :**
- Définition de règles de décision
- Arbres de décision
- Système expert

**Scoring et priorisation :**
- Calcul d'un score de priorité pour chaque recommandation
- Facteurs :
  - Criticité de l'équipement
  - Coût de l'inaction
  - Impact sur les utilisateurs
  - Budget disponible
- Tri des recommandations par priorité

**Simulation de scénarios :**
- "Que se passe-t-il si je remplace cet équipement ?"
- Calcul du coût vs bénéfice
- Estimation du ROI

#### 5.3 Interface de recommandations
- Liste des recommandations actives
- Filtres : par type, par priorité, par site
- Détails de chaque recommandation :
  - Équipement concerné
  - Raison de la recommandation
  - Action suggérée
  - Coût estimé
  - Bénéfice attendu
- Actions possibles :
  - Accepter (créer un ordre de travail)
  - Reporter
  - Rejeter (avec justification)
- Historique des recommandations

### Module 6 : Tableaux de Bord et Visualisations

#### 6.1 Dashboard de santé du parc
- Vue d'ensemble de tous les équipements
- Répartition par score de santé :
  - Vert (80-100) : Bon état
  - Orange (50-79) : À surveiller
  - Rouge (0-49) : Critique
- Carte de chaleur (heatmap) par site
- Évolution du score de santé moyen dans le temps

#### 6.2 Dashboard de prédictions
- Nombre d'équipements à risque de panne (30 jours)
- Liste des équipements à risque avec probabilité
- Timeline des pannes prédites
- Comparaison prédictions vs pannes réelles (pour évaluer le modèle)

#### 6.3 Dashboard d'anomalies
- Nombre d'anomalies détectées (par jour/semaine)
- Répartition par type d'anomalie
- Top 10 des équipements les plus problématiques
- Alertes actives

#### 6.4 Dashboard de maintenance
- Coût total de maintenance (par mois/année)
- Répartition maintenance préventive vs corrective
- Temps d'immobilisation total
- Taux de disponibilité moyen
- Évolution des KPIs (MTBF, MTTR)

#### 6.5 Dashboard de recommandations
- Nombre de recommandations actives
- Économies potentielles si recommandations appliquées
- Taux d'acceptation des recommandations
- ROI des actions effectuées

#### 6.6 Rapports personnalisés
- Rapport mensuel de maintenance
- Rapport de performance du parc
- Rapport d'analyse prédictive
- Export PDF/Excel

### Module 7 : Administration

#### 7.1 Configuration du système
- Paramétrage des seuils d'alerte
- Configuration des modèles ML (hyperparamètres)
- Gestion des règles de recommandations
- Configuration des notifications

#### 7.2 Gestion des utilisateurs
- Rôles :
  - **Administrateur** : accès complet
  - **Responsable maintenance** : gestion des interventions et recommandations
  - **Technicien** : saisie des interventions
  - **Analyste** : consultation des dashboards
- Permissions granulaires

#### 7.3 Monitoring du système IA
- Performance des modèles en production
- Temps de réponse des prédictions
- Logs d'erreurs
- Utilisation des ressources (CPU, RAM)

---

## 🏗️ Architecture Technique

### Architecture Microservices

#### Service 1 : Maintenance Service (Backend)
- **Rôle** : Gestion des interventions, plans de maintenance
- **Technologies** : Node.js (Express) ou Python (FastAPI)
- **Base de données** : PostgreSQL

#### Service 2 : Data Collection Service (Backend)
- **Rôle** : Collecte et stockage des données techniques
- **Technologies** : Python ou Node.js
- **Base de données** : 
  - PostgreSQL (données structurées)
  - InfluxDB ou TimescaleDB (séries temporelles)
- **Message Queue** : Kafka ou RabbitMQ (pour le flux de données)

#### Service 3 : ML Service (Backend)
- **Rôle** : Entraînement et inférence des modèles ML
- **Technologies** : Python (obligatoire)
- **Bibliothèques** :
  - scikit-learn (ML classique)
  - XGBoost, LightGBM (gradient boosting)
  - TensorFlow ou PyTorch (deep learning, optionnel)
  - pandas, numpy (manipulation de données)
  - matplotlib, seaborn (visualisation)
- **MLOps** :
  - MLflow (tracking des expériences)
  - Joblib ou Pickle (sauvegarde des modèles)
- **API** : FastAPI pour servir les prédictions

#### Service 4 : Anomaly Detection Service (Backend)
- **Rôle** : Détection d'anomalies en temps réel
- **Technologies** : Python
- **Algorithmes** : Isolation Forest, statistiques
- **Streaming** : Traitement en temps réel (optionnel)

#### Service 5 : Recommendation Service (Backend)
- **Rôle** : Génération de recommandations
- **Technologies** : Python ou Node.js
- **Logique** : Règles métier + scoring

#### Service 6 : Frontend Web
- **Rôle** : Interface utilisateur complète
- **Technologies** : React.js, Vue.js ou Angular
- **Visualisations** : 
  - Chart.js, D3.js, Plotly
  - Dashboards interactifs
- **Fonctionnalités** :
  - Gestion de la maintenance
  - Dashboards et visualisations
  - Gestion des recommandations
  - Administration

#### Service 7 : Agents de Collecte
- **Rôle** : Collecte de données sur les équipements
- **Technologies** : Python (léger)
- **Déploiement** : Installé sur chaque équipement
- **Communication** : API REST ou MQTT

### Infrastructure
- **Serveur** : Linux (Ubuntu/Debian)
- **Conteneurisation** : Docker + Docker Compose
- **Base de données** : PostgreSQL + TimescaleDB
- **Message Queue** : Kafka ou RabbitMQ
- **Stockage modèles** : Système de fichiers ou S3

---

## 📊 Livrables du Projet

### Livrables techniques
1. **Code source complet** (GitHub/GitLab)
2. **Modèles ML entraînés** avec datasets
3. **Application web** déployée
4. **Agents de collecte** (Windows + Linux)
5. **API documentée** (Swagger)
6. **Base de données** avec schéma et données de test
7. **Documentation technique** (architecture, ML, installation)
8. **Guide utilisateur**
9. **Notebooks Jupyter** (exploration de données, entraînement)

### Livrables académiques
1. **Rapport de PFE** (100-150 pages)
   - État de l'art (maintenance prédictive, ML)
   - Analyse comparative des algorithmes
   - Méthodologie de data science
   - Développement des modèles ML
   - Évaluation des performances (métriques)
   - Analyse des résultats
   - Conclusion et perspectives
2. **Présentation PowerPoint** pour soutenance
3. **Vidéo de démonstration** (10 minutes)
4. **Article scientifique** (optionnel)

---

## 📅 Planning Prévisionnel (6 mois)

### Mois 1 : Analyse et Conception
- Semaine 1-2 : État de l'art (maintenance prédictive, ML)
- Semaine 3-4 : Conception de l'architecture, collecte de données historiques

### Mois 2 : Développement Backend de Base
- Semaine 5-6 : Maintenance Service
- Semaine 7-8 : Data Collection Service + Agents

### Mois 3 : Data Science et ML
- Semaine 9-10 : Exploration de données, feature engineering
- Semaine 11-12 : Développement et entraînement des modèles ML

### Mois 4 : Anomalies et Recommandations
- Semaine 13-14 : Anomaly Detection Service
- Semaine 15-16 : Recommendation Service

### Mois 5 : Frontend et Intégration
- Semaine 17-18 : Dashboards et visualisations
- Semaine 19-20 : Intégration complète, tests

### Mois 6 : Optimisation et Documentation
- Semaine 21-22 : Optimisation des modèles, tests de performance
- Semaine 23-24 : Rédaction du rapport et préparation de la soutenance

---

## 🎓 Compétences Développées

### Compétences techniques
- **Machine Learning** : Classification, régression, évaluation
- **Data Science** : Feature engineering, analyse exploratoire
- **Détection d'anomalies** : Algorithmes statistiques et ML
- **Séries temporelles** : Analyse de données temporelles
- **Développement backend** : API, microservices
- **Développement frontend** : Dashboards, visualisations
- **DevOps** : Docker, déploiement

### Compétences métier
- Maintenance industrielle
- Gestion des actifs IT
- Analyse de données techniques
- Optimisation des coûts

### Compétences académiques
- Méthodologie de data science
- Évaluation de modèles ML
- Rédaction scientifique

---

## 💡 Points Forts de ce Projet

✅ **Innovant** : IA et maintenance prédictive  
✅ **Data Science** : Projet complet de ML  
✅ **Impact business** : Réduction des coûts, optimisation  
✅ **Technique** : Compétences avancées en ML  
✅ **Mesurable** : Métriques claires (précision, économies)  
✅ **Académique** : Sujet riche pour un rapport  
✅ **Évolutif** : Amélioration continue des modèles  

---

## 🚀 Évolutions Possibles (Hors PFE)

- Deep Learning (LSTM, Transformers) pour séries temporelles
- Prédiction de la durée de vie restante (RUL - Remaining Useful Life)
- Optimisation automatique des plans de maintenance
- Intégration avec IoT (capteurs en temps réel)
- Analyse de la consommation énergétique
- Prédiction de la demande en pièces détachées
- Application mobile pour les techniciens

---

## 📞 Questions à Clarifier avec l'Encadreur

1. Y a-t-il des données historiques de maintenance disponibles ?
2. Combien d'équipements dans le parc (pour dimensionner) ?
3. Peut-on installer des agents de collecte sur les équipements ?
4. Y a-t-il des outils de monitoring déjà en place ?
5. Quel niveau de précision est attendu pour les prédictions ?
6. Faut-il développer les agents de collecte ou utiliser des outils existants ?
7. Y a-t-il des contraintes de performance (temps de réponse) ?

---

## 📚 Ressources et Références

### Bibliothèques Python
- **scikit-learn** : https://scikit-learn.org/
- **XGBoost** : https://xgboost.readthedocs.io/
- **pandas** : https://pandas.pydata.org/
- **MLflow** : https://mlflow.org/

### Datasets publics (pour tests)
- NASA Turbofan Engine Degradation
- Microsoft Azure Predictive Maintenance
- Kaggle Predictive Maintenance datasets

### Articles de référence
- "Predictive Maintenance using Machine Learning"
- "Anomaly Detection: A Survey" (Chandola et al.)
- "Remaining Useful Life Prediction"

---

**Ce projet est idéal pour un étudiant passionné par la data science et le machine learning, avec un impact business concret.**
