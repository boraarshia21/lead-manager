
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, Building2, Settings, Search, Bell, Plus, UserCheck, UserX, Clock3, RefreshCw, Phone, Mail, Sun, Moon } from "lucide-react";
import { getLeads } from "./services/api";
import "./App.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("leadflow-theme") || "light");

useEffect(() => {
  localStorage.setItem("leadflow-theme", theme);
}, [theme]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLeads();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message || "Unable to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Dashboard statistics
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === "New").length;
  const contactedLeads = leads.filter(lead => lead.status === "Contacted").length;
  const qualifiedLeads = leads.filter(lead => lead.status === "Qualified").length;
  const lostLeads = leads.filter(lead => lead.status === "Lost").length;

  // Search and filter
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = [lead.name, lead.email, lead.company].some(value =>
        (value || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, selectedStatus]);

  const getStatusClass = status => `status-badge status-${(status || "new").toLowerCase()}`;

  return (
    <div className={`app-container ${theme}-theme`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Building2 size={23} /></div>
          <span>LeadFlow</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-heading">WORKSPACE</p>
          <div className="nav-item active"><LayoutDashboard size={19} /><span>Dashboard</span></div>
          <div className="nav-item"><Users size={19} /><span>All Leads</span></div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-heading">PREFERENCES</p>
          <div className="nav-item"><Settings size={19} /><span>Settings</span></div>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <p className="profile-name">Admin User</p>
            <p className="profile-role">Sales Workspace</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Dashboard</h1>
          </div>
          <div className="topbar-right">
  <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
    {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
  </button>
  <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
  <div className="topbar-avatar">A</div>
</div>
        </header>

        <section className="welcome-section">
          <div>
            <h2>Welcome back! 👋</h2>
            <p>Here's what's happening with your leads today.</p>
          </div>
          <button className="primary-button" disabled><Plus size={18} />Add New Lead</button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top"><span>Total Leads</span><div className="stat-icon purple"><Users size={20} /></div></div>
            <h2>{totalLeads}</h2>
            <p>All captured leads</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>New Leads</span><div className="stat-icon blue"><Clock3 size={20} /></div></div>
            <h2>{newLeads}</h2>
            <p>Awaiting follow-up</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Contacted</span><div className="stat-icon orange"><Phone size={20} /></div></div>
            <h2>{contactedLeads}</h2>
            <p>Leads contacted</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Qualified Leads</span><div className="stat-icon green"><UserCheck size={20} /></div></div>
            <h2>{qualifiedLeads}</h2>
            <p>Potential customers</p>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Lost Leads</span><div className="stat-icon red"><UserX size={20} /></div></div>
            <h2>{lostLeads}</h2>
            <p>Unconverted leads</p>
          </div>
        </section>

        <section className="leads-section">
          <div className="section-header">
            <div>
              <h2>All Leads</h2>
              <p>Manage and track your sales prospects.</p>
            </div>
            <button className="refresh-button" onClick={fetchLeads}><RefreshCw size={16} />Refresh</button>
          </div>

          <div className="table-controls">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search by name, email or company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="status-filter">
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>LEAD NAME</th><th>COMPANY</th><th>PHONE</th><th>SOURCE</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="message-cell">Loading leads...</td></tr>
                ) : error ? (
                  <tr><td colSpan="5" className="message-cell error-message">{error}</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan="5" className="message-cell">No leads found. Try changing your search or filter.</td></tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead._id}>
                      <td>
                        <div className="lead-person">
                          <div className="lead-avatar">{(lead.name || "?").charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="lead-name">{lead.name}</p>
                            <p className="lead-email"><Mail size={12} />{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{lead.company}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td><span className={getStatusClass(lead.status)}>{lead.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">Showing {filteredLeads.length} of {totalLeads} leads</div>
        </section>
      </main>
    </div>
  );
}

export default App;
