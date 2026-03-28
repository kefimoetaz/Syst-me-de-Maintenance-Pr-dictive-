# État de la Collection de Données par l'Agent

## 📊 Statut Actuel

### ❌ Agent: PAS EN COURS D'EXÉCUTION

**Dernière collecte**: 14 février 2026 à 13:05:06 (il y a ~2 heures)

**Données collectées**:
- Machine: Mori (ID: 92)
- CPU: 5.2%
- RAM: 71.1%
- Disque: 67.4%
- Température: 50°C
- Total d'enregistrements: 1 seul

### ⚠️ Problème Identifié

L'agent a collecté des données UNE SEULE FOIS au démarrage, puis s'est arrêté. Il devrait collecter toutes les heures mais ne le fait pas.

## 🔧 Solution: Redémarrer l'Agent

### Option 1: Démarrage Manuel (Recommandé pour Tests)

```bash
# 1. Ouvrir un nouveau terminal
# 2. Aller dans le dossier agent
cd agent

# 3. Démarrer l'agent
python src/main.py
```

L'agent va:
1. Collecter immédiatement au démarrage
2. Programmer une collecte toutes les heures
3. Continuer à tourner en arrière-plan

### Option 2: Démarrage en Arrière-Plan (Windows)

```bash
# Démarrer l'agent en arrière-plan
cd agent
start /B python src/main.py
```

### Option 3: Service Windows (Production)

Pour que l'agent démarre automatiquement au démarrage de Windows:

```bash
# Installer comme service Windows (nécessite droits admin)
cd agent
python install_service.py
```

## 📅 Calendrier de Collection

Avec `collection_interval_hours: 1`, l'agent collecte:

```
13:05 ✅ Collecte initiale (fait)
14:05 ❌ Devrait collecter (agent arrêté)
15:05 ❌ Devrait collecter (agent arrêté)
16:05 ⏰ Prochaine collecte (si redémarré maintenant)
```

## 🎯 Pour la Défense

### Scénario Idéal

**Avant la défense** (quelques jours avant):
1. Démarrez l'agent et laissez-le tourner 7 jours
2. Vous aurez: 7 jours × 24 heures = 168 enregistrements
3. Le ML pourra générer une prédiction pour Mori

**Pendant la défense**:
- Montrez Mori avec des données réelles collectées
- Expliquez: "L'agent collecte automatiquement toutes les heures"
- Montrez les 168+ enregistrements dans la base de données

### Scénario Actuel (Acceptable)

Si vous n'avez pas le temps de collecter 7 jours:
- Gardez Mori avec "N/A" pour la prédiction
- Expliquez: "Machine récente, données insuffisantes pour prédiction"
- Montrez les 19 autres machines avec prédictions
- Démontrez que le système est intelligent (pas de fausses prédictions)

## 🔍 Vérifier que l'Agent Collecte

### Commande 1: Vérifier les Logs

```bash
# Voir les dernières lignes du log
Get-Content agent/agent.log -Tail 20
```

Vous devriez voir:
```
2026-02-14 XX:05:XX - scheduler - INFO - Starting data collection...
2026-02-14 XX:05:XX - sender - INFO - [OK] Data sent successfully
```

### Commande 2: Vérifier les Données dans la DB

```bash
node backend/check-mori-data.js
```

Vous devriez voir plusieurs enregistrements avec des timestamps différents.

### Commande 3: Vérifier le Processus

```bash
# Windows
Get-Process python | Where-Object {$_.CommandLine -like "*agent*"}

# Ou simplement
tasklist | findstr python
```

## 📈 Progression des Données

Pour avoir une prédiction ML pour Mori, vous avez besoin de:

| Durée | Enregistrements | Prédiction ML |
|-------|----------------|---------------|
| 1 jour | 24 | ❌ Insuffisant |
| 3 jours | 72 | ❌ Insuffisant |
| 7 jours | 168 | ✅ Possible |
| 30 jours | 720 | ✅ Optimal |

**Minimum requis**: 7 jours (168 heures) de données historiques

## 🚀 Démarrage Rapide

```bash
# Terminal 1: Agent
cd agent
python src/main.py

# Terminal 2: Backend (si pas déjà démarré)
cd backend
npm start

# Terminal 3: Frontend (si pas déjà démarré)
cd frontend
npm run dev

# Terminal 4: ML Service (si pas déjà démarré)
cd ml-service
venv\Scripts\activate
python src/app.py
```

## 💡 Astuce pour la Défense

Si vous n'avez pas 7 jours de données pour Mori:

**Option 1**: Gardez le "N/A" et expliquez l'approche professionnelle
- "Le système ne fait pas de prédictions sans données suffisantes"
- "C'est une approche responsable en ML"

**Option 2**: Utilisez les 19 autres machines pour la démo
- Elles ont toutes des prédictions
- Montrez les probabilités de panne
- Montrez les facteurs contributifs

**Option 3**: Générez des données synthétiques pour Mori (avancé)
- Créez un script pour insérer des données historiques
- Simulez 7 jours de collecte
- Générez une prédiction

## 📝 Commandes Utiles

```bash
# Démarrer l'agent
cd agent && python src/main.py

# Vérifier les données de Mori
node backend/check-mori-data.js

# Vérifier tous les processus Python
Get-Process python

# Voir les logs en temps réel
Get-Content agent/agent.log -Wait -Tail 10

# Compter les enregistrements de Mori
# (dans psql ou pgAdmin)
SELECT COUNT(*) FROM system_metrics WHERE machine_id = 92;
```

## ✅ Checklist Avant la Défense

- [ ] Agent démarré et collecte toutes les heures
- [ ] Au moins 7 jours de données pour Mori (ou accepter N/A)
- [ ] Backend en cours d'exécution
- [ ] Frontend en cours d'exécution
- [ ] ML Service en cours d'exécution
- [ ] 19 machines avec prédictions visibles
- [ ] Dashboard accessible et fonctionnel

## 🎓 Points à Mentionner en Défense

1. **Collection Automatique**
   - "L'agent collecte automatiquement toutes les heures"
   - "Utilise la bibliothèque `schedule` de Python"
   - "Résilient aux erreurs - continue même si une collecte échoue"

2. **Données Réelles**
   - "Mori est ma vraie machine avec l'agent installé"
   - "Collecte CPU, RAM, disque, température en temps réel"
   - "Données SMART du disque dur pour détecter les défaillances"

3. **Approche Professionnelle**
   - "Pas de prédictions sans données suffisantes (minimum 7 jours)"
   - "Le système est honnête - affiche N/A plutôt que de fausses prédictions"
   - "Démontre une compréhension des limites du ML"
