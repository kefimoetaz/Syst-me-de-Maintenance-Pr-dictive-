# Guide de Seeding des Données

Ce guide explique comment charger différents types de données dans le système pour tester et démontrer les capacités ML.

## 📊 Types de Données Disponibles

### 1. Données Normales (001_seed_test_data.sql)
**Contenu:** 5 machines avec métriques normales et stables
**Résultat ML:** Toutes les prédictions à 0% (LOW risk)
**Usage:** Tests de base, vérification que le système fonctionne

### 2. Données de Dégradation (002_seed_degradation_data.sql)
**Contenu:** Patterns réalistes de dégradation sur 30 jours
**Résultat ML:** Prédictions variées (LOW, MEDIUM, HIGH, CRITICAL)
**Usage:** Démonstration ML, présentation, tests avancés

## 🚀 Comment Utiliser

### Option 1: Script Node.js (Recommandé)

```bash
# Charger les données de dégradation
cd backend
node seed-degradation.js
```

### Option 2: SQL Direct

```bash
# Windows PowerShell
cd backend
$env:PGPASSWORD="123"
psql -U postgres -d maintenance_predictive -f src/database/seeders/002_seed_degradation_data.sql

# Linux/Mac
cd backend
PGPASSWORD=123 psql -U postgres -d maintenance_predictive -f src/database/seeders/002_seed_degradation_data.sql
```

### Option 3: Via le script de seed existant

Modifier `backend/src/database/seed.js` pour inclure le nouveau seeder:

```javascript
// Ajouter après le premier seeder
const degradationSeedPath = path.join(__dirname, 'seeders', '002_seed_degradation_data.sql');
const degradationSeed = fs.readFileSync(degradationSeedPath, 'utf8');
await client.query(degradationSeed);
```

## 🤖 Après le Seeding - Entraîner le Modèle

Une fois les données chargées, vous DEVEZ réentraîner le modèle ML:

```bash
cd ml-service

# Activer l'environnement virtuel
.\venv\Scripts\Activate.ps1  # Windows
# OU
source venv/bin/activate      # Linux/Mac

# Entraîner le modèle
python -c "from src.training_pipeline import TrainingPipeline; TrainingPipeline().run_training()"

# Générer les prédictions
python -c "from src.prediction_scheduler import PredictionScheduler; PredictionScheduler().run_prediction_job()"
```

## 📈 Résultats Attendus

Après avoir chargé les données de dégradation et réentraîné:

| Machine | Pattern | Risque Attendu | Proba 30j |
|---------|---------|----------------|-----------|
| PC-ADMIN-01 | CPU dégradation progressive | HIGH/CRITICAL | 60-85% |
| PC-DEV-02 | Memory leak | MEDIUM | 35-55% |
| PC-SUPPORT-03 | Disk failure imminent | CRITICAL | 75-95% |
| Mori | Comportement erratique | MEDIUM | 40-60% |
| PC-TEST-01 | Système sain | LOW | 0-15% |

## 🔄 Réinitialiser les Données

Pour revenir aux données normales:

```bash
cd backend

# Supprimer toutes les données
node src/database/create-db.js

# Recharger les migrations
node src/database/migrate.js

# Charger les données normales
node src/database/seed.js
```

## 🎯 Cas d'Usage

### Pour une Démo/Présentation
1. Charger les données de dégradation
2. Réentraîner le modèle
3. Montrer le dashboard avec différents niveaux de risque
4. Cliquer sur une machine CRITICAL pour voir les détails

### Pour le Développement
1. Utiliser les données normales
2. Tester les fonctionnalités de base
3. Vérifier que tout fonctionne

### Pour Tester l'Anomaly Detection
1. Charger les données de dégradation
2. Les anomalies sont déjà insérées
3. Vérifier la timeline des anomalies dans les détails machine

## 📝 Notes Importantes

- Les données de dégradation couvrent **30 jours** d'historique
- Chaque machine a **~720 points de données** (1 par heure)
- Les patterns sont **réalistes** basés sur des scénarios réels
- Le modèle ML doit être **réentraîné** après chaque changement de données
- Les prédictions sont **stockées** dans la table `predictions`

## 🐛 Dépannage

**Problème:** Les prédictions restent à 0% après seeding

**Solution:**
1. Vérifier que les données sont bien insérées: `SELECT COUNT(*) FROM system_metrics;`
2. Réentraîner le modèle (voir commandes ci-dessus)
3. Générer les prédictions
4. Vérifier: `SELECT * FROM predictions ORDER BY created_at DESC LIMIT 5;`

**Problème:** Erreur "relation does not exist"

**Solution:**
1. Exécuter les migrations: `node backend/src/database/migrate.js`
2. Réessayer le seeding

**Problème:** Le modèle ne s'entraîne pas

**Solution:**
1. Vérifier que l'environnement virtuel est activé
2. Vérifier les logs: `tail -f ml-service/ml-service.log`
3. Vérifier la connexion DB dans `ml-service/.env`

## 📚 Ressources

- Documentation ML: `ml-service/README.md`
- API Documentation: `ml-service/API_DOCUMENTATION.md`
- Guide de déploiement: `ml-service/DEPLOYMENT.md`
