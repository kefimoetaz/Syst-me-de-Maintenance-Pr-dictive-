# Document de Requirements - Sprint 1: Agent Backend

## Introduction

Ce document définit les exigences pour le Sprint 1 du système de Maintenance Prédictive pour Groupe Poulina. L'objectif est de mettre en place le système de collecte automatique des données depuis les machines du parc informatique via un agent Python et une API backend Node.js, avec stockage dans PostgreSQL.

Le Sprint 1 établit les fondations du système en permettant la collecte, la transmission et le stockage des métriques système (CPU, RAM, Disque, Température, SMART) depuis les PC Windows vers un serveur central.

## Glossaire

- **Agent_Collecte**: Programme Python installé sur chaque PC Windows qui collecte les métriques système
- **API_Backend**: Serveur Node.js/Express qui reçoit et stocke les données des agents
- **Base_Données**: Base PostgreSQL qui stocke l'historique des métriques
- **Métriques_Système**: Données de performance (CPU, RAM, Disque, Température)
- **Données_SMART**: Indicateurs de santé du disque dur (health status, erreurs, température)
- **Token_Authentification**: Jeton unique identifiant chaque agent auprès de l'API
- **Machine**: PC physique du parc informatique sur lequel l'agent est installé
- **Collecte_Horaire**: Processus automatique d'envoi des données toutes les heures

## Requirements

### Requirement 1: Installation et Configuration de l'Agent

**User Story:** En tant qu'administrateur système, je veux installer facilement l'agent sur les PC Windows, afin de déployer rapidement la solution sur le parc informatique.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL être compatible avec Windows 10 et Windows 11
2. WHEN l'administrateur exécute le script d'installation, THE Agent_Collecte SHALL s'installer comme service Windows
3. THE Agent_Collecte SHALL lire sa configuration depuis un fichier config.json
4. WHERE le fichier config.json est présent, THE Agent_Collecte SHALL charger les paramètres (URL API, token, intervalle)
5. IF le fichier config.json est invalide ou absent, THEN THE Agent_Collecte SHALL créer un fichier par défaut et logger une erreur

### Requirement 2: Collecte des Métriques Système

**User Story:** En tant qu'agent de collecte, je veux récupérer les métriques système en temps réel, afin de transmettre des données précises au serveur.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL collecter le pourcentage d'utilisation CPU
2. THE Agent_Collecte SHALL collecter la température CPU en degrés Celsius
3. THE Agent_Collecte SHALL collecter le pourcentage d'utilisation RAM
4. THE Agent_Collecte SHALL collecter la mémoire RAM disponible et totale en mégaoctets
5. THE Agent_Collecte SHALL collecter le pourcentage d'utilisation disque
6. THE Agent_Collecte SHALL collecter l'espace disque libre et total en mégaoctets
7. WHEN une métrique n'est pas disponible, THE Agent_Collecte SHALL logger un avertissement et continuer la collecte

### Requirement 3: Collecte des Données SMART

**User Story:** En tant qu'agent de collecte, je veux lire les données SMART du disque dur, afin de détecter les signes de défaillance matérielle.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL lire le statut de santé SMART du disque principal
2. THE Agent_Collecte SHALL collecter le nombre d'erreurs de lecture SMART
3. THE Agent_Collecte SHALL collecter le nombre d'erreurs d'écriture SMART
4. THE Agent_Collecte SHALL collecter la température du disque en degrés Celsius
5. IF les données SMART ne sont pas accessibles, THEN THE Agent_Collecte SHALL logger une erreur et envoyer des valeurs nulles

### Requirement 4: Identification de la Machine

**User Story:** En tant que système, je veux identifier de manière unique chaque machine, afin de tracer l'origine des données collectées.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL collecter le hostname de la machine
2. THE Agent_Collecte SHALL collecter l'adresse IP locale de la machine
3. THE Agent_Collecte SHALL collecter le numéro de série matériel de la machine
4. THE Agent_Collecte SHALL collecter la version du système d'exploitation
5. THE Agent_Collecte SHALL inclure un identifiant unique d'agent (UUID) dans chaque envoi

### Requirement 5: Transmission des Données

