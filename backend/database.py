import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin123@localhost:5432/swasthiq")

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def create_tables():
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS medicines (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            generic_name VARCHAR(255),
            category VARCHAR(100),
            batch_no VARCHAR(100),
            expiry_date DATE,
            quantity INTEGER DEFAULT 0,
            cost_price DECIMAL(10,2),
            mrp DECIMAL(10,2),
            supplier VARCHAR(255),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id SERIAL PRIMARY KEY,
            invoice_no VARCHAR(50) UNIQUE NOT NULL,
            customer_name VARCHAR(255),
            total_amount DECIMAL(10,2),
            payment_mode VARCHAR(50),
            status VARCHAR(50) DEFAULT 'completed',
            sale_date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id SERIAL PRIMARY KEY,
            po_no VARCHAR(50) UNIQUE NOT NULL,
            supplier VARCHAR(255),
            total_amount DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    cur.close()
    conn.close()
