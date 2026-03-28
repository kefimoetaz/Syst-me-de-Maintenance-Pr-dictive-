# Alert System Setup Guide

## ✅ What's Been Implemented:

1. **Database**: Alerts table created with 16 columns
2. **Backend API**: Full alert management endpoints
3. **Email Service**: Beautiful HTML email notifications
4. **ML Integration**: Automatic alert creation on HIGH/CRITICAL predictions

---

## 🚀 How to Get Alerts Working:

### Step 1: Stop Current Backend
In the terminal where backend is running, press `Ctrl+C` to stop it.

### Step 2: Restart Backend
```bash
cd backend
node src/index.js
```

You should see:
```
✓ Database connection established successfully
✓ Server started on port 3000
✓ Email service initialized successfully  # (if SMTP configured)
```

### Step 3: Test Alert API
In a NEW terminal:
```bash
cd backend
node test-alerts.js
```

Expected output:
```
✓ Alert created: 1
✓ Found 1 alerts
✓ Found 1 active alerts
✓ Alert acknowledged: ACKNOWLEDGED
=== All Tests Passed! ===
```

### Step 4: Generate Predictions (Triggers Automatic Alerts)
```bash
cd ml-service
python run_predictions_once.py
```

This will:
- Generate predictions for all 5 machines
- Detect HIGH risk (51-56%)
- **Automatically create 5 alerts** in database
- **Send 5 email notifications** (if SMTP configured)

### Step 5: Check Alerts in Database
```bash
cd backend
node -e "const {Pool}=require('pg');const p=new Pool({user:'postgres',password:'123',database:'predictive_maintenance'});p.query('SELECT id, machine_id, severity, title, email_sent, created_at FROM alerts ORDER BY created_at DESC').then(r=>{console.table(r.rows);p.end()})"
```

---

## 📧 Email Configuration

Make sure your `backend/.env` has:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL_RECIPIENTS=your-email@gmail.com

# Backend URL (for email links)
DASHBOARD_URL=http://localhost:3001
```

### For Gmail Users:
1. Go to: https://myaccount.google.com/apppasswords
2. Create an "App Password" for "Mail"
3. Use that password in `SMTP_PASSWORD` (not your regular Gmail password)

---

## 🔍 Troubleshooting:

### Backend won't start - "EADDRINUSE: address already in use"
**Solution**: Another backend instance is running. Find and stop it:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Alerts API returns 404
**Solution**: Backend needs restart to load new routes. Follow Step 1-2 above.

### No emails received
**Possible causes**:
1. SMTP credentials incorrect → Check `.env` file
2. Gmail blocking → Use App Password, not regular password
3. Email in spam folder → Check spam/junk folder
4. Email service disabled → Check backend logs for "Email service initialized"

### Check backend logs:
```bash
cd backend
type backend.log
```

---

## 📊 View Alerts in Dashboard (Coming Next):

The frontend components for viewing alerts will be added next. For now, alerts are:
- ✅ Created in database
- ✅ Sent via email
- ⏳ Dashboard UI (next step)

---

## 🎯 Quick Test (All-in-One):

```bash
# Terminal 1: Start backend
cd backend
node src/index.js

# Terminal 2: Generate predictions & alerts
cd ml-service
python run_predictions_once.py

# Terminal 3: Check results
cd backend
node -e "const {Pool}=require('pg');const p=new Pool({user:'postgres',password:'123',database:'predictive_maintenance'});p.query('SELECT COUNT(*) as total, severity, email_sent FROM alerts GROUP BY severity, email_sent').then(r=>{console.table(r.rows);p.end()})"
```

Expected result:
```
┌─────────┬───────┬──────────┬────────────┐
│ (index) │ total │ severity │ email_sent │
├─────────┼───────┼──────────┼────────────┤
│    0    │  '5'  │  'HIGH'  │    true    │
└─────────┴───────┴──────────┴────────────┘
```

---

## ✉️ What the Email Looks Like:

Subject: `🟠 HIGH Alert: PC-ADMIN-01 - HIGH Risk Prediction for PC-ADMIN-01`

Body includes:
- Machine name and IP
- Risk level with color coding
- Failure probability (7d, 14d, 30d)
- Top contributing factors
- Link to dashboard
- Beautiful HTML formatting

---

## 🎓 For Your PFE Defense:

You can now demonstrate:
1. ✅ **Automatic alert detection** - ML predicts HIGH risk
2. ✅ **Email notifications** - Emails sent automatically
3. ✅ **Alert history** - All alerts stored in database
4. ✅ **Alert management** - Acknowledge/resolve/dismiss via API

This completes the "Alertes automatiques avant incident" requirement! 🎉
