
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, Building2, Search, Plus, UserCheck, UserX, Clock3, RefreshCw, Phone, Mail, Sun, Moon, Pencil, Trash2, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { getLeads, createLead, updateLead, deleteLead, getStoredUser, getToken, logout, setUnauthorizedHandler } from "./services/api";
import AuthPage from "./AuthPage";
import "./App.css";

const PAGE_SIZE = 10;

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  "name-asc": (a, b) => (a.name || "").localeCompare(b.name || ""),
  "name-desc": (a, b) => (b.name || "").localeCompare(a.name || "")
};

function App() {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("leadflow-theme") || "light");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "", source: "", status: "New" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingLead, setEditingLead] = useState(null);


const handleInputChange = e => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleAddLead = async e => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.company.trim() || !formData.source) {
        setFormError("Please fill in all required fields.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        setFormError("Please enter a valid email address.");
        return;
    }
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(formData.phone.trim())) {
        setFormError("Please enter a valid Indian phone number.");
        return;
    }

    try {
        setSaving(true);
        if (editingLead) {
            await updateLead(editingLead._id, formData);
        } else {
            await createLead(formData);
        }
        setFormData({ name: "", email: "", phone: "", company: "", source: "", status: "New" });
        setEditingLead(null);
        setShowAddModal(false);
        await fetchLeads();
    } catch (err) {
        setFormError(err.message || "Unable to save lead.");
    } finally {
        setSaving(false);
    }
};
const handleEditLead = lead => {
    setEditingLead(lead);
    setFormData({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status });
    setFormError("");
    setShowAddModal(true);
};

const handleDeleteLead = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this lead? This action cannot be undone.");
    if (!confirmed) return;

    try {
        await deleteLead(id);
        await fetchLeads();
    } catch (err) {
        setError(err.message || "Unable to delete lead.");
    }
};

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
    setUnauthorizedHandler(() => {
      setUser(null);
      setLeads([]);
    });
  }, []);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const goToDashboard = () => {
    setActiveNav("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToLeads = () => {
    setActiveNav("leads");
    document.getElementById("all-leads")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setLeads([]);
    setShowAddModal(false);
    setSearchTerm("");
    setSelectedStatus("All");
    setPage(1);
  };

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

  const sortedLeads = useMemo(() => [...filteredLeads].sort(SORTERS[sortBy]), [filteredLeads, sortBy]);
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedLeads = sortedLeads.slice(pageStart, pageStart + PAGE_SIZE);

  const getStatusClass = status => `status-badge status-${(status || "new").toLowerCase()}`;

  if (!user) {
    return <AuthPage theme={theme} onAuthenticated={setUser} />;
  }

  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <div className={`app-container ${theme}-theme`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Building2 size={23} /></div>
          <span>LeadFlow</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-heading">WORKSPACE</p>
          <button type="button" className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`} onClick={goToDashboard} title="Dashboard">
            <LayoutDashboard size={19} /><span>Dashboard</span>
          </button>
          <button type="button" className={`nav-item ${activeNav === "leads" ? "active" : ""}`} onClick={goToLeads} title="All Leads">
            <Users size={19} /><span>All Leads</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <p className="profile-name">{user.name}</p>
            <p className="profile-role">{user.email}</p>
          </div>
          <button className="logout-button" onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
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
          <div className="topbar-avatar">{initial}</div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <h2>Welcome back, {user.name.split(" ")[0]}! 👋</h2>
            <p>Here's what's happening with your leads today.</p>
          </div>
          <button className="primary-button" onClick={() => { setEditingLead(null); setFormData({ name: "", email: "", phone: "", company: "", source: "", status: "New" }); setFormError(""); setShowAddModal(true); }}><Plus size={18} />Add New Lead</button>
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

        <section className="leads-section" id="all-leads">
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
              <input type="text" placeholder="Search by name, email or company..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
            </div>
            <select value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setPage(1); }} className="status-filter" aria-label="Filter by status">
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className="status-filter" aria-label="Sort leads">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>LEAD NAME</th><th>COMPANY</th><th>PHONE</th><th>SOURCE</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="message-cell">Loading leads...</td></tr>
                ) : error ? (
                  <tr><td colSpan="6" className="message-cell error-message">{error}</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan="6" className="message-cell">No leads found. Try changing your search or filter.</td></tr>
                ) : (
                  pagedLeads.map(lead => (
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
                        <td>
                          <div className="action-buttons">
                            <button className="edit-button" onClick={() => handleEditLead(lead)}>
                              <Pencil size={15} /> Edit
                            </button>
                            <button className="delete-button" onClick={() => handleDeleteLead(lead._id)} aria-label="Delete lead" title="Delete lead">
                                <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              {sortedLeads.length === 0
                ? `Showing 0 of ${totalLeads} leads`
                : `Showing ${pageStart + 1}–${pageStart + pagedLeads.length} of ${sortedLeads.length} leads${sortedLeads.length !== totalLeads ? ` (filtered from ${totalLeads})` : ""}`}
            </span>
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </section>

{showAddModal && (
  <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
    <div className="lead-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <h2>{editingLead ? "Edit Lead" : "Add New Lead"}</h2>
          <p>Enter the details of your new prospect.</p>
        </div>
        <button className="modal-close" type="button" onClick={() => setShowAddModal(false)}>×</button>
      </div>

      <form onSubmit={handleAddLead}>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" required />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" required />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
          </div>

          <div className="form-group">
            <label>Company *</label>
            <input name="company" value={formData.company} onChange={handleInputChange} placeholder="Enter company name" required />
          </div>

          <div className="form-group">
            <label>Lead Source *</label>
            <select name="source" value={formData.source} onChange={handleInputChange} required>
              <option value="">Select source</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={() => setShowAddModal(false)}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : editingLead ? "Update Lead" : "Save Lead"}</button>
        </div>
      </form>
    </div>
  </div>
)}

      </main>
    </div>
  );
}

export default App;
