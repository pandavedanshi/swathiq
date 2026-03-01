import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, AlertTriangle, Package, TrendingUp, Plus, Download, ShoppingBag } from 'lucide-react'
import { dashboardAPI, salesAPI } from '../api'
import SaleForm from '../components/SaleForm'

function StatCard({ icon: Icon, iconBg, iconColor, badge, badgeClass, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} />
        </div>
        <span className={`stat-badge ${badgeClass}`}>{badge}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('sales')
  const [showSaleForm, setShowSaleForm] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [sumRes, salesRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getRecentSales(10)
      ])
      setSummary(sumRes.data)
      setRecentSales(salesRes.data)
    } catch (e) {
      setError('Failed to load dashboard data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN')}`

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pharmacy CRM</div>
          <div className="page-subtitle">Manage inventory, sales, and purchase orders</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary"><Download size={14} /> Export</button>
          <button className="btn btn-primary" onClick={() => setShowSaleForm(true)}><Plus size={14} /> Add Medicine</button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {summary && (
        <div className="stats-grid">
          <StatCard
            icon={DollarSign}
            iconBg="#d1fae5" iconColor="#10b981"
            badge={`▲ +${summary.sales_change_percent}%`} badgeClass="badge-green"
            value={formatCurrency(summary.today_sales)}
            label="Today's Sales"
          />
          <StatCard
            icon={ShoppingCart}
            iconBg="#dbeafe" iconColor="#3b82f6"
            badge={`${summary.items_sold_today} Orders`} badgeClass="badge-blue"
            value={summary.items_sold_today}
            label="Items Sold Today"
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="#fef3c7" iconColor="#f59e0b"
            badge="Action Needed" badgeClass="badge-orange"
            value={summary.low_stock_items}
            label="Low Stock Items"
          />
          <StatCard
            icon={Package}
            iconBg="#ede9fe" iconColor="#8b5cf6"
            badge={`${summary.purchase_orders.pending} Pending`} badgeClass="badge-purple"
            value={formatCurrency(summary.purchase_orders.total_value)}
            label="Purchase Orders"
          />
        </div>
      )}

      <div className="tabs">
        <div className="tab-list">
          {[
            { id: 'sales', label: 'Sales', icon: TrendingUp },
            { id: 'purchase', label: 'Purchase', icon: Package },
            { id: 'inventory', label: 'Inventory', icon: ShoppingBag }
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="tab-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowSaleForm(true)}><Plus size={13} /> New Sale</button>
          <button className="btn btn-secondary btn-sm"><Plus size={13} /> New Purchase</button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <>
          {showSaleForm && (
            <SaleForm
              onSuccess={() => { setShowSaleForm(false); fetchData() }}
              onCancel={() => setShowSaleForm(false)}
            />
          )}

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Sales</span>
            </div>
            <div className="card-body" style={{ padding: '0 20px' }}>
              {recentSales.length === 0 ? (
                <div className="empty-state">No sales recorded yet.</div>
              ) : (
                recentSales.map(sale => (
                  <div key={sale.id} className="recent-sale-item">
                    <div className="sale-icon">
                      <ShoppingCart size={16} />
                    </div>
                    <div className="sale-info">
                      <div className="sale-invoice">{sale.invoice_no}</div>
                      <div className="sale-meta">
                        {sale.customer_name} • {sale.payment_mode}
                      </div>
                    </div>
                    <div className="sale-right">
                      <div className="sale-amount">{formatCurrency(sale.total_amount)}</div>
                      <div className="sale-date">{sale.sale_date}</div>
                    </div>
                    <span className={`status-badge status-${sale.status}`} style={{ marginLeft: 16 }}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'purchase' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Purchase Orders</span></div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              Switch to the Inventory tab to manage stock.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Inventory</span></div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">🏷️</div>
              Go to the Inventory page for full inventory management.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
