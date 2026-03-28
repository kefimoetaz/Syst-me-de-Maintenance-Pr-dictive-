# 🎯 Dashboard Access Guide

## ✅ Servers Running

### Backend API
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Port**: 3000

### Frontend Dashboard
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- **Port**: 5173

## 📊 Current Data Status

### Machines
- **Total**: 20 machines
- **Original**: 5 machines (PC-ADMIN-01, PC-DEV-02, PC-SUPPORT-03, PC-TEST-01, Mori)
- **New**: 15 machines (PC-HR-04 through PC-ARCHIVE-18)

### Metrics
- **Total Records**: ~7.8 million metrics
- **Coverage**: 7 days of data for new machines, 30 days for original machines

### Predictions
- **Total**: 10 predictions
- **Risk Level**: All showing HIGH risk (50-56% probability)
- **Model**: random_forest_v7_20260212

### Alerts
- **Total**: 5 alerts in database
- **Email**: Configured and working (kefiimoetaz@gmail.com)

## 🌐 How to Access

1. **Open your browser**
2. **Go to**: http://localhost:5173
3. **You will see**:
   - Dashboard overview with KPIs
   - Machine list with 20 machines
   - Predictions and risk levels
   - Alerts list
   - System health charts

## 📱 What You Can Do

### View Dashboard
- See total machines (20)
- View active alerts (5)
- Check average risk levels
- Monitor system health

### Machine List
- Browse all 20 machines
- See risk levels (color-coded)
- View latest metrics (CPU, RAM, Disk)
- Click on a machine for details

### Alerts
- View all 5 alerts
- See severity levels (HIGH/CRITICAL)
- Check alert messages
- Acknowledge alerts (click "Accuser réception")

### Machine Details
- Click any machine to see:
  - Current metrics
  - Prediction probabilities (7d, 14d, 30d)
  - Historical data
  - SMART data

## 🎨 Visual Features

### Risk Level Colors
- 🟢 **LOW**: < 30% (Green)
- 🟡 **MEDIUM**: 30-50% (Yellow)
- 🟠 **HIGH**: 50-70% (Orange)
- 🔴 **CRITICAL**: > 70% (Red)

### Machine Categories
- **Healthy**: PC-HR-04, PC-FINANCE-05, PC-MARKETING-06, PC-RECEPTION-08
- **Medium Risk**: PC-SALES-07, PC-DESIGN-09, PC-DATA-11, PC-QA-12, PC-BACKUP-13
- **High Risk**: PC-VIDEO-10, PC-OLD-SERVER-14, PC-LEGACY-15, PC-WAREHOUSE-16, PC-LAB-17, PC-ARCHIVE-18

## 🔧 Troubleshooting

### If Dashboard Doesn't Load
```bash
# Check if servers are running
cd backend
npm start

cd frontend
npm run dev
```

### If No Data Shows
```bash
# Check database connection
cd backend
node check-machines.js
node check-predictions.js
```

### To Stop Servers
- Press `Ctrl+C` in each terminal window

## 📸 What to Expect

Your dashboard will show:
1. **KPI Cards** at the top (Total Machines: 20, Active Alerts: 5, etc.)
2. **Machine List** with all 20 machines and their risk levels
3. **Alerts Section** showing 5 active alerts
4. **Charts** showing system health trends
5. **Model Performance** section showing ML model accuracy

## 🎓 For Your PFE Defense

This demonstrates:
- ✅ Real-time monitoring of 20 machines
- ✅ ML predictions with risk assessment
- ✅ Automated alert generation
- ✅ Email notifications for HIGH/CRITICAL alerts
- ✅ Interactive dashboard with React
- ✅ RESTful API with Node.js/Express
- ✅ PostgreSQL database with 7.8M records
- ✅ Complete predictive maintenance workflow

---

**Enjoy exploring your dashboard! 🚀**
