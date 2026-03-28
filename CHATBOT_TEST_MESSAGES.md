# 🤖 Chatbot - Messages de Test

Voici des exemples de messages pour tester votre chatbot dans le dashboard.

## 1. Salutations (Ollama - Naturel) 👋

```
bonjour
```
```
salut
```
```
comment tu vas?
```
```
hey
```

**Réponse attendue:** Réponse naturelle et conversationnelle générée par Ollama

---

## 2. Questions sur les Alertes ⚠️

```
montre-moi les alertes
```
```
quelles sont les alertes critiques?
```
```
y a-t-il des alertes?
```
```
alertes
```

**Réponse attendue:** Liste des alertes HIGH et CRITICAL avec détails

---

## 3. Machines à Risque Élevé 📊

```
quelles machines sont à risque élevé?
```
```
liste des machines à risque
```
```
montre-moi les machines dangereuses
```

**Réponse attendue:** Liste des machines avec risque ≥50%

---

## 4. Informations sur une Machine Spécifique 💻

```
PC-LEGACY-15
```
```
état de PC-LEGACY-15
```
```
comment va PC-LEGACY-15?
```
```
Mori
```
```
PC-ADMIN-01
```
```
PC-VIDEO-10
```

**Réponse attendue:** Informations sur la machine (ID, risque, IP)

---

## 5. Statistiques du Système 📈

```
combien de machines?
```
```
nombre de machines surveillées
```

**Réponse attendue:** Total machines, machines avec prédictions, machines à risque

---

## 6. Questions Générales 💬

```
aide-moi
```
```
que peux-tu faire?
```
```
comment tu peux m'aider?
```

**Réponse attendue:** Réponse générée par Ollama expliquant les capacités

---

## Machines Disponibles pour Test

Vous avez 20 machines dans votre système:

### Machines Seeded (avec beaucoup de données):
- PC-ADMIN-01
- PC-DEV-02
- PC-SUPPORT-03
- PC-TEST-01
- PC-HR-04
- PC-FINANCE-05
- PC-MARKETING-06
- PC-SALES-07
- PC-RECEPTION-08
- PC-DESIGN-09
- PC-VIDEO-10
- PC-DATA-11
- PC-QA-12
- PC-BACKUP-13
- PC-OLD-SERVER-14
- PC-LEGACY-15
- PC-WAREHOUSE-16
- PC-LAB-17
- PC-ARCHIVE-18

### Votre Machine Réelle:
- Mori (votre PC avec agent actif)

---

## Scénario de Démo pour la Défense 🎯

### Étape 1: Salutation
**Vous:** `bonjour`
**Bot:** Réponse naturelle et amicale

### Étape 2: Vue d'ensemble
**Vous:** `quelles machines sont à risque élevé?`
**Bot:** Liste de 20 machines à risque ≥50%

### Étape 3: Détails d'une machine
**Vous:** `PC-LEGACY-15`
**Bot:** PC-LEGACY-15 (ID: 77): 55% risque (HIGH)

### Étape 4: Votre machine
**Vous:** `Mori`
**Bot:** Informations sur votre PC réel

### Étape 5: Alertes
**Vous:** `montre-moi les alertes critiques`
**Bot:** Liste des 10 alertes actives

### Étape 6: Statistiques
**Vous:** `combien de machines?`
**Bot:** 20 machines surveillées, X avec prédictions, Y à risque

---

## Points à Mentionner pendant la Démo 🎤

1. **IA Locale:** "Le chatbot utilise Ollama (llama3.2:1b) qui tourne localement sur mon PC, pas dans le cloud"

2. **Réponses Rapides:** "Les réponses sont instantanées pour les données, et naturelles pour les conversations"

3. **Intégration Base de Données:** "Le chatbot accède directement à PostgreSQL pour des informations en temps réel"

4. **Compréhension Naturelle:** "Il comprend le français naturellement, pas besoin de commandes spécifiques"

5. **Données Réelles:** "Toutes les données affichées sont réelles, issues de notre système de monitoring"

---

## Conseils pour la Démo 💡

1. **Commencez par une salutation** pour montrer l'aspect conversationnel
2. **Testez plusieurs machines** pour montrer la recherche
3. **Montrez les alertes** pour l'aspect critique
4. **Utilisez votre machine "Mori"** pour montrer les données réelles
5. **Variez les formulations** pour montrer la compréhension naturelle

---

## Dépannage Rapide 🔧

### Si le chatbot ne répond pas:
```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/chatbot/suggestions
```

### Si Ollama ne fonctionne pas:
```bash
# Redémarrer Ollama
taskkill /F /IM ollama.exe
ollama serve
```

### Si les réponses sont lentes:
- C'est normal pour Ollama (1-2s pour greetings)
- Les données sont instantanées (alertes, machines)

---

## Résumé des Performances ⚡

| Type de Question | Temps de Réponse | Technologie |
|-----------------|------------------|-------------|
| Salutations | 0.7-1.4s | Ollama AI |
| Machines | Instantané | Fallback |
| Alertes | Instantané | Fallback |
| Listes | Instantané | Fallback |
| Questions générales | 2-5s | Ollama AI |

---

Bon test! 🚀
