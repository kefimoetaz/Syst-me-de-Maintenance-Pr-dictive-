# Projet PFE #4 : Système de Ticketing Intelligent avec Assistant Conversationnel (Chatbot)

## 📋 Résumé du Projet

Développement d'une plateforme de gestion des demandes de support IT avec un assistant conversationnel intelligent (chatbot) qui aide les utilisateurs à résoudre leurs problèmes, guide les diagnostics, et crée automatiquement des tickets avec les bonnes informations.

---

## 🎯 Objectifs Principaux

### Objectif 1 : Centraliser les demandes de support
Créer un système unique pour gérer toutes les demandes d'assistance IT (pannes, demandes d'équipement, questions).

### Objectif 2 : Automatiser le support de niveau 1
Utiliser un chatbot intelligent pour répondre aux questions fréquentes et résoudre les problèmes simples sans intervention humaine.

### Objectif 3 : Améliorer l'efficacité du support
Réduire le temps de traitement des tickets grâce à une meilleure catégorisation et priorisation automatique.

---

## 🔧 Fonctionnalités Détaillées

### Module 1 : Système de Ticketing

#### 1.1 Création de tickets

**Création manuelle (formulaire web) :**
- Formulaire de création avec champs :
  - **Titre** : Résumé du problème
  - **Description** : Détails complets
  - **Catégorie** :
    - Panne matérielle (PC, imprimante, etc.)
    - Problème logiciel
    - Demande d'accès/permissions
    - Demande de nouvel équipement
    - Question/Information
    - Autre
  - **Priorité** :
    - Basse : Pas urgent
    - Normale : Traitement standard
    - Haute : Impact sur le travail
    - Critique : Blocage complet
  - **Actif concerné** : Sélection depuis la base des actifs (optionnel)
  - **Pièces jointes** : Screenshots, photos, documents
  - **Localisation** : Site, bâtiment, bureau
- Validation des champs obligatoires
- Numéro de ticket généré automatiquement (ex: TKT-2024-00123)

**Création par email :**
- Envoi d'un email à support@poulina.tn
- Parsing automatique de l'email
- Création automatique du ticket
- Réponse automatique avec numéro de ticket

**Création via chatbot :**
- Conversation guidée avec le chatbot
- Extraction automatique des informations
- Création du ticket avec contexte complet

#### 1.2 Gestion du cycle de vie des tickets

**Statuts possibles :**
- **Nouveau** : Ticket créé, pas encore assigné
- **Assigné** : Assigné à un technicien
- **En cours** : Technicien travaille dessus
- **En attente** : Attente d'information de l'utilisateur
- **Résolu** : Solution proposée, attente de confirmation
- **Fermé** : Problème résolu et confirmé
- **Annulé** : Ticket annulé (doublon, erreur)

**Workflow automatique :**
- Assignation automatique selon :
  - Catégorie du ticket
  - Disponibilité des techniciens
  - Compétences requises
  - Charge de travail actuelle
- Escalade automatique si pas de réponse dans X heures
- Notifications à chaque changement de statut