**User Story:** En tant qu'agent de collecte, je veux envoyer automatiquement les données au serveur, afin de maintenir un historique à jour.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL envoyer les données collectées toutes les heures
2. WHEN l'Agent_Collecte envoie des données, THE Agent_Collecte SHALL formater les données en JSON selon le schéma défini
3. THE Agent_Collecte SHALL envoyer les données via requête HTTP POST vers l'endpoint /api/data
4. THE Agent_Collecte SHALL inclure le Token_Authentification dans l'en-tête Authorization
5. WHEN l'envoi réussit (HTTP 200/201), THE Agent_Collecte SHALL logger le succès
6. IF l'envoi échoue, THEN THE Agent_Collecte SHALL réessayer jusqu'à 3 fois avec délai exponentiel
7. IF toutes les tentatives échouent, THEN THE Agent_Collecte SHALL logger l'erreur et attendre le prochain cycle

### Requirement 6: Gestion des Erreurs et Logs de l'Agent

**User Story:** En tant qu'administrateur, je veux consulter les logs de l'agent, afin de diagnostiquer les problèmes de collecte.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL écrire les logs dans un fichier agent.log
2. WHEN une erreur survient, THE Agent_Collecte SHALL logger le message d'erreur avec timestamp et niveau de sévérité
3. THE Agent_Collecte SHALL logger les événements importants (démarrage, arrêt, envoi réussi)
4. THE Agent_Collecte SHALL limiter la taille du fichier log à 10 MB maximum
5. WHEN le fichier log atteint 10 MB, THE Agent_Collecte SHALL créer un nouveau fichier et archiver l'ancien

### Requirement 7: API de Réception des Données

**User Story:** En tant que serveur backend, je veux recevoir les données des agents via une API REST, afin de centraliser les informations.

#### Acceptance Criteria

1. THE API_Backend SHALL exposer un endpoint POST /api/data
2. WHEN une requête POST est reçue, THE API_Backend SHALL valider le format JSON selon le schéma défini
3. THE API_Backend SHALL vérifier la présence du Token_Authentification dans l'en-tête Authorization
4. IF le token est invalide ou absent, THEN THE API_Backend SHALL retourner une erreur HTTP 401
5. IF le format JSON est invalide, THEN THE API_Backend SHALL retourner une erreur HTTP 400 avec détails de validation
6. WHEN les données sont valides, THE API_Backend SHALL retourner une réponse HTTP 201 avec l'ID de l'enregistrement créé

### Requirement 8: Validation des Données Entrantes

**User Story:** En tant que système backend, je veux valider les données reçues, afin de garantir l'intégrité des données stockées.

#### Acceptance Criteria

1. THE API_Backend SHALL valider que agent_id est un UUID valide
2. THE API_Backend SHALL valider que timestamp est au format ISO 8601
3. THE API_Backend SHALL valider que les valeurs numériques (cpu_usage, memory_usage, etc.) sont dans des plages réalistes
4. THE API_Backend SHALL valider que cpu_usage et memory_usage sont entre 0 et 100
5. THE API_Backend SHALL valider que les valeurs de mémoire et disque sont des nombres positifs
6. THE API_Backend SHALL valider que health_status est parmi les valeurs autorisées (GOOD, WARNING, CRITICAL)
7. IF une validation échoue, THEN THE API_Backend SHALL retourner HTTP 400 avec le champ en erreur

### Requirement 9: Stockage en Base de Données

**User Story:** En tant que système backend, je veux stocker les données dans PostgreSQL, afin de constituer un historique exploitable.

#### Acceptance Criteria

1. WHEN des données valides sont reçues, THE API_Backend SHALL insérer un enregistrement dans la table Machine (si nouvelle machine)
2. THE API_Backend SHALL insérer un enregistrement dans la table SystemMetrics avec les métriques système
3. THE API_Backend SHALL insérer un enregistrement dans la table SmartData avec les données SMART
4. THE API_Backend SHALL lier les enregistrements via les clés étrangères (machine_id)
5. IF l'insertion échoue, THEN THE API_Backend SHALL retourner HTTP 500 et logger l'erreur détaillée
6. THE API_Backend SHALL effectuer toutes les insertions dans une transaction unique

### Requirement 10: Structure de la Base de Données

**User Story:** En tant que développeur, je veux une base de données bien structurée, afin de faciliter les requêtes et garantir l'intégrité.

#### Acceptance Criteria

