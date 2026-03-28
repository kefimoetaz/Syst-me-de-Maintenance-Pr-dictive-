# PROJET PFE #1 : Plateforme de Gestion des Actifs IT et Inventaire Intelligent

## 📋 RÉSUMÉ EXÉCUTIF

Développement d'une plateforme web et mobile pour centraliser la gestion du cycle de vie complet des actifs informatiques (ordinateurs, serveurs, imprimantes) du Groupe Poulina avec un système d'inventaire physique automatisé par scan QR/RFID.

---

## 🎯 OBJECTIFS

- **Centraliser** : Base de données unique de tous les équipements IT multi-sites
- **Automatiser** : Inventaire physique rapide via scan mobile (QR code/RFID)
- **Tracer** : Historique complet de chaque actif (achat, affectation, maintenance, mise au rebut)

---

## 🔧 FONCTIONNALITÉS PRINCIPALES

### 1. Gestion des Actifs
- Enregistrement complet : modèle, numéro de série, état, affectation, garantie, coût
- Génération automatique de QR codes
- Suivi du cycle de vie (neuf → en service → en panne → réformé)
- Gestion des affectations (utilisateur, site, bureau)
- Historique des mouvements et interventions

### 2. Inventaire Intelligent
- Création de campagnes d'inventaire par site/filiale
- Application mobile de scan (QR code/RFID)
- Mode hors-ligne avec synchronisation
- Détection automatique des écarts :
  - Actifs manquants (dans la base mais non scannés)
  - Actifs non enregistrés (scannés mais inconnus)
  - Actifs conformes
- Rapports d'inventaire avec taux de conformité

### 3. Tableaux de Bord et Reporting
- Vue d'ensemble du parc informatique
- Valeur totale et répartition par site/catégorie
- Alertes (garanties expirées, actifs non inventoriés)
- Rapports personnalisables (Excel, PDF)

### 4. Administration
- Gestion des utilisateurs et permissions (admin, gestionnaire, inventoriste)
- Paramétrage (catégories, sites, fournisseurs)
- Configuration des alertes

---

## 🏗️ ARCHITECTURE TECHNIQUE

**Microservices :**
- **Asset Service** : Gestion CRUD des actifs (Node.js/Python + PostgreSQL)
- **Inventory Service** : Campagnes et détection d'écarts (Node.js/Python)
- **Frontend Web** : Interface d'administration (React.js/Vue.js/Angular)
- **Application Mobile** : Scan et inventaire terrain (React Native/Flutter/PWA)
- **Storage Service** : Stockage fichiers et QR codes (AWS S3/MinIO)

**Communication :** API REST + Message Queue (optionnel)

---

## 📅 PLANNING (6 MOIS)

| Période | Tâches |
|---------|--------|
| **Mois 1** | Analyse des besoins, conception architecture, modélisation BDD, maquettes UI/UX |
| **Mois 2** | Développement backend (Asset Service + Inventory Service) |
| **Mois 3** | Développement frontend web (gestion actifs + inventaire + dashboards) |
| **Mois 4** | Développement application mobile (scan + mode hors-ligne) |
| **Mois 5** | Intégration complète, tests fonctionnels, tests utilisateurs |
| **Mois 6** | Rédaction rapport PFE, préparation soutenance |

---

## 📊 LIVRABLES

**Techniques :**
- Code source complet (GitHub/GitLab)
- Application web déployée
- Application mobile (APK/PWA)
- Base de données avec données de test
- Documentation technique et guide utilisateur

**Académiques :**
- Rapport PFE (80-120 pages)
- Présentation PowerPoint
- Vidéo de démonstration (5-10 min)

---

## 🎓 COMPÉTENCES DÉVELOPPÉES

**Techniques :** Développement full-stack, architecture microservices, développement mobile, bases de données, API REST, génération QR codes

**Métier :** Gestion des actifs IT (ITAM), processus d'inventaire, gestion de projet

---

## 💡 POINTS FORTS

✅ **Complet** : Couvre frontend, backend, mobile  
✅ **Réaliste** : Faisable en 6 mois  
✅ **Utile** : Vrai besoin pour l'entreprise  
✅ **Technique** : Démontre des compétences variées  
✅ **Innovant** : Scan mobile, détection d'écarts automatique  
✅ **Évolutif** : Peut être étendu avec IA, maintenance prédictive  

---

## 🚀 ÉVOLUTIONS POSSIBLES

- Intégration avec l'IA de traitement de factures
- Maintenance prédictive
- Scan par reconnaissance d'image (sans QR code)
- Intégration Active Directory
- Application mobile native iOS

---

## 📞 QUESTIONS À CLARIFIER

1. Application mobile native ou PWA ?
2. Nombre de sites/filiales pilotes ?
3. Infrastructure existante (serveurs, BDD) ?
4. Intégration avec systèmes existants (ERP, AD) ?
5. Niveau de sécurité requis ?

---

**DURÉE :** 6 mois | **DIFFICULTÉ :** Moyenne | **TECHNOLOGIES :** Full-stack + Mobile | **IMPACT :** Élevé
