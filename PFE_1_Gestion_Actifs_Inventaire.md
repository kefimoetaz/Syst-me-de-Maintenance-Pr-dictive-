# Projet PFE #1 : Plateforme de Gestion des Actifs IT et Inventaire Intelligent

## 📋 Résumé du Projet

Développement d'une plateforme web et mobile pour gérer le cycle de vie complet des actifs informatiques (ordinateurs, serveurs, imprimantes, etc.) avec un système d'inventaire physique par scan QR/RFID.

---

## 🎯 Objectifs Principaux

### Objectif 1 : Centraliser la gestion des actifs IT
Créer une base de données unique et fiable de tous les équipements informatiques du Groupe Poulina (multi-sites/filiales).

### Objectif 2 : Automatiser l'inventaire physique
Permettre des campagnes d'inventaire rapides via scan mobile (QR code ou RFID) avec détection automatique des écarts.

### Objectif 3 : Traçabilité complète
Suivre l'historique complet de chaque actif : achat, affectation, déplacement, maintenance, mise au rebut.

---

## 🔧 Fonctionnalités Détaillées

### Module 1 : Gestion des Actifs (Asset Management)

#### 1.1 Enregistrement des actifs
- Formulaire de création d'actif avec champs :
  - Catégorie (PC, serveur, imprimante, téléphone, etc.)
  - Marque et modèle
  - Numéro de série (unique)
  - Numéro d'inventaire interne
  - Date d'achat
  - Coût d'acquisition
  - Fournisseur
  - Durée de garantie
  - État (Neuf, En service, En stock, En panne, Réformé)
- Génération automatique de QR code unique pour chaque actif
- Upload de photos et documents (facture, bon de livraison)

#### 1.2 Affectation et localisation
- Affectation à un utilisateur (nom, département, email)
- Affectation à un site/filiale
- Affectation à un bureau/salle spécifique
- Historique des affectations (qui a eu cet équipement et quand)
- Changement d'affectation avec notification

#### 1.3 Consultation et recherche
- Liste complète des actifs avec filtres avancés :
  - Par catégorie
  - Par site/filiale
  - Par état
  - Par utilisateur
  - Par date d'achat
  - Par fournisseur
- Recherche par numéro de série ou numéro d'inventaire
- Vue détaillée d'un actif avec tout son historique
- Export des données (Excel, PDF)

#### 1.4 Gestion du cycle de vie
- Changement d'état (passage en panne, réparation, mise au rebut)
- Suivi de la garantie avec alertes d'expiration
- Calcul automatique de l'amortissement
- Processus de mise au rebut avec validation

### Module 2 : Inventaire Intelligent

#### 2.1 Campagnes d'inventaire
- Création d'une campagne d'inventaire :
  - Sélection du périmètre (site, filiale, département)
  - Date de début et fin
  - Responsables assignés
  - Liste des actifs attendus (référence)
- Tableau de bord de suivi de la campagne en temps réel