1. THE Base_Données SHALL contenir une table Machine avec colonnes (id, hostname, ip_address, serial_number, os, created_at, updated_at)
2. THE Base_Données SHALL contenir une table Agent avec colonnes (id, agent_id UUID unique, machine_id FK, token, created_at)
3. THE Base_Données SHALL contenir une table SystemMetrics avec colonnes (id, machine_id FK, timestamp, cpu_usage, cpu_temperature, memory_usage, memory_available, memory_total, disk_usage, disk_free, disk_total)
4. THE Base_Données SHALL contenir une table SmartData avec colonnes (id, machine_id FK, timestamp, health_status, read_errors, write_errors, temperature)
5. THE Base_Données SHALL définir des contraintes de clé étrangère avec ON DELETE CASCADE
6. THE Base_Données SHALL créer un index sur machine_id dans SystemMetrics et SmartData
7. THE Base_Données SHALL créer un index sur timestamp dans SystemMetrics et SmartData
8. THE Base_Données SHALL créer un index unique sur agent_id dans la table Agent

### Requirement 11: Authentification des Agents

**User Story:** En tant que système de sécurité, je veux authentifier chaque agent, afin de prévenir les envois de données non autorisés.

#### Acceptance Criteria

1. WHEN un agent envoie des données, THE API_Backend SHALL extraire le token de l'en-tête Authorization
2. THE API_Backend SHALL vérifier que le token existe dans la table Agent
3. IF le token n'existe pas, THEN THE API_Backend SHALL retourner HTTP 401 Unauthorized
4. WHEN le token est valide, THE API_Backend SHALL identifier la machine associée
5. THE API_Backend SHALL utiliser le machine_id associé au token pour les insertions

### Requirement 12: Gestion des Erreurs Backend

**User Story:** En tant qu'administrateur backend, je veux des logs détaillés des erreurs, afin de diagnostiquer les problèmes rapidement.

#### Acceptance Criteria

1. WHEN une erreur survient, THE API_Backend SHALL logger l'erreur avec timestamp, niveau, et stack trace
2. THE API_Backend SHALL logger toutes les requêtes entrantes avec méthode, URL, et code de réponse
3. IF une erreur de base de données survient, THEN THE API_Backend SHALL logger la requête SQL et l'erreur
4. THE API_Backend SHALL utiliser des niveaux de log appropriés (info, warn, error)
5. THE API_Backend SHALL écrire les logs dans un fichier backend.log

### Requirement 13: Performance de l'API

**User Story:** En tant que système, je veux une API performante, afin de gérer efficacement les requêtes de nombreux agents.

#### Acceptance Criteria

1. THE API_Backend SHALL répondre aux requêtes POST /api/data en moins de 200ms en moyenne
2. THE API_Backend SHALL utiliser un pool de connexions à la base de données
3. THE API_Backend SHALL limiter la taille des requêtes à 1 MB maximum
4. IF une requête dépasse 1 MB, THEN THE API_Backend SHALL retourner HTTP 413 Payload Too Large

### Requirement 14: Scripts de Migration et Seed Data

**User Story:** En tant que développeur, je veux des scripts de migration, afin de créer et initialiser facilement la base de données.

#### Acceptance Criteria

1. THE Base_Données SHALL avoir un script de migration pour créer toutes les tables
2. THE Base_Données SHALL avoir un script de migration pour créer tous les index
3. THE Base_Données SHALL avoir un script de seed pour insérer des données de test
4. THE script de seed SHALL créer au moins 3 machines de test
5. THE script de seed SHALL créer des tokens d'authentification pour les agents de test
6. THE script de seed SHALL créer des métriques historiques pour tester les requêtes

### Requirement 15: Tests Unitaires

**User Story:** En tant que développeur, je veux des tests automatisés, afin de garantir la qualité du code.

#### Acceptance Criteria

1. THE Agent_Collecte SHALL avoir des tests unitaires pour chaque module de collecte
2. THE API_Backend SHALL avoir des tests unitaires pour les contrôleurs et middleware
3. THE API_Backend SHALL avoir des tests d'intégration pour l'endpoint POST /api/data
4. THE tests SHALL couvrir au moins 80% du code
5. THE tests SHALL inclure des cas d'erreur et des cas limites
6. THE tests SHALL utiliser des données mockées pour la base de données

