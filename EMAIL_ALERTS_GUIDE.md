# Guide des Alertes Email

## 📧 Quand Recevez-Vous des Emails?

Vous recevez un email automatiquement quand:

### 1. **Prédiction HIGH ou CRITICAL** (Après ML Predictions)
- Le ML service génère des prédictions chaque jour à **2:00 AM**
- Si une machine a un risque **HIGH** (50-70%) ou **CRITICAL** (≥70%)
- Un email est envoyé à: **kefiimoetaz@gmail.com**

### 2. **Anomalie HIGH ou CRITICAL** (En Temps Réel)
- Quand une métrique dépasse les seuils normaux
- CPU, RAM, ou Disque avec des valeurs anormales
- Détecté immédiatement lors de la collecte

## 🎯 Configuration Actuelle

✅ **Email configuré**: kefiimoetaz@gmail.com
✅ **SMTP Gmail**: Activé avec mot de passe d'application
✅ **Destinataire**: kefiimoetaz@gmail.com

## 📊 Seuils d'Alerte

### Prédictions ML
- **LOW** (0-30%): ❌ Pas d'email
- **MEDIUM** (30-50%): ❌ Pas d'email
- **HIGH** (50-70%): ✅ Email envoyé
- **CRITICAL** (≥70%): ✅ Email envoyé

### Anomalies
- **LOW**: ❌ Pas d'email
- **MEDIUM**: ❌ Pas d'email
- **HIGH**: ✅ Email envoyé
- **CRITICAL**: ✅ Email envoyé

## 📅 Calendrier des Alertes

### Prédictions Quotidiennes
```
Chaque jour à 2:00 AM:
1. ML service génère des prédictions pour toutes les machines
2. Pour chaque machine HIGH/CRITICAL:
   - Crée une alerte dans la base de données
   - Envoie un email à kefiimoetaz@gmail.com
```

### Anomalies en Temps Réel
```
Quand l'agent collecte des données (toutes les heures):
1. ML service détecte les anomalies
2. Si anomalie HIGH/CRITICAL:
   - Crée une alerte
   - Envoie un email immédiatement
```

## 📧 Exemple d'Email

**Sujet**: 🚨 HIGH Risk Prediction - Machine-001

**Contenu**:
```
⚠️ HIGH RISK: Machine Machine-001 has a 55.9% probability 
of failure within 30 days. Please schedule maintenance soon.

Top contributing factors:
1. cpu_usage_mean_24h
2. disk_usage_max_7d
3. smart_temperature

---
Machine Details:
- Hostname: Machine-001
- Risk Level: HIGH
- Failure Probability (30 days): 55.9%
- Model Version: random_forest_v7_20260212

View Dashboard: http://localhost:3001
```

## 🔍 Vérifier les Alertes Actuelles

### Dans la Base de Données
```bash
node backend/verify-alerts-working.js
```

### Dans le Dashboard
- Allez sur http://localhost:5173
- Section "Alertes Récentes"
- Vous verrez toutes les alertes HIGH/CRITICAL

## 📱 État Actuel de Votre Système

### Machines avec Prédictions HIGH
Vous avez actuellement **20 machines** avec risque HIGH:
- Toutes ont une probabilité de panne entre 51-56%
- Des emails ont été envoyés pour chacune (si le service email était actif)

### Pourquoi Vous N'avez Peut-être Pas Reçu d'Emails?

**Raison 1**: Les prédictions ont été générées le 13 février à 15:14
- Si le backend n'était pas démarré à ce moment
- Les emails n'ont pas été envoyés

**Raison 2**: Le service email nécessite que le backend soit actif
- Backend doit être en cours d'exécution
- Pour recevoir les alertes du ML service

## 🚀 Pour Recevoir des Emails Maintenant

### Option 1: Attendre la Prochaine Prédiction
```
Prochaine prédiction automatique: Demain à 2:00 AM
Si des machines sont HIGH/CRITICAL → Email automatique
```

### Option 2: Déclencher une Prédiction Manuellement
```bash
# Via le dashboard
1. Allez sur http://localhost:5173
2. Section "Performance des Modèles ML"
3. Cliquez sur "Entraîner un modèle"
4. Ou utilisez l'API:

curl -X POST http://localhost:3000/api/ml/predictions/run \
  -H "Authorization: Bearer dev-token-12345"
```

### Option 3: Créer une Alerte de Test
```bash
# Créer une alerte manuellement pour tester l'email
node backend/test-alerts.js
```

## 🎓 Pour la Défense

### Points à Mentionner

1. **Système d'Alertes Automatique**
   - "Le système envoie des emails automatiquement pour les risques HIGH et CRITICAL"
   - "Utilise Gmail SMTP avec authentification sécurisée"
   - "Les alertes sont envoyées en temps réel pour les anomalies"

2. **Prédictions Quotidiennes**
   - "Chaque jour à 2h du matin, le ML génère des prédictions"
   - "Si une machine dépasse 50% de risque, un email est envoyé"
   - "L'email contient les facteurs contributifs et un lien vers le dashboard"

3. **Double Système d'Alerte**
   - "Alertes prédictives (basées sur ML)"
   - "Alertes réactives (anomalies détectées en temps réel)"

### Démonstration

**Option 1**: Montrer les alertes dans le dashboard
- Section "Alertes Récentes"
- 5 alertes actives pour machines HIGH risk

**Option 2**: Montrer la configuration email
- Fichier `.env` avec SMTP configuré
- Code du service email dans `backend/src/services/emailService.js`

**Option 3**: Déclencher une alerte en direct
- Créer une alerte de test
- Montrer l'email reçu sur votre téléphone

## 📋 Checklist Email

- [x] SMTP Gmail configuré
- [x] Mot de passe d'application créé
- [x] Email destinataire configuré
- [x] Service email dans le backend
- [x] ML service envoie des alertes
- [ ] Backend actif 24/7 pour recevoir les alertes
- [ ] Tester l'envoi d'email

## 🔧 Tester l'Envoi d'Email Maintenant

```bash
# Vérifier que le backend peut envoyer des emails
node backend/test-alerts.js

# Vous devriez recevoir un email de test à kefiimoetaz@gmail.com
```

## ⚠️ Important

Pour recevoir des emails:
1. ✅ Backend doit être en cours d'exécution
2. ✅ ML service doit être en cours d'exécution
3. ✅ Configuration SMTP doit être correcte (déjà fait)
4. ⏰ Attendre la prochaine prédiction (2:00 AM) ou déclencher manuellement

## 📞 Résumé Simple

**Question**: Quand je reçois un email?

**Réponse**: 
- Chaque jour à 2h du matin si des machines sont à risque HIGH/CRITICAL
- Immédiatement si une anomalie HIGH/CRITICAL est détectée
- Actuellement, vous avez 20 machines HIGH risk qui devraient générer des emails demain à 2h

**Pour tester maintenant**: `node backend/test-alerts.js`
