import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  getData, getSettings, adminLogin, 
  deleteTeamMember, deleteEvent, deleteGalleryItem, deleteProject, deleteJoinRequest, deleteContact,
  addTeamMember, createEvent, createGalleryItem, createProject,
  updateTeamMember, updateEvent, updateGalleryItem, updateProject,
  getTasks, createTask, updateTask, deleteTask,
  updateSettings, replyToContact, scheduleInterview, decideApplicant,
  approvePending, rejectPending, getNotifications, clearNotifications
} from "@/lib/api";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // General Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formState, setFormState] = useState<any>({});

  // Specific Action Modals
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyContactId, setReplyContactId] = useState("");
  const [replyText, setReplyText] = useState("");

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewJoinId, setInterviewJoinId] = useState("");
  const [interviewDetails, setInterviewDetails] = useState({ meetLink: "", dateTime: "", note: "" });

  useEffect(() => {
    const savedToken = localStorage.getItem("mss_admin_token");
    if (savedToken) {
      setToken(savedToken);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [resData, resSettings, resNotifs] = await Promise.all([
        getData().catch(() => ({ data: {} })),
        getSettings().catch(() => ({ data: {} })),
        getNotifications().catch(() => ({ data: [] }))
      ]);
      setData(resData.data);
      setSettings(resSettings.data || {});
      setNotifications(Array.isArray(resNotifs.data) ? resNotifs.data : (resNotifs.data?.notifications || []));
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
    setDataLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminLogin(email, password);
      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem("mss_admin_token", res.data.token);
        fetchData();
      } else {
        setError(res.data.error || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("mss_admin_token");
  };

  const handleDelete = async (category: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (category === "team") await deleteTeamMember(id);
      else if (category === "events") await deleteEvent(id);
      else if (category === "gallery") await deleteGalleryItem(id);
      else if (category === "projects") await deleteProject(id);
      else if (category === "join") await deleteJoinRequest(id);
      else if (category === "contact") await deleteContact(id);
      else if (category === "tasks") await deleteTask(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingItem;
    let submitData = { ...formState };
    if (activeTab === "projects" && typeof submitData.techStack === "string") {
      submitData.techStack = submitData.techStack.split(",").map((s: string) => s.trim());
    }

    try {
      if (isEdit) {
        if (activeTab === "team") await updateTeamMember(editingItem.id, submitData);
        else if (activeTab === "events") await updateEvent(editingItem.id, submitData);
        else if (activeTab === "gallery") await updateGalleryItem(editingItem.id, submitData);
        else if (activeTab === "projects") await updateProject(editingItem.id, submitData);
        else if (activeTab === "tasks") await updateTask(editingItem.id, submitData);
      } else {
        if (activeTab === "team") await addTeamMember(submitData);
        else if (activeTab === "events") await createEvent(submitData);
        else if (activeTab === "gallery") await createGalleryItem(submitData);
        else if (activeTab === "projects") await createProject(submitData);
        else if (activeTab === "tasks") await createTask(submitData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save item");
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await replyToContact(replyContactId, replyText);
      setReplyModalOpen(false);
      alert("Reply logged successfully.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to reply");
    }
  };

  const submitInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleInterview(interviewJoinId, interviewDetails);
      setInterviewModalOpen(false);
      alert("Interview scheduled successfully.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to schedule interview");
    }
  };

  const handleDecide = async (id: string, decision: 'selected' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this applicant as ${decision.toUpperCase()}?`)) return;
    try {
      await decideApplicant(id, decision);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed decision");
    }
  };

  const handlePending = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this pending member?`)) return;
    try {
      if (action === 'approve') await approvePending(id);
      else await rejectPending(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed action on pending member");
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      alert("Settings saved successfully!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    }
  };

  const handleClearNotifs = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await clearNotifications();
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to clear notifications");
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      let formVals = { ...item };
      if (activeTab === "projects" && Array.isArray(formVals.techStack)) {
        formVals.techStack = formVals.techStack.join(", ");
      }
      setFormState(formVals);
    } else {
      setEditingItem(null);
      setFormState({});
    }
    setIsModalOpen(true);
  };

  const openReplyModal = (id: string) => {
    setReplyContactId(id);
    setReplyText("");
    setReplyModalOpen(true);
  };

  const openInterviewModal = (id: string) => {
    setInterviewJoinId(id);
    setInterviewDetails({ meetLink: "", dateTime: "", note: "" });
    setInterviewModalOpen(true);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[#050816] text-white pt-32 pb-20 px-6 relative overflow-hidden flex items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
              >
                Admin Portal
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-red-400/80 uppercase tracking-widest text-xs font-semibold"
              >
                Restricted Access Only
              </motion.p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center border border-red-500/20">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className="block mb-2 text-sm font-medium text-gray-300">Admin Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300" 
                  placeholder="admin@domain.com"
                />
              </motion.div>
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300" 
                  placeholder="••••••••"
                />
              </motion.div>
              <motion.button 
                type="submit" 
                disabled={loading} 
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading ? "bg-red-600/50 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/25"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </>
                ) : "Login to Dashboard"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Overview & Dashboard" },
    { id: "join", label: "Recruitment Applications" },
    { id: "pendingMembers", label: "Pending Member Signups" },
    { id: "tasks", label: "Manage Tasks" },
    { id: "team", label: "Team Directory" },
    { id: "events", label: "Events & Workshops" },
    { id: "projects", label: "Projects Portfolio" },
    { id: "gallery", label: "Photo Gallery" },
    { id: "contact", label: "Visitor Messages" },
    { id: "settings", label: "Global Settings" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#04060f", color: "#fff", paddingTop: "120px", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "260px", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "30px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Admin Console</h2>
          <p style={{ color: "#8aabcc", fontSize: "12px" }}>MSS UEMK Operations</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "12px 16px", borderRadius: "8px", background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === tab.id ? "#fff" : "#8aabcc", border: "none", textAlign: "left", cursor: "pointer", fontWeight: activeTab === tab.id ? 600 : 400, transition: "all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(232, 17, 35, 0.1)", color: "#ff6b6b", border: "1px solid rgba(232, 17, 35, 0.2)", cursor: "pointer", fontWeight: 600, marginTop: "20px" }}>
          Secure Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {dataLoading && !data ? (
          <div style={{ textAlign: "center", color: "#8aabcc", padding: "50px" }}>Syncing data layers with backend...</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 700 }}>{tabs.find(t => t.id === activeTab)?.label}</h1>
              {["team", "events", "gallery", "projects", "tasks"].includes(activeTab) && (
                <button onClick={() => openModal()} style={primaryBtnStyle}>
                  + Add New Entity
                </button>
              )}
            </div>

            {/* Content Based on Tab */}
            {activeTab === "dashboard" && (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "16px", alignContent: "start" }}>
                  {[
                    { label: "Active Team Members", value: data?.team?.length || 0, color: "#a855f7" },
                    { label: "Pending Signups", value: data?.pendingMembers?.length || 0, color: "#ef4444" },
                    { label: "Recruitment Apps", value: data?.joinRequests?.length || 0, color: "#f59e0b" },
                    { label: "Public Tasks", value: data?.tasks?.length || 0, color: "#3b82f6" },
                    { label: "Gallery & Projects", value: (data?.gallery?.length || 0) + (data?.projects?.length || 0), color: "#10b981" },
                    { label: "Contact Messages", value: data?.contactMessages?.length || 0, color: "#ec4899" },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <h3 style={{ color: "#8aabcc", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase" }}>{stat.label}</h3>
                      <div style={{ fontSize: "32px", fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", maxHeight: "600px", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>System Notifications</h3>
                    <button onClick={handleClearNotifs} style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "12px" }}>Clear All</button>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ color: "#8aabcc", fontSize: "14px" }}>No recent operations logged.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {notifications.map(n => (
                        <div key={n.id || n._id} style={{ background: "rgba(255,255,255,0.04)", padding: "12px", borderRadius: "8px", borderLeft: "3px solid #3b82f6" }}>
                          <p style={{ fontSize: "13px", color: "#e2e8f0", margin: "0 0 6px 0", lineHeight: 1.4 }}>{n.message}</p>
                          <span style={{ fontSize: "11px", color: "#8aabcc" }}>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {["team", "events", "gallery", "projects", "tasks"].includes(activeTab) && (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={tableHeaderStyle}>Primary Label</th>
                      <th style={tableHeaderStyle}>Secondary Info</th>
                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.[activeTab] || []).map((item: any) => (
                      <tr key={item.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>{item.name || item.title}</td>
                        <td style={{ ...tableCellStyle, color: "#8aabcc", fontSize: "13px" }}>
                          {item.email || item.date || item.category || item.status || "---"}
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "right" }}>
                          <button onClick={() => openModal(item)} style={actionBtnStyle("#3b82f6")}>Edit</button>
                          <button onClick={() => handleDelete(activeTab, item.id)} style={actionBtnStyle("#ef4444")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "pendingMembers" && (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={tableHeaderStyle}>Applicant Name</th>
                      <th style={tableHeaderStyle}>Email & Title</th>
                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Administrative Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.pendingMembers || []).map((item: any) => (
                      <tr key={item.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>{item.name}</td>
                        <td style={{ ...tableCellStyle, color: "#8aabcc", fontSize: "13px" }}>
                          <div>{item.email}</div>
                          <div style={{ fontSize: "11px", marginTop: "4px", color: "#a855f7" }}>{item.title} - {item.category}</div>
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                           <button onClick={() => handlePending(item.id, 'approve')} style={actionBtnSolidStyle("#10b981")}>Approve</button>
                           <button onClick={() => handlePending(item.id, 'reject')} style={actionBtnSolidStyle("#ef4444")}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "join" && (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={tableHeaderStyle}>Candidate Profile</th>
                      <th style={tableHeaderStyle}>Application Status</th>
                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Recruitment Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.joinRequests || []).map((item: any) => (
                      <tr key={item.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#8aabcc", marginTop: "4px" }}>{item.email} | {item.domain}</div>
                          <div style={{ fontSize: "12px", color: "#8aabcc" }}>{item.year} | {item.department}</div>
                        </td>
                        <td style={{ ...tableCellStyle, fontSize: "13px" }}>
                          <span style={{ padding: "4px 8px", borderRadius: "6px", background: item.status === 'pending' ? "rgba(245, 158, 11, 0.2)" : item.status === 'interview_scheduled' ? "rgba(59, 130, 246, 0.2)" : item.status === 'selected' ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: item.status === 'pending' ? "#fcd34d" : item.status === 'interview_scheduled' ? "#93c5fd" : item.status === 'selected' ? "#6ee7b7" : "#fca5a5" }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "right" }}>
                           {item.status === 'pending' && <button onClick={() => openInterviewModal(item.id)} style={actionBtnSolidStyle("#3b82f6")}>Schedule</button>}
                           {item.status === 'interview_scheduled' && (
                             <>
                              <button onClick={() => handleDecide(item.id, 'selected')} style={actionBtnSolidStyle("#10b981")}>Select</button>
                              <button onClick={() => handleDecide(item.id, 'rejected')} style={actionBtnSolidStyle("#ef4444")}>Reject</button>
                             </>
                           )}
                           <button onClick={() => handleDelete("join", item.id)} style={actionBtnStyle("#ef4444")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "contact" && (
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderRowStyle}>
                      <th style={tableHeaderStyle}>Visitor Inquiry</th>
                      <th style={tableHeaderStyle}>Message & Reply</th>
                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.contactMessages || []).map((item: any) => (
                      <tr key={item.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#8aabcc", marginTop: "4px" }}>{item.email}</div>
                          <div style={{ fontSize: "12px", color: "#a855f7" }}>{item.subject}</div>
                        </td>
                        <td style={{ ...tableCellStyle, fontSize: "13px" }}>
                          <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "6px", marginBottom: "6px", color: "#e2e8f0" }}>{item.message}</div>
                          {item.replyText && <div style={{ borderLeft: "3px solid #10b981", paddingLeft: "10px", color: "#6ee7b7", fontStyle: "italic" }}>Admin: {item.replyText}</div>}
                        </td>
                        <td style={{ ...tableCellStyle, textAlign: "right", verticalAlign: "top" }}>
                           <button onClick={() => openReplyModal(item.id)} style={actionBtnSolidStyle("#3b82f6")}>Reply</button>
                           <button onClick={() => handleDelete("contact", item.id)} style={actionBtnStyle("#ef4444")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "settings" && (
              <form onSubmit={saveSettings} style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Portal Global Settings</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div><label style={labelStyle}>IEM Logo URL</label><input type="text" value={settings.iemLogo || ""} onChange={e => setSettings({...settings, iemLogo: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>UEM Logo URL</label><input type="text" value={settings.uemLogo || ""} onChange={e => setSettings({...settings, uemLogo: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>MSS Logo URL</label><input type="text" value={settings.mssLogo || ""} onChange={e => setSettings({...settings, mssLogo: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Instagram URL</label><input type="text" value={settings.instagramUrl || ""} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>LinkedIn URL</label><input type="text" value={settings.linkedinUrl || ""} onChange={e => setSettings({...settings, linkedinUrl: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Facebook URL</label><input type="text" value={settings.facebookUrl || ""} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} style={inputStyle} /></div>
                  <div><label style={labelStyle}>WhatsApp URL</label><input type="text" value={settings.whatsappUrl || ""} onChange={e => setSettings({...settings, whatsappUrl: e.target.value})} style={inputStyle} /></div>
                </div>
                <button type="submit" style={{ ...primaryBtnStyle, marginTop: "20px", width: "auto" }}>Save Settings Config</button>
              </form>
            )}

          </>
        )}
      </div>

      {/* General Entity Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: 700 }}>{editingItem ? "Edit Component Data" : "Deploy New Component Data"}</h2>
            <form onSubmit={handleSave}>
              {activeTab === "team" && (
                <>
                  <input type="text" placeholder="Full Name" value={formState.name || ""} onChange={e => setFormState({...formState, name: e.target.value})} required style={inputStyle} />
                  <input type="email" placeholder="Email Address" value={formState.email || ""} onChange={e => setFormState({...formState, email: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Title/Designation" value={formState.title || ""} onChange={e => setFormState({...formState, title: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Category (e.g. executive_board, session_leads)" value={formState.category || ""} onChange={e => setFormState({...formState, category: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Photo URL" value={formState.photoUrl || ""} onChange={e => setFormState({...formState, photoUrl: e.target.value})} required style={inputStyle} />
                </>
              )}
              {activeTab === "tasks" && (
                <>
                  <input type="text" placeholder="Task Title" value={formState.title || ""} onChange={e => setFormState({...formState, title: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Assigned Member ID (e.g. MB-1)" value={formState.assignedToMemberId || ""} onChange={e => setFormState({...formState, assignedToMemberId: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Deadline (YYYY-MM-DD)" value={formState.deadline || ""} onChange={e => setFormState({...formState, deadline: e.target.value})} style={inputStyle} />
                  <textarea placeholder="Task Description" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} style={{...inputStyle, minHeight: "100px"}} />
                </>
              )}
              {activeTab === "events" && (
                <>
                  <input type="text" placeholder="Name" value={formState.name || ""} onChange={e => setFormState({...formState, name: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Date" value={formState.date || ""} onChange={e => setFormState({...formState, date: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Time" value={formState.time || ""} onChange={e => setFormState({...formState, time: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Venue" value={formState.venue || ""} onChange={e => setFormState({...formState, venue: e.target.value})} style={inputStyle} />
                  <textarea placeholder="Description" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} style={{...inputStyle, minHeight: "100px"}} />
                </>
              )}
              {activeTab === "gallery" && (
                <>
                  <input type="text" placeholder="Title" value={formState.title || ""} onChange={e => setFormState({...formState, title: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Photo URL" value={formState.photoUrl || ""} onChange={e => setFormState({...formState, photoUrl: e.target.value})} required style={inputStyle} />
                  <textarea placeholder="Description" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} style={{...inputStyle, minHeight: "100px"}} />
                </>
              )}
              {activeTab === "projects" && (
                <>
                  <input type="text" placeholder="Title" value={formState.title || ""} onChange={e => setFormState({...formState, title: e.target.value})} required style={inputStyle} />
                  <input type="text" placeholder="Github URL" value={formState.githubUrl || ""} onChange={e => setFormState({...formState, githubUrl: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Live URL" value={formState.liveUrl || ""} onChange={e => setFormState({...formState, liveUrl: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Tech Stack (comma separated)" value={formState.techStack || ""} onChange={e => setFormState({...formState, techStack: e.target.value})} style={inputStyle} />
                  <textarea placeholder="Description" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} style={{...inputStyle, minHeight: "100px"}} />
                </>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={primaryBtnStyle}>Save Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Respond to Contact Inquiry</h2>
            <form onSubmit={submitReply}>
              <textarea placeholder="Type your official response here. This will be visible on the backend records..." value={replyText} onChange={e => setReplyText(e.target.value)} required style={{ ...inputStyle, minHeight: "120px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setReplyModalOpen(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={primaryBtnStyle}>Log Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Schedule Recruitment Interview</h2>
            <form onSubmit={submitInterview}>
              <input type="text" placeholder="Meet Link (e.g. Teams/Zoom URL)" value={interviewDetails.meetLink} onChange={e => setInterviewDetails({...interviewDetails, meetLink: e.target.value})} required style={inputStyle} />
              <input type="text" placeholder="Date & Time (e.g. 24th June, 10:00 AM)" value={interviewDetails.dateTime} onChange={e => setInterviewDetails({...interviewDetails, dateTime: e.target.value})} required style={inputStyle} />
              <textarea placeholder="Additional Notes to Candidate" value={interviewDetails.note} onChange={e => setInterviewDetails({...interviewDetails, note: e.target.value})} style={{ ...inputStyle, minHeight: "80px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setInterviewModalOpen(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={primaryBtnStyle}>Dispatch Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// Reusable Styles
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontFamily: "inherit"
};
const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "8px", fontSize: "12px", color: "#8aabcc", textTransform: "uppercase"
};
const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px", borderRadius: "8px", background: "#1557fc", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 20px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer"
};
const actionBtnStyle = (color: string): React.CSSProperties => ({
  background: "transparent", color, border: "none", marginRight: "12px", cursor: "pointer", fontWeight: 600, fontSize: "13px"
});
const actionBtnSolidStyle = (bg: string): React.CSSProperties => ({
  background: bg, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", marginRight: "8px", cursor: "pointer", fontWeight: 600, fontSize: "12px"
});
const tableContainerStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto"
};
const tableStyle: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse", minWidth: "600px"
};
const tableHeaderRowStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", textAlign: "left", color: "#8aabcc", fontSize: "14px"
};
const tableHeaderStyle: React.CSSProperties = {
  padding: "16px"
};
const tableRowStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.05)"
};
const tableCellStyle: React.CSSProperties = {
  padding: "16px"
};
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px"
};
const modalBoxStyle: React.CSSProperties = {
  background: "#0a0f1c", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto"
};
