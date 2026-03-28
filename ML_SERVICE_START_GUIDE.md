# Guide de Démarrage du Service ML

## Problème Actuel

Votre dashboard affiche "Aucun modèle actif trouvé" parce que le **service ML (Python Flask API)** n'est pas démarré.

Le modèle v7 existe dans la base de données, mais le frontend ne peut pas le récupérer car le service ML n'est pas en cours d'exécution.

## Solution: Démarrer le Service ML

### Option 1: Démarrage Manuel (Recommandé pour la Démo)

```bash
# 1. Ouvrir un nouveau terminal
# 2. Aller dans le dossier ml-service
cd ml-service

# 3. Activer l'environnement virtuel Python
venv\Scripts\activate

# 4. Démarrer le service Flask
python src/app.py
```

Le service démarrera sur **http://localhost:5001**

Vous verrez:
```
Starting ML Prediction Service API...
Environment: development
Port: 5001
 * Running on http://0.0.0.0:5001
```

### Option 2: Démarrage avec Docker (Production)

```bash
# Démarrer tous les services avec Docker Compose
docker-compose up ml-service
```

## Vérification

Une fois le service démarré, vérifiez qu'il fonctionne:

```bash
# Dans un autre terminal
node backend/test-ml-proxy.js
```

Vous devriez voir tous les tests passer (5/5).

## Rafraîchir le Dashboard

1. Le service ML est maintenant démarré
2. Rafraîchissez votre dashboard (F5)
3. La section "Performance des Modèles ML" devrait maintenant afficher:
   - **Modèle Actif**: random_forest_v7
   - **Précision**: 60%
   - **Version**: 7
   - **Date d'entraînement**: 12 février 2026

## Architecture des Services

Pour que votre système fonctionne complètement, vous devez avoir **3 services** en cours d'exécution:

### 1. Backend (Node.js) - Port 3000
```bash
cd backend
npm start
```

### 2. Frontend (React) - Port 5173
```bash
cd frontend
npm run dev
```

### 3. ML Service (Python Flask) - Port 5001
```bash
cd ml-service
venv\Scripts\activate
python src/app.py
```

## Pour la Défense

### Scénario de Démo Parfait

1. **Avant la démo**: Démarrez les 3 services
2. **Pendant la démo**: 
   - Montrez le dashboard avec les 20 machines
   - Montrez la section "Performance des Modèles ML" avec le modèle v7
   - Expliquez: "Le modèle Random Forest v7 a une précision de 60% sur 7.8M enregistrements"
   - Montrez les prédictions pour les machines à risque

### Points à Mentionner

- **Microservices**: "J'ai séparé le service ML en microservice Python indépendant"
- **Scalabilité**: "Le service ML peut être déployé séparément et scalé indépendamment"
- **API REST**: "Le backend Node.js communique avec le service ML via API REST"
- **Modèle v7**: "Le modèle actuel est la version 7, entraîné sur 90 jours de données"

## Dépannage

### Erreur: "Port 5001 already in use"

```bash
# Trouver le processus qui utilise le port 5001
netstat -ano | findstr :5001

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Erreur: "Module not found"

```bash
cd ml-service
venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur: "Database connection failed"

Vérifiez le fichier `ml-service/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=predictive_maintenance
DB_USER=postgres
DB_PASSWORD=123
```

## Commandes Rapides

```bash
# Démarrer tout avec Docker (le plus simple)
docker-compose up

# Ou démarrer manuellement (3 terminaux)
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: ML Service
cd ml-service && venv\Scripts\activate && python src/app.py
```

## Résultat Attendu

Une fois le service ML démarré, votre dashboard affichera:

```
Performance des Modèles ML
Métriques et historique d'entraînement

Modèle Actif: random_forest_v7
Précision: 60.00%
Précision: 60.00%
Rappel: 60.00%
F1-Score: 60.00%
Version: 7
Date d'entraînement: 12 février 2026
```

Et les prédictions apparaîtront pour toutes les machines avec suffisamment de données historiques.
