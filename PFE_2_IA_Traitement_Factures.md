# Projet PFE #2 : Système Intelligent de Traitement Automatique de Factures avec IA

## 📋 Résumé du Projet

Développement d'une plateforme intelligente qui utilise l'intelligence artificielle (OCR + NLP) pour extraire automatiquement les données des factures d'achat (PDF/images), valider les informations, et créer automatiquement les actifs informatiques dans le système de gestion.

---

## 🎯 Objectifs Principaux

### Objectif 1 : Automatiser l'extraction de données
Éliminer la saisie manuelle des factures en utilisant l'IA pour lire et comprendre automatiquement les documents d'achat.

### Objectif 2 : Réduire les erreurs humaines
Garantir la précision des données extraites avec un système de validation et de score de confiance.

### Objectif 3 : Accélérer le processus d'enregistrement
Passer d'une facture PDF à des actifs enregistrés en quelques minutes au lieu de plusieurs heures.

---

## 🔧 Fonctionnalités Détaillées

### Module 1 : Gestion des Documents d'Achat

#### 1.1 Upload et stockage de documents
- Interface de téléchargement (drag & drop)
- Support de multiples formats :
  - PDF (natif ou scanné)
  - Images (JPG, PNG)
  - Documents multi-pages
- Stockage sécurisé des documents originaux
- Métadonnées : date d'upload, utilisateur, statut
- Prévisualisation du document

#### 1.2 Gestion du catalogue de documents
- Liste de tous les documents uploadés
- Filtres : par date, par statut, par fournisseur
- Statuts possibles :
  - **En attente** : uploadé, pas encore traité
  - **En traitement** : en cours d'extraction IA
  - **En validation** : extraction terminée, attend validation humaine
  - **Validé** : approuvé, actifs créés
  - **Rejeté** : document invalide ou erreur
- Recherche par numéro de facture ou fournisseur
- Suppression de documents

### Module 2 : Intelligence Artificielle d'Extraction

#### 2.1 Pipeline de traitement

**Étape 1 : Prétraitement de l'image**
- Détection et correction de l'orientation
- Amélioration de la qualité (contraste, netteté)
- Détection des zones de texte
- Binarisation pour améliorer l'OCR

**Étape 2 : OCR (Optical Character Recognition)**
- Extraction du texte brut du document
- Technologies possibles :
  - Tesseract OCR (open source)
  - Google Cloud Vision API
  - AWS Textract
  - Azure Computer Vision
- Support du français et de l'arabe
- Préservation de la structure spatiale (position des textes)

**Étape 3 : Compréhension du document (NLP + Layout Analysis)**
- Identification du type de document (facture, bon de livraison, devis)
- Détection de la structure :
  - En-tête (informations fournisseur)
  - Informations client
  - Tableau des articles
  - Totaux et taxes
- Extraction des champs clés :
  - **Fournisseur** : nom, adresse, téléphone, email
  - **Numéro de facture**
  - **Date de facture**
  - **Date d'échéance**
  - **Montant HT** (Hors Taxes)
  - **Montant TVA**
  - **Montant TTC** (Toutes Taxes Comprises)
  - **Devise**
- Extraction des lignes d'articles :
  - Désignation/Description
  - Référence produit
  - Quantité
  - Prix unitaire HT
  - Total ligne HT
  - Taux de TVA

**Étape 4 : Validation et cohérence**
- Vérification mathématique : somme des lignes = total HT
- Vérification : HT + TVA = TTC
- Détection d'incohérences
- Calcul d'un score de confiance par champ (0-100%)

#### 2.2 Modèle d'IA

**Approche 1 : Modèle basé sur des règles + ML**
- Utilisation de templates pour les fournisseurs récurrents
- Apprentissage automatique pour améliorer l'extraction
- Modèle de classification pour identifier les champs

**Approche 2 : Deep Learning (plus avancé)**
- Utilisation de modèles pré-entraînés :
  - LayoutLM (Microsoft) : comprend la mise en page
  - Donut (Document Understanding Transformer)
  - BERT pour l'extraction d'entités nommées
- Fine-tuning sur des factures réelles

