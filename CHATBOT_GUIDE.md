# 🤖 Guide du Chatbot IA - Assistant de Maintenance Prédictive

## Vue d'ensemble

Le chatbot IA est un assistant intelligent intégré au dashboard qui aide les techniciens à obtenir rapidement des informations sur les machines, les prédictions et les alertes.

## Fonctionnalités

### 1. Questions sur les Machines
- "Quel est l'état de la machine Mori?"
- "Montre-moi les machines à risque élevé"
- "Combien de machines sont surveillées?"
- "Quelle est la machine ID 92?"

### 2. Alertes et Prédictions
- "Montre-moi les alertes critiques"
- "Y a-t-il des alertes actives?"
- "Quelles sont les prédictions récentes?"

### 3. Informations Générales
- "Donne-moi un aperçu du système"
- "Quel est le statut global?"

## Architecture Technique

### Backend (Node.js)

**Service: `backend/src/services/chatbotService.js`**
- Analyse l'intention de l'utilisateur
- Récupère les données depuis PostgreSQL
- Intègre avec Ollama pour génération de réponses intelligentes
- Fournit des réponses de secours si Ollama n'est pas disponible

**Controller: `backend/src/controllers/chatbotController.js`**
- Gère les requêtes HTTP
- Valide les entrées
- Retourne les réponses formatées

**Routes: `backend/src/routes/chatbot.js`**
- `POST /api/chatbot` - Envoyer un message
- `GET /api/chatbot/suggestions` - Obtenir des suggestions

### Frontend (React)

**Component: `frontend/src/components/Chatbot.jsx`**
- Interface de chat moderne et responsive
- Bulle de chat flottante en bas à droite
- Historique des conversations
- Suggestions de questions
- Indicateur de chargement
- Timestamps sur les messages

## Installation et Configuration

### 1. Installer Ollama (Optionnel mais recommandé)

**Windows:**
```bash
# Télécharger depuis https://ollama.ai/download
# Installer et démarrer Ollama
ollama pull llama2
```

**Linux/Mac:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama2
```

### 2. Configuration Backend

Le chatbot fonctionne avec ou sans Ollama:
- **Avec Ollama**: Réponses intelligentes générées par IA
- **Sans Ollama**: Réponses basées sur des règles (fallback)

Variables d'environnement (`.env`):
```env
OLLAMA_URL=http://localhost:11434
```

### 3. Démarrer les Services

```bash
# Backend (terminal 1)
cd backend
npm start

# Frontend (terminal 2)
cd frontend
npm run dev

# Ollama (terminal 3 - optionnel)
ollama serve
```

## Test du Chatbot

### Test Backend
```bash
cd backend
node test-chatbot.js
```

### Test Frontend
1. Ouvrir http://localhost:5173
2. Cliquer sur l'icône de chat en bas à droite
3. Poser une question

## Exemples d'Utilisation

### Scénario 1: Vérifier une machine spécifique
```
User: "Quel est l'état de la machine Mori?"
Bot: "Machine Mori:
     • Risque de panne: 52%
     • Statut: active
     • Données collectées: 3 enregistrements"
```

### Scénario 2: Voir les alertes critiques
```
User: "Montre-moi les alertes critiques"
Bot: "⚠️ 5 alerte(s) critique(s) détectée(s):
     • PC-VIDEO-10: High failure risk detected (CRITICAL)
     • PC-OLD-SERVER-14: High failure risk detected (CRITICAL)
     • PC-LEGACY-15: High failure risk detected (HIGH)"
```

### Scénario 3: Vue d'ensemble
```
User: "Donne-moi un aperçu du système"
Bot: "Système de maintenance prédictive:
     • 20 machines surveillées
     • 5 alertes critiques actives
     • Modèle ML v7 actif (60% précision)"
```

## Personnalisation

### Ajouter de Nouvelles Intentions

Modifier `backend/src/services/chatbotService.js`:

```javascript
async function analyzeIntent(question) {
  const lowerQ = question.toLowerCase();
  
  // Nouvelle intention
  if (lowerQ.includes('historique') || lowerQ.includes('history')) {
    return { type: 'history', machineId: extractMachineId(question) };
  }
  
  // ... autres intentions
}
```

### Ajouter de Nouvelles Suggestions

Modifier `backend/src/controllers/chatbotController.js`:

```javascript
function getSuggestions(req, res) {
  const suggestions = [
    "Quelles machines sont à risque élevé?",
    "Montre-moi les alertes critiques",
    "Nouvelle suggestion ici",
    // ... plus de suggestions
  ];
  
  res.json({ success: true, suggestions });
}
```

## Dépannage

### Problème: "Erreur de connexion"
**Solution**: Vérifier que le backend est démarré sur le port 3000
```bash
cd backend
npm start
```

### Problème: Réponses génériques
**Solution**: 
1. Vérifier qu'Ollama est installé et démarré
2. Vérifier que le modèle llama2 est téléchargé: `ollama list`
3. Si Ollama n'est pas disponible, le chatbot utilisera les réponses de secours

### Problème: Pas de données dans les réponses
**Solution**: Vérifier la connexion à PostgreSQL
```bash
# Tester la connexion
node backend/check-machines.js
```

## Améliorations Futures

### Court terme
- [ ] Support de l'arabe
- [ ] Historique des conversations persistant
- [ ] Export des conversations
- [ ] Commandes vocales

### Long terme
- [ ] Fine-tuning du modèle sur vos données
- [ ] Intégration avec Microsoft Teams
- [ ] Création automatique de tickets
- [ ] Analyse de sentiment

## Pour la Défense

### Points à mentionner:
1. **Innovation**: Chatbot IA intégré avec Ollama (LLM local)
2. **Pratique**: Accès rapide aux informations sans navigation
3. **Intelligent**: Comprend le langage naturel
4. **Évolutif**: Peut apprendre de nouvelles intentions
5. **Sécurisé**: Données restent locales (pas de cloud)

### Démonstration:
1. Montrer l'interface du chatbot
2. Poser 3-4 questions différentes
3. Expliquer comment il analyse les intentions
4. Montrer les réponses avec données réelles
5. Mentionner le fallback sans Ollama

## Support

Pour toute question ou problème:
- Vérifier les logs backend: `backend/backend.log`
- Vérifier la console du navigateur (F12)
- Tester l'API: `node backend/test-chatbot.js`

---

**Créé pour le PFE - Maintenance Prédictive avec IA**
**Février 2026**
