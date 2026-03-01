from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_tables, get_db
from models import *
from schemas import *
from typing import Optional
import psycopg2
from datetime import date, datetime, timedelta
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    seed_data()
    yield

app = FastAPI(title="SwasthiQ Pharmacy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_data():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM medicines")
    count = cur.fetchone()[0]
    if count == 0:
        medicines = [
            ("Paracetamol 650mg", "Acetaminophen", "Analgesic", "PCM-2024-0892", "2026-08-20", 500, 15.00, 25.00, "MediSupply Co.", "active"),
            ("Omeprazole 20mg Capsule", "Omeprazole", "Gastric", "OMP-2024-5873", "2025-11-10", 45, 65.00, 95.75, "HealthCare Ltd.", "low_stock"),
            ("Aspirin 75mg", "Aspirin", "Anticoagulant", "ASP-2023-3421", "2024-09-30", 300, 28.00, 45.00, "GreenMed", "expired"),
            ("Atorvastatin 10mg", "Atorvastatin Besylate", "Cardiovascular", "AME-2024-0945", "2025-10-15", 0, 145.00, 195.00, "PharmaCorp", "out_of_stock"),
            ("Metformin 500mg", "Metformin HCl", "Antidiabetic", "MET-2024-1122", "2026-03-15", 200, 12.00, 18.00, "MediSupply Co.", "active"),
            ("Azithromycin 500mg", "Azithromycin", "Antibiotic", "AZI-2024-3344", "2025-12-01", 80, 95.00, 140.00, "HealthCare Ltd.", "active"),
            ("Cetirizine 10mg", "Cetirizine HCl", "Antihistamine", "CET-2024-5566", "2026-06-30", 150, 8.00, 14.00, "GreenMed", "active"),
            ("Amlodipine 5mg", "Amlodipine Besylate", "Antihypertensive", "AML-2024-7788", "2025-09-20", 20, 55.00, 80.00, "PharmaCorp", "low_stock"),
            ("Vitamin D3 1000IU", "Cholecalciferol", "Supplement", "VIT-2024-9900", "2027-01-10", 400, 35.00, 55.00, "MediSupply Co.", "active"),
            ("Pantoprazole 40mg", "Pantoprazole Sodium", "Gastric", "PAN-2024-1234", "2026-05-15", 60, 42.00, 65.00, "GreenMed", "active"),
        ]
        cur.executemany(
            """INSERT INTO medicines (name, generic_name, category, batch_no, expiry_date, quantity, cost_price, mrp, supplier, status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            medicines
        )

        sales = [
            ("INV-2024-1234", "Rajesh Kumar", 340.00, "Card", "completed", date.today()),
            ("INV-2024-1235", "Sarah Smith", 145.00, "Cash", "completed", date.today()),
            ("INV-2024-1236", "Michael Johnson", 525.00, "UPI", "completed", date.today()),
            ("INV-2024-1237", "Priya Sharma", 280.00, "Cash", "completed", date.today() - timedelta(days=1)),
            ("INV-2024-1238", "Arjun Patel", 960.00, "Card", "completed", date.today() - timedelta(days=1)),
        ]
        cur.executemany(
            """INSERT INTO sales (invoice_no, customer_name, total_amount, payment_mode, status, sale_date)
               VALUES (%s,%s,%s,%s,%s,%s)""",
            sales
        )

        purchase_orders = [
            ("PO-2024-001", "MediSupply Co.", 15000.00, "pending"),
            ("PO-2024-002", "HealthCare Ltd.", 8500.00, "pending"),
            ("PO-2024-003", "GreenMed", 12000.00, "completed"),
            ("PO-2024-004", "PharmaCorp", 22000.00, "pending"),
            ("PO-2024-005", "MediSupply Co.", 9800.00, "pending"),
        ]
        cur.executemany(
            """INSERT INTO purchase_orders (po_no, supplier, total_amount, status)
               VALUES (%s,%s,%s,%s)""",
            purchase_orders
        )
        conn.commit()
    cur.close()
    conn.close()

# ─── Dashboard APIs ────────────────────────────────────────────────────────────

@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    conn = get_db()
    cur = conn.cursor()
    today = date.today()

    cur.execute("SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE sale_date=%s", (today,))
    today_sales = float(cur.fetchone()[0])

    cur.execute("SELECT COUNT(*) FROM sales WHERE sale_date=%s", (today,))
    items_sold = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM medicines WHERE status='low_stock' OR quantity < 50")
    low_stock = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM purchase_orders WHERE status='pending'")
    pending_pos = cur.fetchone()[0]

    cur.execute("SELECT COALESCE(SUM(total_amount),0) FROM purchase_orders")
    total_po_value = float(cur.fetchone()[0])

    cur.close()
    conn.close()

    return {
        "today_sales": today_sales,
        "items_sold_today": items_sold,
        "low_stock_items": low_stock,
        "purchase_orders": {"pending": pending_pos, "total_value": total_po_value},
        "sales_change_percent": 12.5
    }

@app.get("/api/dashboard/recent-sales")
def get_recent_sales(limit: int = 10):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, invoice_no, customer_name, total_amount, payment_mode, status, sale_date
           FROM sales ORDER BY id DESC LIMIT %s""",
        (limit,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "invoice_no": r[1], "customer_name": r[2],
            "total_amount": float(r[3]), "payment_mode": r[4],
            "status": r[5], "sale_date": str(r[6])
        } for r in rows
    ]

