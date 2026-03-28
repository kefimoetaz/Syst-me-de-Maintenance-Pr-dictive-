# 🚀 Guide de Démarrage Rapide - Démo PFE

## Pour la Soutenance (5 minutes)

### Étape 1: Démarrer les Services (2 min avant)

Ouvrez 3 terminaux:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Attendez: `✓ Server started on port 3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Attendez: `Local: http://localhost:5173/`

**Terminal 3 - Agent:**
```bash
cd agent
python src/main.py
```
Attendez: `[OK] Collection cycle completed successfully`

### Étape 2: Ouvrir le Dashboard

Dans votre navigateur: **http://localhost:5173**

### Étape 3: Scénario de Démonstration

#### 1. Vue d'ensemble (30 sec)
- Montrez les 20 machines
- Expliquez les niveaux de risque (couleurs)
- Montrez les KPIs en haut

#### 2. Détails d'une machine (1 min)
- Cliquez sur "Mori" (votre machine)
- Montrez les métriques en temps réel
- Expliquez les prédictions (7j, 14j, 30j)

#### 3. Système d'alertes (30 sec)
- Scrollez vers "Alertes Actives"
- Montrez les 5 alertes
- Expliquez les seuils (≥50% HIGH, ≥70% CRITICAL)

#### 4. Agent en action (30 sec)
- Montrez le terminal de l'agent
- Expliquez la collecte automatique (toutes les heures)
- Montrez les logs en temps réel

#### 5. Architecture (1 min)
- Ouvrez `Diagramme_Classes_FINAL_PFE.puml`
- Expliquez: Agent → API → DB → ML → Dashboard
- Mentionnez les technologies (React, Node.js, Python, PostgreSQL)

## Questions Fréquentes du Jury

### Q: "Combien de machines surveillez-vous?"
**R:** "20 machines actuellement, avec 7.8 millions d'enregistrements de métriques. Le système est conçu pour scaler à 100+ machines."

### Q: "Comment fonctionne la prédiction?"
**R:** "Nous utilisons Random Forest avec 65 features extraites des métriques système et SMART. Le modèle analyse les 30 derniers jours et prédit la probabilité de panne sur 7, 14 et 30 jours."

### Q: "Quelle est la précision du modèle?"
**R:** "Actuellement 50-70% avec nos données de test. La précision s'améliore avec plus de données réelles de pannes. C'est une limitation connue des systèmes de maintenance prédictive avec peu de données historiques."

### Q: "Comment gérez-vous les alertes?"
**R:** "Alertes automatiques pour risques HIGH (≥50%) et CRITICAL (≥70%). Emails envoyés automatiquement via SMTP. Les techniciens peuvent accuser réception via le dashboard."

### Q: "Pourquoi pas tous les use cases implémentés?"
**R:** "Nous avons priorisé le workflow principal: collecte → prédiction → alerte. Les interventions et historique sont des évolutions futures documentées dans le backlog."

### Q: "Sécurité?"
**R:** "Authentification JWT, validation des entrées, protection SQL injection via ORM, logs d'audit complets."

## Checklist Avant la Soutenance

- [ ] PostgreSQL démarré
- [ ] Backend démarré (port 3000)
- [ ] Frontend démarré (port 5173)
- [ ] Agent démarré et collecte OK
- [ ] Dashboard accessible dans le navigateur
- [ ] Diagrammes UML ouverts dans VS Code
- [ ] README.md prêt à montrer
- [ ] Batterie chargée (si laptop)
- [ ] Connexion internet stable (pour emails)

## Backup Plan

Si un service ne démarre pas:

**Backend ne démarre pas:**
- Vérifiez PostgreSQL: `psql -U postgres -d predictive_maintenance`
- Vérifiez le port 3000: `netstat -ano | findstr :3000`

**Frontend ne démarre pas:**
- Vérifiez le port 5173: `netstat -ano | findstr :5173`
- Relancez: `npm run dev`

**Agent ne démarre pas:**
- Vérifiez Python: `python --version`
- Vérifiez les dépendances: `pip install -r requirements.txt`

**Dashboard vide:**
- Vérifiez que le backend répond: http://localhost:3000/api/machines
- Vérifiez la console du navigateur (F12)

## Points Forts à Mentionner

✅ **Architecture microservices** professionnelle
✅ **Stack moderne** (React, Node.js, Python)
✅ **ML en production** avec scikit-learn
✅ **Scalabilité** démontrée (20 machines, 7.8M records)
✅ **Automatisation complète** (collecte, prédiction, alertes)
✅ **UML complets** et validés
✅ **Code propre** et documenté
✅ **Tests** et validation

## Timing de la Démo

- **0-1 min**: Introduction et contexte
- **1-2 min**: Dashboard et vue d'ensemble
- **2-3 min**: Détails machine et prédictions
- **3-4 min**: Alertes et agent
- **4-5 min**: Architecture et technologies

**Total: 5 minutes** (gardez 10 min pour les questions)

---

**Bonne chance pour votre soutenance! 🎓**
