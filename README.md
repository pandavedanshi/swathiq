# SwasthiQ — Pharmacy CRM

A full-stack Pharmacy Module built with **FastAPI (Python)** + **React** + **PostgreSQL**.

---

## 📁 Project Structure

```
swasthiq/
├── backend/
│   ├── main.py          # FastAPI app, all routes
│   ├── database.py      # PostgreSQL connection + table creation
│   ├── schemas.py       # Pydantic request/response models
│   ├── models.py        # (placeholder, tables in database.py)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/index.js      # Axios API client
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── SaleForm.jsx
    │   │   └── MedicineModal.jsx
    │   └── pages/
    │       ├── Dashboard.jsx
    │       └── Inventory.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **PostgreSQL 14+** running locally

---

## 🐘 1. Set Up PostgreSQL

### Install PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PostgreSQL (macOS with Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Install PostgreSQL (Windows)
Download and install from: https://www.postgresql.org/download/windows/

### Create the database
```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql shell:
CREATE USER pharmacy_user WITH PASSWORD 'yourpassword';
CREATE DATABASE swasthiq OWNER pharmacy_user;
GRANT ALL PRIVILEGES ON DATABASE swasthiq TO pharmacy_user;
\q
```

---

## 🐍 2. Backend Setup (FastAPI)

### Step 1: Navigate to backend folder
```bash
cd swasthiq/backend
```

### Step 2: Create a Python virtual environment
```bash
# Create venv
python3 -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure environment
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:
```
DATABASE_URL=postgresql://pharmacy_user:yourpassword@localhost:5432/swasthiq
```

### Step 5: Start the backend server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

> **Note:** On first run, the app automatically creates all tables and seeds sample data.

---

## ⚛️ 3. Frontend Setup (React + Vite)

### Step 1: Navigate to frontend folder
```bash
cd swasthiq/frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the development server
```bash
npm run dev
```

The app will be at: `http://localhost:5173`

> The Vite dev server proxies `/api` calls to `http://localhost:8000` automatically.

---

## 🌐 REST API Reference

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Today's sales, items sold, low stock count, PO summary |
| GET | `/api/dashboard/recent-sales` | Recent sales list (query: `limit`) |

### Inventory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/overview` | Total items, active stock, low stock, total value |
| GET | `/api/inventory/medicines` | List medicines (query: `search`, `status`, `category`, `skip`, `limit`) |
| POST | `/api/inventory/medicines` | Add a new medicine |
| PUT | `/api/inventory/medicines/{id}` | Update medicine fields |
| PATCH | `/api/inventory/medicines/{id}/status` | Update status only |
| DELETE | `/api/inventory/medicines/{id}` | Delete a medicine |
| GET | `/api/inventory/categories` | Get distinct categories |

### Sales Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales` | Create a new sale |

### Purchase Orders Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | List all purchase orders |

---

## 📐 API Request/Response Examples

### POST `/api/inventory/medicines`
```json
{
  "name": "Paracetamol 650mg",
  "generic_name": "Acetaminophen",
  "category": "Analgesic",
  "batch_no": "PCM-2024-0892",
  "expiry_date": "2026-08-20",
  "quantity": 500,
  "cost_price": 15.00,
  "mrp": 25.00,
  "supplier": "MediSupply Co.",
  "status": "active"
}
```

### GET `/api/dashboard/summary` response
```json
{
  "today_sales": 124580,
  "items_sold_today": 156,
  "low_stock_items": 12,
  "purchase_orders": { "pending": 5, "total_value": 96250 },
  "sales_change_percent": 12.5
}
```

---

## 🔒 Data Consistency on Update

Updates use **partial PATCH semantics** via Pydantic's `exclude_unset=True`. Only fields explicitly sent in the request body are updated in PostgreSQL — unmentioned fields retain their current values. This prevents accidental overwrites.

```python
update_data = medicine.dict(exclude_unset=True)
set_clause = ", ".join(f"{k}=%s" for k in update_data)
cur.execute(f"UPDATE medicines SET {set_clause} WHERE id=%s", ...)
```

All database operations use parameterized queries (psycopg2) to prevent SQL injection.

---

## 🚀 Production Deployment

### Backend (e.g. Railway, Render, Fly.io)
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
Set `DATABASE_URL` as an environment variable.

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the `dist/` folder
```
Set `VITE_API_URL` to your backend URL and update `vite.config.js` proxy or use an env variable in the API client.

---

## 🏥 Features

- **Dashboard**: Real-time sales summary, items sold today, low stock alerts, purchase order overview, recent sales list with payment mode
- **Inventory**: Full CRUD for medicines, status management (Active / Low Stock / Expired / Out of Stock), search and filter by name/category/status, overview stats
- **Responsive**: Clean, professional UI matching the design reference
