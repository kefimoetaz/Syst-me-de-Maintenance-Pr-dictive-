# Guide des Diagrammes de Séquence - Maintenance Prédictive

## 📋 Introduction

Les diagrammes de séquence montrent **comment les objets interagissent dans le temps** pour réaliser un cas d'utilisation. Ils sont essentiels pour comprendre le flux d'exécution du système.

---

## 📊 Les 6 Diagrammes de Séquence Créés

### 1. **Collecte et Envoi des Données Système**
**Objectif :** Montrer comment l'agent collecte les données et les envoie au serveur

**Acteurs/Objets :**
- Agent (système automatique)
- Machine
- SystemMetrics
- SmartData
- API Server
- AuthService
- Database

**Flux principal :**
1. Timer déclenché (toutes les heures)
2. Agent collecte les métriques système (CPU, RAM, disque, température)
3. Agent collecte les données SMART du disque
4. Agent s'authentifie auprès du serveur
5. Agent envoie les données via API REST
6. Serveur stocke les données dans la base

**Points clés :**
- ✅ Collecte automatique périodique
- ✅ Authentification sécurisée
- ✅ Stockage des données historiques

---

### 2. **Prédiction de Panne et Génération d'Alerte**
**Objectif :** Montrer comment le système prédit les pannes et génère des alertes

**Acteurs/Objets :**
- Scheduler (Cron Job)
- PredictionService
- PredictionModel
- Database
- FeatureEngine
- Prediction
- AlertService
- NotificationService
- User

**Flux principal :**
1. Cron job déclenché (tous les jours à 2h00)
2. Pour chaque machine active :
   - Récupération des données récentes (30 jours)
   - Feature engineering (calcul de statistiques)
   - Prédiction par le modèle ML
   - Création d'un objet Prediction
   - Sauvegarde de la prédiction
3. Si probabilité > 70% :
   - Création d'une alerte
   - Envoi de notifications (email, push)

**Points clés :**
- ✅ Analyse quotidienne automatique
- ✅ Feature engineering avant prédiction
- ✅ Seuil de 70% pour déclencher une alerte
- ✅ Notifications multi-canaux

---

### 3. **Détection d'Anomalie en Temps Réel**
**Objectif :** Montrer comment le système détecte les anomalies dès réception des données

**Acteurs/Objets :**
- API Server
- DataProcessor
- AnomalyDetector
- Database
- Anomaly
- AlertService
- NotificationService

**Flux principal :**
1. Réception de nouvelles données
2. Récupération de l'historique (7 jours)
3. Détection d'anomalie :
   - Calcul des statistiques (moyenne, écart-type)
   - Comparaison avec les seuils
4. Si anomalie détectée :
   - Calcul de la sévérité
   - Identification du type (CPU_SPIKE, MEMORY_LEAK, etc.)
   - Sauvegarde de l'anomalie
5. Si sévérité >= HIGH :
   - Création d'une alerte
   - Envoi de notifications

**Points clés :**
- ✅ Détection en temps réel
- ✅ Analyse statistique
- ✅ Alertes immédiates pour anomalies graves

---

### 4. **Consultation du Dashboard par un Technicien**
**Objectif :** Montrer comment un technicien consulte le dashboard

**Acteurs/Objets :**
- Technicien
- WebApp
- API Server
- DashboardService
- Database
- HealthScoreCalculator

**Flux principal :**
1. Authentification du technicien
2. Chargement du dashboard :
   - Récupération parallèle des données :
     - Nombre de machines
     - Alertes actives
     - Prédictions récentes
     - Nombre d'anomalies
   - Pour chaque machine :
     - Calcul du score de santé
3. Affichage du dashboard avec :
   - Vue d'ensemble du parc
   - Alertes actives
   - Machines à risque
   - Graphiques

**Points clés :**
- ✅ Chargement parallèle pour performance
- ✅ Calcul dynamique des scores de santé
- ✅ Vue d'ensemble complète

---

### 5. **Traitement d'une Alerte par un Technicien**
**Objectif :** Montrer le workflow complet de traitement d'une alerte

**Acteurs/Objets :**
- Technicien
- WebApp
- API Server
- AlertService
- Database
- MaintenanceService
- Recommendation

**Flux principal :**
1. **Consultation de l'alerte :**
   - Récupération des détails (alerte, prédiction, machine)
   - Récupération des recommandations
   - Affichage des détails

2. **Accusé de réception :**
   - Mise à jour du statut (ACKNOWLEDGED)
   - Enregistrement de l'action

3. **Création d'une intervention :**
   - Création d'un enregistrement d'intervention
   - Mise à jour du statut de l'alerte (IN_PROGRESS)

4. **Résolution et clôture :**
   - Mise à jour de l'intervention (COMPLETED)
   - Résolution de l'alerte (RESOLVED)
   - Mise à jour du statut de la machine (ACTIVE)

**Points clés :**
- ✅ Workflow complet de A à Z
- ✅ Traçabilité des actions
- ✅ Mise à jour des statuts à chaque étape

---

### 6. **Entraînement du Modèle d'IA**
**Objectif :** Montrer comment l'administrateur entraîne le modèle ML

**Acteurs/Objets :**
- Administrateur
- WebApp
- API Server
- MLService
- Database
- PredictionModel
- FeatureEngine

**Flux principal :**
1. **Déclenchement :**
   - Administrateur lance l'entraînement

2. **Collecte des données :**
   - Métriques historiques (6 mois)
   - Données SMART (6 mois)
   - Interventions de maintenance (6 mois)

