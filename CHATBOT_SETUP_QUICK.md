# 🚀 Chatbot - Installation Rapide

## ✅ Ce qui a été créé

### Backend
1. **Service Chatbot** (`backend/src/services/chatbotService.js`)
   - Analyse les questions en langage naturel
   - Récupère les données des machines, alertes, prédictions
   - Intégration Ollama (optionnelle)
   - Réponses de secours intelligentes

2. **Controller** (`backend/src/controllers/chatbotController.js`)
   - Gère les requêtes HTTP
   - Endpoint: `POST /api/chatbot`
   - Endpoint: `GET /api/chatbot/suggestions`

3. **Routes** (`backend/src/routes/chatbot.js`)
   - Routes API configurées

4. **Integration** (`backend/src/index.js`)
   - Routes ajoutées au serveur Express

### Frontend
1. **Composant Chatbot** (`frontend/src/components/Chatbot.jsx`)
   - Interface de chat moderne
   - Bulle flottante en bas à droite
   - Suggestions de questions
   - Historique des conversations

2. **Integration Dashboard** (`frontend/src/components/Dashboard.jsx`)
   - Chatbot ajouté au dashboard

### Documentation
1. **Guide complet** (`CHATBOT_GUIDE.md`)
2. **Script de test** (`backend/test-chatbot.js`)

## 🔧 Pour Activer le Chatbot

### Étape 1: Redémarrer le Backend

**Option A: Si le backend tourne dans un terminal**
1. Arrêter le backend (Ctrl+C dans le terminal)
2. Redémarrer:
```bash
cd backend
npm start
```

**Option B: Si vous ne trouvez pas le processus**
```bash
# Trouver le processus Node.js sur port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F

# Redémarrer
cd backend
npm start
```

### Étape 2: Vérifier que ça marche

```bash
cd backend
node test-chatbot.js
```

Vous devriez voir:
```
✅ Success
🤖 Response: [réponse du chatbot]
```

### Étape 3: Tester dans le Frontend

1. Ouvrir http://localhost:5173
2. Cliquer sur l'icône de chat (bulle bleue en bas à droite)
3. Poser une question:
   - "Quelles machines sont à risque élevé?"
   - "Montre-moi les alertes critiques"
   - "Quel est l'état de la machine Mori?"

## 💡 Le Chatbot Fonctionne SANS Ollama!

Le chatbot a deux modes:

### Mode 1: Sans Ollama (Par défaut)
- Réponses basées sur des règles intelligentes
- Analyse les intentions
- Retourne des données réelles de la base
- **Fonctionne immédiatement!**

### Mode 2: Avec Ollama (Optionnel)
- Réponses générées par IA
- Plus naturelles et contextuelles
- Installation:
```bash
# Télécharger: https://ollama.ai/download
ollama pull llama2
ollama serve
```

## 🎯 Exemples de Questions

### Machines
- "Quel est l'état de la machine Mori?"
- "Montre-moi les machines à risque"
- "Combien de machines sont surveillées?"
- "Machine ID 92"

### Alertes
- "Montre-moi les alertes critiques"
- "Y a-t-il des alertes actives?"
- "Alertes importantes"

### Général
- "Donne-moi un aperçu"
- "Statut du système"
- "Vue d'ensemble"

## 🐛 Dépannage

### Erreur: "Not found"
➡️ Le backend n'a pas les nouvelles routes
**Solution**: Redémarrer le backend (voir Étape 1)

### Erreur: "Erreur de connexion"
➡️ Le backend n'est pas démarré
**Solution**: 
```bash
cd backend
npm start
```

### Pas de réponse / Réponse vide
➡️ Problème de base de données
**Solution**: Vérifier PostgreSQL
```bash
node backend/check-machines.js
```

## 📊 Pour la Défense

### Points forts à mentionner:
1. ✅ Chatbot IA intégré au dashboard
2. ✅ Comprend le langage naturel (français)
3. ✅ Accès rapide aux informations
4. ✅ Données réelles de la base PostgreSQL
5. ✅ Interface moderne et intuitive
6. ✅ Fonctionne avec ou sans Ollama
7. ✅ Extensible (facile d'ajouter de nouvelles intentions)

### Démonstration (2-3 minutes):
1. Montrer l'icône du chatbot
2. Ouvrir le chat
3. Poser 3 questions différentes:
   - Une sur les machines
   - Une sur les alertes
   - Une générale
4. Montrer les suggestions
5. Expliquer l'architecture (backend + frontend + optionnel Ollama)

## 🎉 C'est Prêt!

Une fois le backend redémarré, le chatbot est 100% fonctionnel et prêt pour votre défense!

---

**Créé le 14 février 2026**
**Temps d'implémentation: ~2 heures**