**Actions sur un ticket :**
- Ajouter un commentaire (interne ou visible par l'utilisateur)
- Changer le statut
- Modifier la priorité
- Réassigner à un autre technicien
- Lier à un actif
- Lier à d'autres tickets (doublons, liés)
- Ajouter des pièces jointes
- Enregistrer le temps passé
- Marquer comme résolu
- Fermer le ticket

#### 1.3 Suivi et notifications

**Pour l'utilisateur :**
- Email de confirmation à la création
- Notifications à chaque mise à jour
- Possibilité de répondre par email (ajouté comme commentaire)
- Accès à un portail pour suivre ses tickets
- Évaluation de la satisfaction après résolution (1-5 étoiles)

**Pour les techniciens :**
- Notifications des nouveaux tickets assignés
- Alertes pour les tickets urgents
- Rappels pour les tickets en retard
- Dashboard personnel des tickets

#### 1.4 Base de connaissances (Knowledge Base)

**Articles de résolution :**
- Création d'articles de documentation :
  - Titre
  - Catégorie
  - Mots-clés
  - Description du problème
  - Solution étape par étape
  - Screenshots/vidéos
  - Actifs concernés
- Recherche dans la base de connaissances
- Suggestion d'articles pertinents lors de la création de ticket
- Statistiques d'utilisation des articles

**Création automatique depuis les tickets :**
- Conversion d'un ticket résolu en article
- Extraction automatique de la solution
- Validation par un administrateur

### Module 2 : Assistant Conversationnel (Chatbot)

#### 2.1 Interface du chatbot

**Widget de chat :**
- Widget intégré sur le portail web
- Bulle de chat en bas à droite
- Interface conversationnelle intuitive
- Support du texte et des boutons de réponse rapide
- Historique de la conversation
- Possibilité d'envoyer des images

**Canaux de communication :**
- Web (widget)
- Application mobile (optionnel)
- Microsoft Teams (intégration)
- Slack (intégration)
- WhatsApp (optionnel)

#### 2.2 Capacités du chatbot

**Compréhension du langage naturel (NLP) :**
- Compréhension du français (et arabe si possible)
- Détection de l'intention de l'utilisateur :
  - Signaler un problème
  - Poser une question
  - Demander un équipement
  - Suivre un ticket existant
  - Obtenir de l'aide
- Extraction d'entités :
  - Type de problème
  - Équipement concerné
  - Urgence
  - Localisation

**Réponses aux questions fréquentes (FAQ) :**
- "Comment réinitialiser mon mot de passe ?"
- "Mon imprimante ne fonctionne pas, que faire ?"
- "Comment demander un nouvel ordinateur ?"
- "Où trouver le numéro de série de mon PC ?"
- "Comment installer le VPN ?"
- Réponses instantanées depuis la base de connaissances

**Diagnostic guidé :**
- Conversation interactive pour diagnostiquer un problème
- Exemple pour "Mon PC ne démarre pas" :
  - Bot : "Le voyant d'alimentation est-il allumé ?"
  - User : "Non"
  - Bot : "Vérifiez que le câble d'alimentation est bien branché. Est-ce fait ?"
  - User : "Oui, toujours rien"
  - Bot : "Je vais créer un ticket pour une intervention technique."
- Arbre de décision pour les problèmes courants

**Création assistée de tickets :**
- Collecte des informations nécessaires via conversation
- Bot : "Quel est le problème que vous rencontrez ?"
- User : "Mon écran ne s'allume plus"
- Bot : "Quel est le numéro de série de votre écran ?" (ou scan QR code)
- Bot : "Est-ce urgent ?"
- Bot : "Parfait, j'ai créé le ticket TKT-2024-00123. Un technicien va vous contacter."

**Suivi de tickets :**
- User : "Où en est mon ticket ?"
- Bot : "Votre ticket TKT-2024-00123 est en cours de traitement par Ahmed. Il devrait vous contacter aujourd'hui."

**Recherche dans la base de connaissances :**
- User : "Comment configurer ma messagerie ?"
- Bot : "Voici un article qui explique la configuration : [lien]"

#### 2.3 Intelligence artificielle du chatbot

**Approche 1 : Chatbot basé sur des règles (plus simple)**
- Définition de patterns et réponses
- Arbres de décision pour les diagnostics
- Matching de mots-clés
- Bon pour commencer, limité en flexibilité

**Approche 2 : Chatbot avec NLP/ML (plus avancé)**
- **Intent Classification** : Classifier l'intention de l'utilisateur
  - Algorithmes : Naive Bayes, SVM, ou BERT
  - Entraînement sur des exemples de phrases
- **Entity Recognition** : Extraire les entités (équipement, urgence, etc.)
  - NER (Named Entity Recognition)
  - spaCy, Hugging Face
- **Dialogue Management** : Gérer le flux de conversation
  - Rasa (framework open source)
  - Dialogflow (Google)
  - Microsoft Bot Framework
- **Response Generation** : Générer des réponses
  - Templates + variables
  - Ou génération par LLM (GPT, optionnel)

**Technologies suggérées :**
- **Rasa** (open source, recommandé) : Framework complet pour chatbots
- **Dialogflow** (Google) : Service cloud, facile à utiliser
- **Microsoft Bot Framework** : Intégration avec Teams
- **spaCy** : NLP en Python
- **Hugging Face Transformers** : Modèles de langage pré-entraînés

**Entraînement du chatbot :**
- Création d'un dataset d'entraînement :
  - Exemples de phrases pour chaque intention
  - Annotations des entités
- Entraînement du modèle de classification
- Tests et amélioration itérative
- Apprentissage continu depuis les conversations réelles

#### 2.4 Fonctionnalités avancées

**Contexte de conversation :**
- Mémorisation du contexte dans la conversation
- User : "Mon PC ne démarre pas"
- Bot : "Quel est le numéro de série ?"
- User : "SN123456"
- Bot se souvient qu'on parle du PC SN123456

**Personnalisation :**
- Reconnaissance de l'utilisateur (authentifié)
- Accès à l'historique de ses tickets
- Connaissance de ses équipements assignés
- Réponses personnalisées

**Multilinguisme :**
- Support du français
- Support de l'arabe (optionnel mais valorisant)
- Détection automatique de la langue

**Handoff vers un humain :**
- Si le bot ne peut pas aider, transfert vers un technicien
- Chat en direct avec un technicien (optionnel)
- Création automatique d'un ticket avec tout le contexte

### Module 3 : Portail Utilisateur

#### 3.1 Dashboard utilisateur
- Vue d'ensemble de mes tickets :
  - Tickets ouverts
  - Tickets en cours
  - Tickets résolus récemment
- Statistiques personnelles
- Accès rapide au chatbot

#### 3.2 Mes tickets
- Liste complète de mes tickets
- Filtres : par statut, par date, par catégorie
- Recherche
- Détails d'un ticket :
  - Historique complet
  - Commentaires
  - Pièces jointes
  - Statut actuel
- Ajout de commentaires
- Évaluation de la satisfaction

#### 3.3 Mes équipements
- Liste des équipements qui me sont assignés
- Informations : modèle, numéro de série, état
- Historique de maintenance
- Signaler un problème (création rapide de ticket)

#### 3.4 Base de connaissances
- Recherche d'articles
- Navigation par catégorie
- Articles populaires
- Articles récents

### Module 4 : Portail Technicien

#### 4.1 Dashboard technicien
- Mes tickets assignés
- Tickets en attente
- Tickets urgents
- Statistiques personnelles :
  - Nombre de tickets résolus (aujourd'hui, cette semaine, ce mois)
  - Temps moyen de résolution
  - Taux de satisfaction

#### 4.2 Gestion des tickets
- Liste de tous les tickets (avec filtres avancés)
- Vue Kanban (colonnes par statut)
- Vue liste
- Vue calendrier (pour les interventions planifiées)
- Assignation de tickets
- Traitement des tickets

#### 4.3 Base de connaissances
- Création d'articles
- Modification d'articles
- Validation d'articles proposés

### Module 5 : Administration

#### 5.1 Configuration du système

**Paramètres généraux :**
- Catégories de tickets (ajout, modification)
- Niveaux de priorité
- SLA (Service Level Agreement) par priorité :
  - Critique : réponse en 1h, résolution en 4h
  - Haute : réponse en 4h, résolution en 24h
  - Normale : réponse en 24h, résolution en 72h
  - Basse : réponse en 48h, résolution en 1 semaine
- Templates d'emails
- Règles d'assignation automatique

**Configuration du chatbot :**
- Entraînement du chatbot (ajout d'intentions, d'entités)
- Gestion des réponses FAQ
- Arbres de décision pour les diagnostics
- Activation/désactivation de fonctionnalités

#### 5.2 Gestion des utilisateurs
- Rôles :
  - **Utilisateur final** : Créer et suivre ses tickets
  - **Technicien** : Traiter les tickets
  - **Superviseur** : Vue d'ensemble, réassignation
  - **Administrateur** : Configuration complète
- Gestion des équipes de support
- Compétences des techniciens (pour assignation intelligente)

#### 5.3 Rapports et statistiques

**Rapports de performance :**
- Nombre de tickets (par jour, semaine, mois)
- Répartition par catégorie
- Répartition par priorité
- Temps moyen de résolution
- Taux de résolution au premier contact
- Taux de satisfaction client
- Performance par technicien
- Tickets en retard (SLA non respecté)

**Rapports sur le chatbot :**
- Nombre de conversations
- Taux de résolution automatique (sans création de ticket)
- Questions les plus fréquentes
- Intentions non comprises (pour améliorer le bot)
- Taux de handoff vers humain

**Exports :**
- Export Excel/CSV
- Rapports PDF
- Graphiques et visualisations

### Module 6 : Intégrations

#### 6.1 Intégration avec le système d'actifs
- Liaison tickets ↔ actifs
- Historique des tickets par actif
- Création automatique d'intervention de maintenance depuis un ticket

#### 6.2 Intégration avec Active Directory / LDAP
- Authentification unique (SSO)
- Import automatique des utilisateurs
- Synchronisation des informations (nom, email, département)

#### 6.3 Intégration avec la messagerie
- Création de tickets par email
- Notifications par email
- Réponses par email ajoutées comme commentaires

#### 6.4 Intégration avec Microsoft Teams / Slack
- Notifications dans Teams/Slack
- Chatbot accessible depuis Teams/Slack
- Création de tickets depuis Teams/Slack

---

## 🏗️ Architecture Technique

### Architecture Microservices

#### Service 1 : Ticketing Service (Backend)
- **Rôle** : Gestion CRUD des tickets
- **Technologies** : Node.js (Express) ou Python (FastAPI) ou Java (Spring Boot)
- **Base de données** : PostgreSQL ou MongoDB
- **API REST** : Endpoints pour toutes les opérations

#### Service 2 : Chatbot Service (Backend)
- **Rôle** : Traitement des conversations, NLP
- **Technologies** : Python (obligatoire pour NLP)
- **Framework** : Rasa, Dialogflow, ou custom
- **Bibliothèques** :
  - Rasa (chatbot framework)
  - spaCy (NLP)
  - Hugging Face Transformers (modèles de langage)
- **API** : WebSocket ou REST pour communication en temps réel

#### Service 3 : Knowledge Base Service (Backend)
- **Rôle** : Gestion de la base de connaissances
- **Technologies** : Node.js ou Python
- **Recherche** : Elasticsearch (recherche full-text avancée)
- **Base de données** : PostgreSQL

#### Service 4 : Notification Service (Backend)
- **Rôle** : Envoi de notifications (email, SMS, push)
- **Technologies** : Node.js ou Python
- **Services** :
  - SMTP pour emails
  - Twilio pour SMS (optionnel)
  - Firebase Cloud Messaging pour push (optionnel)

#### Service 5 : Frontend Web
- **Rôle** : Interface utilisateur (portail utilisateur + technicien + admin)
- **Technologies** : React.js, Vue.js ou Angular
- **Widget chatbot** : Intégré dans le frontend
- **Communication** : WebSocket pour le chat en temps réel

#### Service 6 : Integration Service (Backend)
- **Rôle** : Intégrations avec systèmes externes
- **Technologies** : Node.js ou Python
- **Intégrations** :
  - Active Directory / LDAP
  - Microsoft Teams / Slack
  - Système d'actifs

### Communication entre services
- **API REST** : Communication synchrone
- **WebSocket** : Chat en temps réel
- **Message Queue** (optionnel) : RabbitMQ pour notifications asynchrones

### Infrastructure
- **Serveur** : Linux (Ubuntu/Debian)
- **Conteneurisation** : Docker + Docker Compose
- **Base de données** : PostgreSQL
- **Recherche** : Elasticsearch (pour KB et recherche de tickets)
- **Cache** : Redis (pour sessions, cache)

---

## 📊 Livrables du Projet

### Livrables techniques
1. **Code source complet** (GitHub/GitLab)
2. **Application web** déployée et fonctionnelle
3. **Chatbot entraîné** avec dataset
4. **Base de données** avec schéma et données de test
5. **API documentée** (Swagger/OpenAPI)
6. **Documentation technique** (architecture, installation, entraînement du chatbot)
7. **Guide utilisateur**
8. **Guide d'administration**

### Livrables académiques
1. **Rapport de PFE** (80-120 pages)
   - État de l'art (chatbots, NLP, systèmes de ticketing)
   - Analyse comparative des solutions existantes
   - Conception de l'architecture
   - Développement du chatbot (NLP, dialogue management)
   - Évaluation des performances du chatbot
   - Tests et validation
   - Conclusion et perspectives
2. **Présentation PowerPoint** pour soutenance
3. **Vidéo de démonstration** (5-10 minutes)

---

## 📅 Planning Prévisionnel (4-5 mois)

### Mois 1 : Analyse et Conception
- Semaine 1-2 : État de l'art (chatbots, NLP, ticketing)
- Semaine 3-4 : Conception de l'architecture, maquettes UI/UX

### Mois 2 : Développement Backend
- Semaine 5-6 : Ticketing Service (CRUD tickets)
- Semaine 7-8 : Knowledge Base Service

### Mois 3 : Développement du Chatbot
- Semaine 9-10 : Chatbot basique (règles + FAQ)
- Semaine 11-12 : NLP et amélioration du chatbot

### Mois 4 : Frontend et Intégration
- Semaine 13-14 : Portail utilisateur et technicien
- Semaine 15-16 : Intégration chatbot + ticketing, tests

### Mois 5 : Finalisation et Documentation
- Semaine 17-18 : Tests utilisateurs, corrections
- Semaine 19-20 : Rédaction du rapport et préparation de la soutenance

---

## 🎓 Compétences Développées

### Compétences techniques
- **NLP (Natural Language Processing)** : Compréhension du langage
- **Chatbot development** : Conception et développement
- **Développement full-stack** : Frontend + backend
- **API REST et WebSocket**
- **Bases de données**
- **Recherche full-text** (Elasticsearch)

### Compétences métier
- Gestion de support IT (ITSM)
- Service client
- Gestion de connaissances

---

## 💡 Points Forts de ce Projet

✅ **Innovant** : Chatbot intelligent avec NLP  
✅ **Utile** : Améliore l'efficacité du support  
✅ **Complet** : Frontend + backend + IA  
✅ **Mesurable** : Taux de résolution automatique, satisfaction  
✅ **Évolutif** : Apprentissage continu du chatbot  
✅ **Réaliste** : Faisable en 4-5 mois  

---

## 🚀 Évolutions Possibles (Hors PFE)

- Chatbot vocal (reconnaissance et synthèse vocale)
- Intégration avec WhatsApp
- Chat en direct avec techniciens
- Analyse de sentiment des utilisateurs
- Prédiction de la catégorie et priorité automatique
- Suggestion automatique de solutions (ML)
- Application mobile native

---

## 📞 Questions à Clarifier avec l'Encadreur

1. Faut-il développer un chatbot avancé (NLP/ML) ou basique (règles) ?
2. Quelles intégrations sont prioritaires (Teams, Slack, AD) ?
3. Faut-il supporter l'arabe en plus du français ?
4. Y a-t-il des données historiques de tickets pour entraîner le chatbot ?
5. Quel est le volume de tickets attendu (pour dimensionner) ?
6. Faut-il un chat en direct avec techniciens ou juste le chatbot ?

---

## 📚 Ressources et Références

### Frameworks et outils
- **Rasa** : https://rasa.com/ (chatbot framework open source)
- **Dialogflow** : https://cloud.google.com/dialogflow (Google)
- **spaCy** : https://spacy.io/ (NLP)
- **Hugging Face** : https://huggingface.co/ (modèles de langage)

### Datasets pour entraînement
- Création d'un dataset custom de conversations
- Utilisation de datasets publics pour le français

---

**Ce projet est idéal pour un étudiant intéressé par le NLP et les chatbots, avec une application pratique dans le support IT.**