# ─── Inventory APIs ────────────────────────────────────────────────────────────

@app.get("/api/inventory/overview")
def get_inventory_overview():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM medicines")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM medicines WHERE status='active'")
    active = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM medicines WHERE status='low_stock'")
    low_stock = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(SUM(quantity * cost_price),0) FROM medicines")
    total_value = float(cur.fetchone()[0])
    cur.close()
    conn.close()
    return {"total_items": total, "active_stock": active, "low_stock": low_stock, "total_value": total_value}

@app.get("/api/inventory/medicines")
def list_medicines(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50
):
    conn = get_db()
    cur = conn.cursor()
    query = "SELECT * FROM medicines WHERE 1=1"
    params = []
    if search:
        query += " AND (name ILIKE %s OR generic_name ILIKE %s OR batch_no ILIKE %s)"
        params += [f"%{search}%", f"%{search}%", f"%{search}%"]
    if status:
        query += " AND status=%s"
        params.append(status)
    if category:
        query += " AND category=%s"
        params.append(category)
    query += " ORDER BY id OFFSET %s LIMIT %s"
    params += [skip, limit]
    cur.execute(query, params)
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    cur.close()
    conn.close()
    return [dict(zip(cols, r)) for r in rows]

@app.post("/api/inventory/medicines", status_code=201)
def add_medicine(medicine: MedicineCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO medicines (name, generic_name, category, batch_no, expiry_date, quantity, cost_price, mrp, supplier, status)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
        (medicine.name, medicine.generic_name, medicine.category, medicine.batch_no,
         medicine.expiry_date, medicine.quantity, medicine.cost_price, medicine.mrp,
         medicine.supplier, medicine.status)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "message": "Medicine added successfully"}

@app.put("/api/inventory/medicines/{medicine_id}")
def update_medicine(medicine_id: int, medicine: MedicineUpdate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM medicines WHERE id=%s", (medicine_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Medicine not found")
    update_data = medicine.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{k}=%s" for k in update_data)
    values = list(update_data.values()) + [medicine_id]
    cur.execute(f"UPDATE medicines SET {set_clause} WHERE id=%s", values)
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Medicine updated successfully"}

@app.patch("/api/inventory/medicines/{medicine_id}/status")
def update_medicine_status(medicine_id: int, payload: StatusUpdate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM medicines WHERE id=%s", (medicine_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Medicine not found")
    cur.execute("UPDATE medicines SET status=%s WHERE id=%s", (payload.status, medicine_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Status updated"}

@app.delete("/api/inventory/medicines/{medicine_id}", status_code=204)
def delete_medicine(medicine_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM medicines WHERE id=%s", (medicine_id,))
    conn.commit()
    cur.close()
    conn.close()

# ─── Sales APIs ────────────────────────────────────────────────────────────────

@app.post("/api/sales", status_code=201)
def create_sale(sale: SaleCreate):
    conn = get_db()
    cur = conn.cursor()
    today = date.today()
    cur.execute("SELECT COUNT(*) FROM sales")
    count = cur.fetchone()[0] + 1
    invoice_no = f"INV-{today.year}-{count:04d}"
    cur.execute(
        """INSERT INTO sales (invoice_no, customer_name, total_amount, payment_mode, status, sale_date)
           VALUES (%s,%s,%s,%s,'completed',%s) RETURNING id""",
        (invoice_no, sale.customer_name, sale.total_amount, sale.payment_mode, today)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"id": new_id, "invoice_no": invoice_no, "message": "Sale created successfully"}

# ─── Purchase Orders ───────────────────────────────────────────────────────────

@app.get("/api/purchase-orders")
def list_purchase_orders():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM purchase_orders ORDER BY id DESC")
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    cur.close()
    conn.close()
    return [dict(zip(cols, r)) for r in rows]

@app.get("/api/inventory/categories")
def get_categories():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT category FROM medicines ORDER BY category")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [r[0] for r in rows]