#### 2.2 Application mobile de scan
- Interface mobile responsive ou application native
- Scan de QR code via caméra du téléphone
- Scan RFID (si équipement disponible)
- Mode hors-ligne avec synchronisation ultérieure
- Validation visuelle (photo de l'actif)
- Ajout de commentaires (état physique observé)

#### 2.3 Détection et gestion des écarts
- Comparaison automatique : actifs scannés vs actifs attendus
- Génération de 3 listes :
  - **Actifs conformes** : scannés et présents dans la base
  - **Actifs manquants** : dans la base mais non scannés
  - **Actifs non enregistrés** : scannés mais inconnus dans la base
- Alertes automatiques pour les écarts critiques
- Workflow de résolution des écarts :sation de perte/vol
  - Enregistrement d'actifs oubliés
  - Correction d'erreurs de localisation

#### 2.4 Rapports d'inventaire
- Rapport détaillé par campagne
- Taux de conformité (% d'actifs retrouvés)
- Liste des actions correctives nécessaires
- Historique des inventaires précédents
- Comparaison entre campagnes

### Module 3 : Tableaux de Bord et Reporting

#### 3.1 Dashboard général
- Nombre total d'actifs par catégorie
- Valeur totale du parc informatique
- Répartition par site/filiale
- Répartition par état
- Actifs sous garantie vs hors garantie
- Graphiques d'évolution (acquisitions, mises au rebut)

#### 3.2 Rapports personnalisables
- Rapport par filiale
- Rapport par catégorie d'actif
- Rapport de valorisation du parc
- Rapport des garanties expirées/à expirer
- Rapport des actifs non affectés

#### 3.3 Alertes et notifications
- Garantie expirant dans X jours
- Actifs non inventoriés depuis X mois
- Actifs en panne depuis longtemps
- Campagne d'inventaire en retard

### Module 4 : Administration

#### 4.1 Gestion des utilisateurs
- Création de comptes (admin, gestionnaire, inventoriste)
- Gestion des rôles et permissions
- Affectation par site/filiale

#### 4.2 Paramétrage
- Gestion des catégories d'actifs
- Gestion des sites/filiales
- Gestion des fournisseurs
- Paramètres de calcul d'amortissement
- Configuration des alertes

---

## 🏗️ Architecture Technique

### Architecture Microservices

#### Service 1 : Asset Service (Backend)
- **Rôle** : Gestion CRUD des actifs
- **Technologies suggérées** : Node.js (Express) ou Python (FastAPI) ou Java (Spring Boot)
- **Base de données** : PostgreSQL ou MongoDB
- **API REST** : Endpoints pour toutes les opérations sur les actifs

#### Service 2 : Inventory Service (Backend)
- **Rôle** : Gestion des campagnes et détection d'écarts
- **Technologies suggérées** : Node.js ou Python
- **Logique** : Algorithmes de comparaison et réconciliation
- **Communication** : Appels API vers Asset Service

#### Service 3 : Frontend Web
- **Rôle** : Interface d'administration et consultation
- **Technologies suggérées** : React.js, Vue.js ou Angular
- **Fonctionnalités** : Tous les modules de gestion et reporting

#### Service 4 : Application Mobile
- **Rôle** : Scan et inventaire terrain
- **Technologies suggérées** : 
  - React Native (iOS + Android)
  - Flutter (iOS + Android)
  - Progressive Web App (PWA)
- **Fonctionnalités** : Scan QR, mode hors-ligne, synchronisation

#### Service 5 : Storage Service
- **Rôle** : Stockage des fichiers (photos, documents, QR codes)
- **Technologies suggérées** : AWS S3, MinIO, ou système de fichiers local

### Communication entre services
- **API REST** : Communication synchrone
- **Message Queue** (optionnel) : RabbitMQ ou Kafka pour événements asynchrones

---

## 📊 Livrables du Projet

### Livrables techniques
1. **Code source complet** (GitHub/GitLab)
2. **Base de données** avec schéma et données de test
3. **Application web** déployée et fonctionnelle
4. **Application mobile** (APK Android ou PWA)
5. **Documentation technique** (architecture, API, installation)
6. **Guide utilisateur** (manuel d'utilisation)

### Livrables académiques
1. **Rapport de PFE** (80-120 pages)
   - État de l'art
   - Analyse des besoins
   - Conception (diagrammes UML)
   - Réalisation
   - Tests et validation
   - Conclusion et perspectives
2. **Présentation PowerPoint** pour soutenance
3. **Vidéo de démonstration** (5-10 minutes)

---

## 📅 Planning Prévisionnel (6 mois)

### Mois 1 : Analyse et Conception
- Semaine 1-2 : Étude de l'existant, analyse des besoins
- Semaine 3-4 : Conception de l'architecture, modélisation de la base de données, maquettes UI/UX

### Mois 2 : Développement Backend
- Semaine 5-6 : Asset Service (CRUD actifs)
- Semaine 7-8 : Inventory Service (campagnes et écarts)

### Mois 3 : Développement Frontend Web
- Semaine 9-10 : Interface de gestion des actifs
- Semaine 11-12 : Interface d'inventaire et tableaux de bord

### Mois 4 : Développement Mobile
- Semaine 13-14 : Application mobile de scan
- Semaine 15-16 : Mode hors-ligne et synchronisation

### Mois 5 : Intégration et Tests
- Semaine 17-18 : Intégration complète, tests fonctionnels
- Semaine 19-20 : Tests utilisateurs, corrections de bugs

### Mois 6 : Finalisation et Documentation
- Semaine 21-22 : Rédaction du rapport
- Semaine 23-24 : Préparation de la soutenance

---

## 🎓 Compétences Développées

### Compétences techniques
- Développement full-stack (frontend + backend)
- Architecture microservices
- Développement mobile
- Gestion de bases de données
- API REST
- Génération de QR codes
- Gestion de fichiers

### Compétences métier
- Gestion des actifs IT (ITAM - IT Asset Management)
- Processus d'inventaire
- Gestion de projet
- Analyse des besoins

---

## 💡 Points Forts de ce Projet

✅ **Complet** : Couvre frontend, backend, mobile  
✅ **Réaliste** : Faisable en 6 mois  
✅ **Utile** : Vrai besoin pour l'entreprise  
✅ **Technique** : Démontre des compétences variées  
✅ **Innovant** : Scan mobile, détection d'écarts automatique  
✅ **Évolutif** : Peut être étendu avec d'autres modules (IA, maintenance)  

---

## 🚀 Évolutions Possibles (Hors PFE)

- Intégration avec l'IA de traitement de factures (Projet #2)
- Ajout de la maintenance prédictive (Projet #3)
- Intégration avec Active Directory pour les utilisateurs
- Scan par reconnaissance d'image (sans QR code)
- Application mobile native iOS
- Intégration avec des outils de monitoring (pour collecter automatiquement les données des serveurs)

---

## 📞 Questions à Clarifier avec l'Encadreur

1. Faut-il développer l'application mobile native ou une PWA suffit ?
2. Combien de sites/filiales pilotes pour les tests ?
3. Y a-t-il déjà une infrastructure (serveurs, base de données) ?
4. Faut-il intégrer avec des systèmes existants (ERP, Active Directory) ?
5. Quel niveau de sécurité est requis (authentification, chiffrement) ?

---

**Ce projet constitue une base solide et réaliste pour un PFE de 6 mois.**