**Technologies suggérées :**
- Python (langage principal pour l'IA)
- Tesseract OCR ou API cloud
- spaCy ou Hugging Face Transformers (NLP)
- OpenCV (traitement d'image)
- TensorFlow ou PyTorch (si deep learning)

#### 2.3 Score de confiance et alertes
- Calcul d'un score de confiance global (0-100%)
- Score par champ individuel
- Règles d'alerte :
  - Score < 70% → validation humaine obligatoire
  - Score 70-90% → validation recommandée
  - Score > 90% → validation automatique possible
- Mise en évidence des champs à faible confiance

### Module 3 : Interface de Validation Humaine

#### 3.1 Vue de validation
- Affichage côte à côte :
  - **Gauche** : Document original (PDF/image)
  - **Droite** : Données extraites (formulaire éditable)
- Zoom et navigation dans le document
- Surlignage des zones extraites sur le document

#### 3.2 Correction et validation
- Édition de tous les champs extraits
- Indicateurs visuels :
  - Vert : haute confiance
  - Orange : confiance moyenne
  - Rouge : faible confiance ou erreur détectée
- Ajout/suppression de lignes d'articles
- Validation champ par champ ou globale
- Commentaires et notes

#### 3.3 Feedback pour l'IA (Human-in-the-loop)
- Enregistrement des corrections effectuées
- Utilisation des corrections pour améliorer le modèle
- Apprentissage continu :
  - Nouvelles règles d'extraction
  - Amélioration des templates fournisseurs
  - Réentraînement périodique du modèle

### Module 4 : Normalisation et Rapprochement

#### 4.1 Normalisation des désignations
- Problème : Même produit, différentes écritures
  - "PC Dell Latitude 5420"
  - "Ordinateur portable DELL LAT 5420"
  - "Dell Latitude 5420 i5 8Go"
- Solution : Algorithme de normalisation
  - Extraction de la marque
  - Extraction du modèle
  - Nettoyage des variations
- Utilisation de techniques :
  - Fuzzy matching (similarité de chaînes)
  - Règles métier
  - Base de référence produits

#### 4.2 Rapprochement avec le référentiel
- Création d'un référentiel produits :
  - Catégories (PC, serveur, imprimante, etc.)
  - Marques (Dell, HP, Lenovo, etc.)
  - Modèles standards
- Matching automatique :
  - Recherche du produit dans le référentiel
  - Proposition de correspondances
  - Score de similarité
- Enrichissement automatique :
  - Ajout de la catégorie
  - Ajout de spécifications techniques
  - Ajout d'informations de garantie standard

#### 4.3 Gestion du référentiel
- Interface d'administration du référentiel
- Ajout manuel de nouveaux produits
- Fusion de doublons
- Historique des modifications

### Module 5 : Création Automatique des Actifs

#### 5.1 Génération des actifs
- Après validation de la facture :
  - Création automatique d'un actif par ligne d'article
  - Remplissage automatique des champs :
    - Catégorie (depuis le référentiel)
    - Marque et modèle (normalisés)
    - Date d'achat (date de facture)
    - Coût d'acquisition (prix unitaire)
    - Fournisseur (extrait de la facture)
    - Garantie (durée standard ou extraite)
    - État initial : "En stock"
- Génération automatique de QR codes
- Liaison avec le document source (facture)

#### 5.2 Gestion des quantités
- Si quantité > 1 : création de N actifs identiques
- Numérotation automatique (suffixe -01, -02, etc.)
- Option : numéros de série individuels (si disponibles)

#### 5.3 Règles de gestion
- Vérification des doublons (même numéro de série)
- Affectation automatique à un site (selon règles)
- Notification aux gestionnaires d'actifs
- Workflow d'approbation (optionnel)

### Module 6 : Tableaux de Bord et Reporting

#### 6.1 Dashboard de traitement
- Nombre de factures traitées (par jour/mois)
- Taux de validation automatique vs manuelle
- Temps moyen de traitement
- Taux d'erreur de l'IA
- Évolution du score de confiance moyen

#### 6.2 Statistiques d'achat
- Montant total des achats (par période)
- Répartition par fournisseur
- Répartition par catégorie de produit
- Évolution des achats dans le temps
- Top 10 des produits achetés

#### 6.3 Analyse de performance de l'IA
- Précision par champ (accuracy)
- Champs les plus problématiques
- Fournisseurs les mieux reconnus
- Impact des corrections humaines
- Progression de l'apprentissage

### Module 7 : Administration et Sécurité

#### 7.1 Gestion des utilisateurs
- Rôles :
  - **Administrateur** : accès complet
  - **Gestionnaire** : upload et validation
  - **Validateur** : validation uniquement
  - **Consultant** : lecture seule
- Authentification sécurisée
- Traçabilité des actions

#### 7.2 Sécurité des données
- Chiffrement des documents stockés
- Accès sécurisé aux API
- Logs d'audit complets
- Conformité RGPD (si applicable)

---

## 🏗️ Architecture Technique

### Architecture Microservices

#### Service 1 : Document Management Service (Backend)
- **Rôle** : Upload, stockage, gestion des documents
- **Technologies** : Node.js (Express) ou Python (FastAPI)
- **Base de données** : PostgreSQL (métadonnées)
- **Stockage fichiers** : AWS S3, MinIO, ou système de fichiers

#### Service 2 : AI Processing Service (Backend)
- **Rôle** : OCR, NLP, extraction de données
- **Technologies** : Python (obligatoire pour l'IA)
- **Bibliothèques** :
  - Tesseract OCR ou API cloud
  - spaCy, Hugging Face Transformers
  - OpenCV, Pillow (traitement d'image)
  - pandas (manipulation de données)
- **Architecture** :
  - API REST pour recevoir les documents
  - Queue de traitement (Celery + Redis)
  - Workers pour traitement asynchrone

#### Service 3 : Normalization Service (Backend)
- **Rôle** : Normalisation et rapprochement
- **Technologies** : Python ou Node.js
- **Algorithmes** : Fuzzy matching, règles métier
- **Base de données** : Référentiel produits

#### Service 4 : Asset Service (Backend)
- **Rôle** : Création et gestion des actifs
- **Technologies** : Node.js ou Python
- **Base de données** : PostgreSQL
- **Intégration** : Avec le système de gestion des actifs (Projet #1)

#### Service 5 : Frontend Web
- **Rôle** : Interface utilisateur complète
- **Technologies** : React.js, Vue.js ou Angular
- **Fonctionnalités** :
  - Upload de documents
  - Interface de validation
  - Tableaux de bord
  - Administration

### Communication entre services
- **API REST** : Communication synchrone
- **Message Queue** : RabbitMQ ou Redis pour traitement asynchrone
- **WebSocket** : Notifications en temps réel (progression du traitement)

### Infrastructure
- **Serveur** : Linux (Ubuntu/Debian)
- **Conteneurisation** : Docker + Docker Compose
- **Orchestration** (optionnel) : Kubernetes
- **CI/CD** : GitLab CI ou GitHub Actions

---

## 📊 Livrables du Projet

### Livrables techniques
1. **Code source complet** (GitHub/GitLab)
2. **Modèle d'IA entraîné** avec datasets de test
3. **Application web** déployée et fonctionnelle
4. **API documentée** (Swagger/OpenAPI)
5. **Base de données** avec schéma et données de test
6. **Documentation technique** (architecture, installation, utilisation de l'IA)
7. **Guide utilisateur**
8. **Dataset de factures** pour tests et démonstration

### Livrables académiques
1. **Rapport de PFE** (80-120 pages)
   - État de l'art (OCR, NLP, Document AI)
   - Analyse comparative des solutions existantes
   - Conception de l'architecture
   - Développement du modèle d'IA
   - Évaluation des performances (précision, recall, F1-score)
   - Tests et validation
   - Conclusion et perspectives
2. **Présentation PowerPoint** pour soutenance
3. **Vidéo de démonstration** (5-10 minutes)
4. **Article scientifique** (optionnel) sur l'approche IA

---

## 📅 Planning Prévisionnel (6 mois)

### Mois 1 : Analyse et Conception
- Semaine 1-2 : État de l'art (OCR, NLP, solutions existantes)
- Semaine 3-4 : Conception de l'architecture, collecte de factures de test

### Mois 2 : Développement Backend de Base
- Semaine 5-6 : Document Management Service (upload, stockage)
- Semaine 7-8 : Asset Service (création d'actifs)

### Mois 3 : Développement de l'IA
- Semaine 9-10 : Implémentation OCR et prétraitement
- Semaine 11-12 : Développement du modèle d'extraction (NLP)

### Mois 4 : Amélioration de l'IA et Normalisation
- Semaine 13-14 : Amélioration du modèle, calcul de confiance
- Semaine 15-16 : Service de normalisation et rapprochement

### Mois 5 : Frontend et Intégration
- Semaine 17-18 : Interface de validation et tableaux de bord
- Semaine 19-20 : Intégration complète, tests fonctionnels

### Mois 6 : Tests, Optimisation et Documentation
- Semaine 21-22 : Tests de performance, optimisation de l'IA
- Semaine 23-24 : Rédaction du rapport et préparation de la soutenance

---

## 🎓 Compétences Développées

### Compétences techniques
- **Intelligence Artificielle** : OCR, NLP, Machine Learning
- **Traitement d'image** : Prétraitement, amélioration
- **Développement backend** : API REST, traitement asynchrone
- **Développement frontend** : Interface utilisateur complexe
- **Bases de données** : Modélisation, optimisation
- **Architecture microservices**
- **DevOps** : Docker, déploiement

### Compétences métier
- Compréhension des processus d'achat
- Gestion documentaire
- Gestion des actifs IT
- Analyse de données

### Compétences académiques
- Recherche bibliographique (état de l'art)
- Évaluation de modèles d'IA (métriques)
- Rédaction scientifique

---

## 💡 Points Forts de ce Projet

✅ **Innovant** : Utilisation de l'IA (OCR + NLP)  
✅ **Technique** : Démontre des compétences avancées  
✅ **Utile** : Gain de temps énorme pour l'entreprise  
✅ **Complet** : Backend + Frontend + IA  
✅ **Mesurable** : Métriques de performance claires  
✅ **Évolutif** : Apprentissage continu  
✅ **Académique** : Sujet riche pour un rapport de PFE  

---

## 🚀 Évolutions Possibles (Hors PFE)

- Support de plus de types de documents (bons de livraison, devis)
- Extraction de numéros de série individuels
- Reconnaissance de logos de fournisseurs
- Intégration avec des ERP (SAP, Odoo)
- Application mobile pour scan de factures papier
- Support multilingue avancé
- Détection de fraudes ou anomalies dans les factures
- Prédiction de prix pour détecter les surévaluations

---

## 📞 Questions à Clarifier avec l'Encadreur

1. Faut-il utiliser des API cloud (payantes) ou des solutions open source ?
2. Combien de factures réelles sont disponibles pour l'entraînement ?
3. Quels fournisseurs sont les plus fréquents (pour prioriser) ?
4. Y a-t-il des contraintes de confidentialité sur les factures ?
5. Faut-il supporter l'arabe en plus du français ?
6. Quel niveau de précision est acceptable (90%, 95%, 99%) ?
7. Faut-il intégrer avec un système existant ou créer un système autonome ?

---

## 📚 Ressources et Références

### Outils et bibliothèques
- **Tesseract OCR** : https://github.com/tesseract-ocr/tesseract
- **spaCy** : https://spacy.io/
- **Hugging Face** : https://huggingface.co/
- **LayoutLM** : https://github.com/microsoft/unilm/tree/master/layoutlm

### Articles de référence
- "LayoutLM: Pre-training of Text and Layout for Document Image Understanding" (Microsoft)
- "Document Understanding Transformer" (Donut)
- "BERT: Pre-training of Deep Bidirectional Transformers"

### Datasets publics (pour tests)
- SROIE (Scanned Receipts OCR and Information Extraction)
- CORD (Consolidated Receipt Dataset)

---

**Ce projet est idéal pour un étudiant intéressé par l'IA et le traitement de documents. Il combine des aspects techniques avancés avec une utilité pratique réelle.**
