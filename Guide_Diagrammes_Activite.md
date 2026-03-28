# Guide des Diagrammes d'Activité - Maintenance Prédictive

## 📋 Introduction

Les diagrammes d'activité montrent **le flux de travail et les processus métier** du système. Ils sont particulièrement utiles pour visualiser les décisions, les boucles, et les actions parallèles.

**Différence avec les diagrammes de séquence:**
- **Séquence**: Montre les interactions entre objets dans le temps
- **Activité**: Montre le flux de travail et la logique métier

---

## 📊 Les 2 Diagrammes d'Activité Créés

### 1. **Processus de Prédiction et Génération d'Alerte**

**Objectif:** Montrer le processus automatique d'analyse IA et de génération d'alertes

**Acteurs/Swimlanes:**
- Scheduler (déclencheur)
- Service IA (analyse)
- Base de Données (stockage)
- Service Notification (alertes)

**Flux principal:**

1. **Déclenchement**
   - Le scheduler lance l'analyse quotidienne à 2h00

2. **Récupération des machines**
   - Le service IA récupère la liste des machines actives

3. **Boucle d'analyse** (pour chaque machine)
   - Récupération des données historiques (30 jours)
   - Préparation des features pour le ML
   - Exécution du modèle de prédiction
   - Calcul de la probabilité de panne
   - Sauvegarde de la prédiction

4. **Décision: Génération d'alerte**
   - **SI** probabilité > 70%:
     - Déterminer le niveau de risque (HIGH ou CRITICAL)
     - Créer une alerte en base
     - Envoyer notification au technicien
   - **SINON**: Aucune action

5. **Finalisation**
   - Génération d'un rapport d'analyse quotidien

**Points clés:**
- ✅ Processus entièrement automatique
- ✅ Boucle sur toutes les machines
- ✅ Décision basée sur seuil (70%)
- ✅ Notifications multi-canaux

---

### 2. **Traitement d'une Alerte par le Technicien**

**Objectif:** Montrer le workflow complet de traitement d'une alerte par un technicien

**Acteurs/Swimlanes:**
- Technicien (acteur principal)
- Base de Données (stockage)

**Flux principal:**

1. **Réception et consultation**
   - Recevoir notification d'alerte
   - Se connecter au dashboard
   - Consulter les détails de l'alerte
   - Analyser les données historiques

2. **Première décision: Alerte justifiée?**
   - **SI OUI**: Continuer le traitement
   - **SI NON**: Marquer comme faux positif et terminer

3. **Accusé de réception**
   - Accuser réception de l'alerte
   - Mise à jour du statut (ACKNOWLEDGED)

4. **Deuxième décision: Intervention immédiate?**
   
   **SI OUI (urgente):**
   - Créer intervention urgente
   - Se déplacer sur site
   - Effectuer maintenance préventive
   - Tester le système
   - **SI problème résolu**:
     - Marquer intervention COMPLETED
     - Résoudre l'alerte
     - Mettre machine en ACTIVE
   - **SI problème persiste**:
     - Créer nouvelle alerte
     - Escalader au support niveau 2
   
   **SI NON (planifiée):**
   - Planifier intervention ultérieure
   - Créer intervention planifiée
   - Mettre alerte IN_PROGRESS

5. **Finalisation**
   - Ajouter commentaires et observations
   - Générer rapport d'intervention

**Points clés:**
- ✅ Workflow complet avec décisions
- ✅ Gestion des faux positifs
- ✅ Distinction urgence/planification
- ✅ Escalade si problème persiste
- ✅ Traçabilité complète

---

## 🎨 Éléments des Diagrammes d'Activité

### Swimlanes (Couloirs)

```plantuml
|Acteur 1|
:Action 1;

|Acteur 2|
:Action 2;
```

**Utilité:** Montrer qui fait quoi

---

### Actions

```plantuml
:Action simple;

:Action avec\nplusieurs lignes;
```

---

### Décisions (if/else)

```plantuml
if (Condition ?) then (oui)
  :Action si vrai;
else (non)
  :Action si faux;
endif
```

---

### Boucles (repeat)

```plantuml
repeat
  :Action répétée;
repeat while (Condition ?) is (oui)
->non;
```

---

### Notes explicatives

```plantuml
:Action;
note right
  Explication détaillée
  sur plusieurs lignes
end note
```

---

### Début et fin

```plantuml
start
:Actions...;
stop
```

---

## 💡 Avantages des Diagrammes d'Activité

### Pour ton PFE

1. **Clarté du processus métier**
   - Montre la logique de décision
   - Visualise les boucles et conditions
   - Facile à expliquer au jury

2. **Complément aux séquences**
   - Séquence = interactions techniques
   - Activité = logique métier
   - Les deux ensemble donnent une vue complète

3. **Documentation du workflow**
   - Utile pour l'implémentation
   - Guide pour les tests
   - Référence pour la maintenance

---

## 🎯 Différences: Séquence vs Activité

| Aspect | Diagramme de Séquence | Diagramme d'Activité |
|--------|----------------------|---------------------|
| **Focus** | Interactions entre objets | Flux de travail |
| **Axe temps** | Vertical (chronologique) | Flux logique |
| **Décisions** | Peu visibles (alt/opt) | Très visibles (if/else) |
| **Boucles** | Peu utilisées | Très utilisées (repeat) |
| **Acteurs** | Participants | Swimlanes |
| **Utilité** | Comprendre les appels | Comprendre la logique |

**Exemple:**
- **Séquence**: "Le Service IA appelle la DB, puis appelle le Service Notification"
- **Activité**: "SI probabilité > 70% ALORS créer alerte SINON ne rien faire"

