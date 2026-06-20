import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitJoin } from "@/lib/api";

export default function JoinPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    year: "",
    department: "",
    domain: "",
    reason: "",
    campus: "",
    enrollmentNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!form.name || !form.email) {
      setError("Name and Email are required.");
      setLoading(false);
      return;
    }

    try {
      await submitJoin(form);

      setMessage("Your request has been successfully submitted! We will review it and get back to you.");
      setForm({
        name: "",
        email: "",
        phone: "",
        year: "",
        department: "",
        domain: "",
        reason: "",
        campus: "",
        enrollmentNumber: "",
      });
    } catch (err: any) {
      console.error("Error submitting join request:", err);
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300";
  const labelClasses = "block mb-2 text-sm font-medium text-gray-300";

  return (
    <main className="min-h-screen bg-[#050816] text-white pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white/[0.02] backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              Join Our Team
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-blue-400/80 uppercase tracking-widest text-sm font-semibold"
            >
              Microsoft Student Society UEMK Recruitment
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 text-red-400 px-6 py-4 rounded-xl mb-8 text-sm text-center border border-red-500/20">
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 text-green-400 px-6 py-4 rounded-xl mb-8 text-sm text-center border border-green-500/20">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Full Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClasses} placeholder="John Doe" />
              </motion.div>
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClasses} placeholder="john@example.com" />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Phone Number</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} className={inputClasses} placeholder="+91 9876543210" />
              </motion.div>
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Enrollment Number</label>
                <input type="text" name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} className={inputClasses} placeholder="1202..." />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Year of Study</label>
                <select name="year" value={form.year} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer text-white`}>
                  <option value="" disabled className="bg-gray-900">Select Year</option>
                  <option value="1st Year" className="bg-gray-900">1st Year</option>
                  <option value="2nd Year" className="bg-gray-900">2nd Year</option>
                  <option value="3rd Year" className="bg-gray-900">3rd Year</option>
                  <option value="4th Year" className="bg-gray-900">4th Year</option>
                </select>
              </motion.div>
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Department</label>
                <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="e.g. CSE, ECE" className={inputClasses} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Campus</label>
                <input type="text" name="campus" value={form.campus} onChange={handleChange} placeholder="e.g. New Town" className={inputClasses} />
              </motion.div>
              <motion.div whileTap={{ scale: 0.99 }}>
                <label className={labelClasses}>Interested Domain</label>
                <input type="text" name="domain" value={form.domain} onChange={handleChange} placeholder="e.g. Web Dev, AI/ML, Design" className={inputClasses} />
              </motion.div>
            </div>

            <motion.div whileTap={{ scale: 0.995 }}>
              <label className={labelClasses}>Why do you want to join MSS?</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Tell us about your passion..." className={`${inputClasses} min-h-[140px] resize-y`} />
            </motion.div>

            <motion.button 
              type="submit" 
              disabled={loading} 
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 mt-8 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-xl ${
                loading 
                  ? "bg-blue-600/50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting Application...
                </span>
              ) : "Submit Application"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
