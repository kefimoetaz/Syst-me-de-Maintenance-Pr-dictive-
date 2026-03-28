# 🔐 Guide d'Installation - Système d'Authentification

## Installation Complète (5 minutes)

### Étape 1: Installer les Dépendances Backend

```bash
cd backend
npm install bcrypt jsonwebtoken
```

### Étape 2: Créer la Table Users

```bash
# Exécuter la migration
psql -U postgres -d predictive_maintenance -f src/database/migrations/009_create_users_table.sql
```

### Étape 3: Créer les Utilisateurs de Démo

```bash
# Créer les 3 comptes de démo
node create-users.js
```

Vous devriez voir:
```
✅ Created: admin@maintenance.com (admin)
✅ Created: technicien@maintenance.com (technician)
✅ Created: viewer@maintenance.com (viewer)
```

### Étape 4: Installer React Router (Frontend)

```bash
cd frontend
npm install react-router-dom
```

### Étape 5: Mettre à Jour App.jsx

Remplacez le contenu de `frontend/src/App.jsx` par:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 - Redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Étape 6: Ajouter JWT_SECRET dans .env

Éditez `backend/.env` et ajoutez:

```env
# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi_en_production
```

### Étape 7: Redémarrer les Services

```bash
# Terminal 1 - Backend
cd backend
node kill-backend.js  # Si déjà démarré
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Étape 8: Tester l'Authentification

1. Ouvrir http://localhost:5173
2. Vous devriez voir la page de login
3. Cliquer sur un compte de démo pour remplir automatiquement
4. Se connecter
5. Vous devriez être redirigé vers le dashboard

---

## Comptes de Démonstration

| Rôle | Email | Mot de passe | Permissions |
|------|-------|--------------|-------------|
| **Admin** | admin@maintenance.com | admin123 | Accès complet |
| **Technicien** | technicien@maintenance.com | tech123 | Gérer alertes |
| **Observateur** | viewer@maintenance.com | viewer123 | Lecture seule |

---

## Tester l'API avec cURL

### Register (Créer un compte)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"nouveau@test.com\",
    \"password\": \"test123\",
    \"full_name\": \"Nouvel Utilisateur\"
  }"
```

Réponse:
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "email": "nouveau@test.com",
    "full_name": "Nouvel Utilisateur",
    "role": "viewer"
  }
}
```

### Login (Se connecter)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@maintenance.com\",
    \"password\": \"admin123\"
  }"
```

Réponse:
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@maintenance.com",
    "full_name": "Administrateur Système",
    "role": "admin"
  }
}
```

### Get Profile (Profil utilisateur)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## Vérification

### 1. Vérifier la table users

```bash
psql -U postgres -d predictive_maintenance -c "SELECT id, email, full_name, role FROM users;"
```

Vous devriez voir:
```
 id |            email             |      full_name       |    role    
----+------------------------------+----------------------+------------
  1 | admin@maintenance.com        | Administrateur       | admin
  2 | technicien@maintenance.com   | Technicien Principal | technician
  3 | viewer@maintenance.com       | Observateur          | viewer
```

### 2. Vérifier les routes backend

```bash
# Devrait retourner 401 (non authentifié)
curl http://localhost:3000/api/auth/profile

# Devrait retourner 200 (succès)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maintenance.com","password":"admin123"}'
```

### 3. Vérifier le frontend

- Ouvrir http://localhost:5173
- Devrait afficher la page de login
- Cliquer sur "Créer un compte" → Page de signup
- Retour à login → Remplir avec compte démo
- Se connecter → Redirection vers dashboard

---

## Dépannage

### Erreur: "bcrypt not found"

```bash
cd backend
npm install bcrypt
```

### Erreur: "jsonwebtoken not found"

```bash
cd backend
npm install jsonwebtoken
```

### Erreur: "react-router-dom not found"

```bash
cd frontend
npm install react-router-dom
```

### Erreur: "Table users does not exist"

```bash
psql -U postgres -d predictive_maintenance -f backend/src/database/migrations/009_create_users_table.sql
```

### Erreur: "JWT_SECRET is not defined"

Ajouter dans `backend/.env`:
```env
JWT_SECRET=votre_secret_jwt_changez_moi
```

### Login ne fonctionne pas

1. Vérifier que le backend est démarré (port 3000)
2. Vérifier les logs backend pour les erreurs
3. Ouvrir la console navigateur (F12) pour voir les erreurs
4. Vérifier que les utilisateurs existent:
   ```bash
   node backend/create-users.js
   ```

---

## Fonctionnalités Implémentées

✅ **Login** - Connexion avec email/password  
✅ **Signup** - Création de compte (rôle viewer par défaut)  
✅ **JWT Authentication** - Tokens sécurisés  
✅ **Protected Routes** - Redirection si non authentifié  
✅ **3 Rôles** - Admin, Technician, Viewer  
✅ **Password Hashing** - bcrypt avec salt  
✅ **Profile Management** - Voir/modifier profil  
✅ **Change Password** - Changer mot de passe  
✅ **Demo Credentials** - 3 comptes pré-créés  
✅ **Auto-fill Demo** - Boutons pour remplir automatiquement  
✅ **Error Handling** - Messages d'erreur clairs  
✅ **Loading States** - Indicateurs de chargement  
✅ **Responsive Design** - Mobile/tablet/desktop  

---

## Prochaines Étapes (Optionnel)

- [ ] Ajouter "Mot de passe oublié"
- [ ] Ajouter validation email (confirmation)
- [ ] Ajouter gestion utilisateurs (admin)
- [ ] Ajouter refresh tokens
- [ ] Ajouter 2FA (authentification à 2 facteurs)
- [ ] Ajouter logs d'authentification
- [ ] Ajouter rate limiting sur login

---

## Pour la Défense PFE

**Si on vous demande pourquoi l'authentification:**

> "J'ai implémenté un système d'authentification complet avec JWT pour sécuriser l'accès au dashboard. Le système supporte 3 rôles (admin, technicien, observateur) avec des permissions différentes. Les mots de passe sont hashés avec bcrypt et les tokens JWT expirent après 24h pour la sécurité. J'ai aussi ajouté une page de signup pour permettre aux nouveaux utilisateurs de créer un compte, qui est automatiquement créé avec le rôle 'viewer' pour des raisons de sécurité."

**Points à mentionner:**
- ✅ JWT (JSON Web Tokens) pour l'authentification
- ✅ bcrypt pour le hashing des mots de passe
- ✅ 3 rôles avec permissions différentes
- ✅ Protected routes avec React Router
- ✅ Validation côté client et serveur
- ✅ Messages d'erreur en français
- ✅ Design moderne et responsive

---

✅ **Installation terminée!** Vous avez maintenant un système d'authentification complet et sécurisé.