---

## 🎓 Comment Défendre Devant le Jury

### Question 1: "Pourquoi 2 diagrammes d'activité?"

**Réponse:**
> "J'ai créé 2 diagrammes d'activité pour montrer les 2 processus métier principaux du système: le processus automatique d'analyse IA qui tourne en arrière-plan, et le processus manuel de traitement d'alerte par le technicien. Ces 2 processus représentent le cœur fonctionnel du système de maintenance prédictive."

---

### Question 2: "Quelle est la différence avec les diagrammes de séquence?"

**Réponse:**
> "Les diagrammes de séquence montrent les interactions techniques entre les composants (API, base de données, services), tandis que les diagrammes d'activité montrent la logique métier et les décisions. Par exemple, le diagramme d'activité montre clairement la condition 'SI probabilité > 70%', ce qui est moins visible dans un diagramme de séquence."

---

### Question 3: "Pourquoi le seuil de 70%?"

**Réponse:**
> "Le seuil de 70% est un compromis entre précision et rappel. Un seuil trop bas génère trop de faux positifs (alertes inutiles), un seuil trop haut risque de manquer des pannes réelles. Ce seuil peut être ajusté par l'administrateur selon les besoins de l'entreprise."

---

### Question 4: "Comment gérez-vous les faux positifs?"

**Réponse:**
> "Le diagramme d'activité 2 montre que le technicien peut marquer une alerte comme 'faux positif'. Ce feedback est enregistré en base de données et peut être utilisé pour améliorer le modèle ML lors du prochain entraînement. C'est une approche 'human-in-the-loop' qui améliore progressivement la précision du système."

---

## 📋 Checklist de Validation

Tes diagrammes d'activité sont bons si:

- ✅ Les swimlanes sont clairement identifiées
- ✅ Les décisions (if/else) sont visibles
- ✅ Les boucles (repeat) sont présentes si nécessaire
- ✅ Le flux est facile à suivre de haut en bas
- ✅ Les notes explicatives clarifient les points complexes
- ✅ Le début (start) et la fin (stop) sont marqués
- ✅ Chaque action est claire et concise

**Tes 2 diagrammes cochent toutes les cases! ✅**

---

## 🚀 Utilisation pour ton PFE

### Dans le Rapport

**Chapitre Conception:**
```
4. Conception Détaillée
   4.1 Diagramme de Cas d'Utilisation
   4.2 Diagramme de Classes
   4.3 Diagrammes de Séquence
   4.4 Diagrammes d'Activité
       4.4.1 Processus de Prédiction et Génération d'Alerte
             [Image du diagramme]
             [Explication du processus automatique]
       4.4.2 Traitement d'une Alerte par le Technicien
             [Image du diagramme]
             [Explication du workflow utilisateur]
```

---

### Pour la Soutenance

**Slide Diagramme d'Activité 1 (1-2 minutes):**
- "Ce diagramme montre le processus automatique d'analyse IA"
- "Le système analyse toutes les machines chaque nuit"
- "Si la probabilité de panne dépasse 70%, une alerte est générée"

**Slide Diagramme d'Activité 2 (1-2 minutes):**
- "Ce diagramme montre le workflow du technicien"
- "Le technicien peut marquer les faux positifs"
- "Deux types d'intervention: urgente ou planifiée"

---

## 🔧 Comment Générer les Diagrammes

### Méthode 1: En ligne (Facile)

1. Va sur https://www.plantuml.com/plantuml/uml/
2. Copie-colle le code PlantUML
3. Clique sur "Submit"
4. Télécharge l'image (PNG, SVG)

---

### Méthode 2: VS Code (Recommandé)

1. Installe l'extension "PlantUML"
2. Ouvre le fichier `Diagrammes_Activite_FINAL_PFE.puml`
3. Appuie sur `Alt+D` pour prévisualiser
4. Exporte en PNG/SVG

---

## 📊 Résumé

**Tu as maintenant 2 diagrammes d'activité qui montrent:**

1. ✅ Le processus automatique d'analyse IA et génération d'alertes
2. ✅ Le workflow complet de traitement d'une alerte par le technicien

**Ces diagrammes complètent parfaitement tes diagrammes de séquence!**

---

## ✅ Récapitulatif Complet de tes Diagrammes UML

| Type | Nombre | Fichier | Description |
|------|--------|---------|-------------|
| **Cas d'Utilisation** | 1 | `Diagramme_Cas_Utilisation_SIMPLIFIE_PFE.puml` | 12 UC, 3 acteurs |
| **Classes** | 1 | `Diagramme_Classes_FINAL_PFE.puml` | 10 classes + 9 enums |
| **Séquence** | 3 | `Diagrammes_Sequence_FINAL_PFE.puml` | Collecte, Prédiction, Traitement |
| **Activité** | 2 | `Diagrammes_Activite_FINAL_PFE.puml` | Processus IA, Workflow technicien |

**Total: 7 diagrammes UML complets pour ton PFE! 🎉**

---

## 🎯 Conseil Final

**Pour la soutenance:**
- Commence par le diagramme de cas d'utilisation (vue d'ensemble)
- Montre le diagramme de classes (structure des données)
- Explique 1-2 diagrammes de séquence (interactions techniques)
- Termine par 1 diagramme d'activité (logique métier)

**Temps total: 8-10 minutes pour la partie conception**

---

**Tes diagrammes d'activité sont maintenant prêts pour ton PFE! 🚀**

Besoin d'autres diagrammes (composants, déploiement) ?