3. **Préparation des données :**
   - Feature engineering
   - Labellisation (panne dans 30 jours ?)
   - Séparation train/test (80/20)

4. **Entraînement :**
   - Initialisation du modèle (Random Forest)
   - Entraînement sur les données

5. **Évaluation :**
   - Prédiction sur le jeu de test
   - Calcul des métriques (accuracy, precision, recall, F1)

6. **Sauvegarde (si accuracy > 85%) :**
   - Sérialisation du modèle
   - Sauvegarde des métriques
   - Mise à jour de la version

**Points clés :**
- ✅ Processus complet d'entraînement
- ✅ Validation avec seuil de qualité (85%)
- ✅ Versioning du modèle

---

## 🎨 Éléments des Diagrammes de Séquence

### Participants

```plantuml
actor "Utilisateur" as User          ' Acteur humain
participant "Service" as Svc         ' Objet/Service
database "Database" as DB            ' Base de données
```

### Messages

```plantuml
A -> B : message synchrone          ' Appel avec attente de réponse
A --> B : message de retour         ' Réponse
A ->> B : message asynchrone        ' Appel sans attente
A ..> B : message de création       ' Création d'objet
```

### Activation

```plantuml
activate A                          ' Début d'activation
deactivate A                        ' Fin d'activation
```

### Alternatives

```plantuml
alt Condition vraie
    A -> B : action1
else Condition fausse
    A -> C : action2
end
```

### Boucles

```plantuml
loop Pour chaque élément
    A -> B : traiter(élément)
end
```

### Parallélisme

```plantuml
par Exécution parallèle
    A -> B : action1
    A -> C : action2
end
```

### Notes

```plantuml
note right of A
  Explication
  sur plusieurs lignes
end note
```

---

## 📋 Checklist pour Créer un Diagramme de Séquence

### 1. **Identifier le cas d'utilisation**
- Quel est l'objectif ?
- Qui est l'acteur principal ?
- Quel est le déclencheur ?

### 2. **Lister les participants**
- Acteurs humains
- Services/Objets
- Bases de données
- Systèmes externes

### 3. **Définir le flux principal**
- Étape 1 : ...
- Étape 2 : ...
- Étape 3 : ...

### 4. **Identifier les alternatives**
- Que se passe-t-il si... ?
- Cas d'erreur
- Cas particuliers

### 5. **Ajouter les détails**
- Paramètres des messages
- Valeurs de retour
- Notes explicatives

---

## 🎯 Conseils pour ton PFE

### 1. **Choisis les diagrammes les plus importants**

Pour ton PFE, concentre-toi sur **3-4 diagrammes** :

**Essentiels :**
- ✅ Collecte et envoi des données (montre l'agent)
- ✅ Prédiction de panne (montre l'IA)
- ✅ Traitement d'une alerte (montre le workflow utilisateur)

**Optionnels :**
- Détection d'anomalie
- Consultation du dashboard
- Entraînement du modèle

### 2. **Adapte le niveau de détail**

**Pour le rapport PFE :**
- Diagrammes détaillés avec tous les messages
- Notes explicatives
- Alternatives et cas d'erreur

**Pour la présentation :**
- Diagrammes simplifiés
- Flux principal uniquement
- Messages clés seulement

### 3. **Utilise des couleurs (optionnel)**

```plantuml
participant "Service" as Svc #LightBlue
database "Database" as DB #LightGreen
```

### 4. **Groupe les messages liés**

```plantuml
group Authentification
    A -> B : login()
    B -> C : validate()
    C --> B : token
    B --> A : authenticated
end
```

---

## 🔧 Comment Générer les Diagrammes

### Méthode 1 : En ligne (Facile)

1. Va sur https://www.plantuml.com/plantuml/uml/
2. Copie-colle le code PlantUML
3. Clique sur "Submit"
4. Télécharge l'image (PNG, SVG)

### Méthode 2 : Localement (Recommandé)

```bash
# Installer PlantUML
# Nécessite Java

# Générer les diagrammes
java -jar plantuml.jar Diagrammes_Sequence_Maintenance_Predictive.puml

# Génère 6 fichiers PNG :
# - Sequence_1_Collecte_Donnees.png
# - Sequence_2_Prediction_Panne.png
# - Sequence_3_Detection_Anomalie.png
# - Sequence_4_Consultation_Dashboard.png
# - Sequence_5_Traitement_Alerte.png
# - Sequence_6_Entrainement_Modele.png
```

### Méthode 3 : VS Code (Pratique)

1. Installe l'extension "PlantUML"
2. Ouvre le fichier .puml
3. Appuie sur `Alt+D` pour prévisualiser
4. Exporte en PNG/SVG

---

## 📚 Ressources Complémentaires

**Documentation PlantUML :**
- https://plantuml.com/fr/sequence-diagram

**Tutoriels :**
- https://www.youtube.com/watch?v=... (cherche "PlantUML sequence diagram tutorial")

**Exemples :**
- https://real-world-plantuml.com/

---

## ✅ Résumé

**Tu as maintenant 6 diagrammes de séquence complets qui montrent :**

1. ✅ Comment l'agent collecte et envoie les données
2. ✅ Comment le système prédit les pannes
3. ✅ Comment les anomalies sont détectées
4. ✅ Comment le dashboard est chargé
5. ✅ Comment une alerte est traitée
6. ✅ Comment le modèle IA est entraîné

**Ces diagrammes couvrent tous les aspects importants de ton système !**

---

**Prêt pour ton rapport de PFE ! 🚀**

Besoin d'autres diagrammes (composants, déploiement) ?
