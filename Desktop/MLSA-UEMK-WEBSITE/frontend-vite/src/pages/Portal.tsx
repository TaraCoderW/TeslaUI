import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestOtp, verifyOtp, memberSignup } from "@/lib/api";

export default function PortalPage() {
  const [view, setView] = useState<"login" | "otp" | "signup">("login");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await requestOtp({ email, memberId });
      if (res.data.success) {
        setView("otp");
        setMessage("OTP sent to your email!");
      } else {
        setError(res.data.error || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await verifyOtp({ email, memberId, otp });
      if (res.data.success) {
        setMessage("Login successful! Welcome to the portal.");
        localStorage.setItem("mss_member_token", res.data.token || `mss-member-token-${memberId}`);
        if (res.data.member) {
          localStorage.setItem("mss_member_data", JSON.stringify(res.data.member));
        }
      } else {
        setError(res.data.error || "Invalid OTP");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());
    if (photoBase64) {
      payload.photoUrl = photoBase64;
    }
    
    try {
      const res = await memberSignup(payload);
      if (res.data.success) {
        setMessage("Registration submitted! Wait for admin approval.");
        setView("login");
      } else {
        setError(res.data.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300";
  const labelClasses = "block mb-2 text-sm font-medium text-gray-300 capitalize";

  return (
    <main className="min-h-screen bg-[#050816] text-white pt-32 pb-20 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              Member Portal
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-blue-400/80 uppercase tracking-widest text-xs font-semibold"
            >
              Microsoft Student Society UEMK
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center border border-red-500/20">
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm text-center border border-green-500/20">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleRequestOtp} className="space-y-5">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <label className={labelClasses}>Member ID (e.g. MSS-1234)</label>
                  <input type="text" value={memberId} onChange={e => setMemberId(e.target.value)} required className={inputClasses} placeholder="MSS-" />
                </motion.div>
                <motion.div whileTap={{ scale: 0.99 }}>
                  <label className={labelClasses}>Registered Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} placeholder="member@domain.com" />
                </motion.div>
                <motion.button 
                  type="submit" 
                  disabled={loading} 
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-lg ${
                    loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                  }`}
                >
                  {loading ? "Sending OTP..." : "Request Access OTP"}
                </motion.button>
                <div className="text-center mt-6 text-sm text-gray-400">
                  Not a member yet? <span className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors" onClick={() => setView("signup")}>Register here</span>
                </div>
              </motion.form>
            )}

            {view === "otp" && (
              <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyOtp} className="space-y-5">
                <motion.div whileTap={{ scale: 0.99 }}>
                  <label className={labelClasses}>Enter OTP sent to {email}</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required className={`${inputClasses} text-center text-2xl tracking-[0.5em] font-mono`} maxLength={6} placeholder="------" />
                </motion.div>
                <motion.button 
                  type="submit" 
                  disabled={loading} 
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-lg ${
                    loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify & Secure Login"}
                </motion.button>
                <div className="text-center mt-6 text-sm">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer" onClick={() => setView("login")}>← Back to login</span>
                </div>
              </motion.form>
            )}

            {view === "signup" && (
              <motion.form key="signup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {["name", "email", "title", "category", "linkedinUrl", "instagramUrl", "photoUrl"].map(field => (
                  <motion.div key={field} whileTap={{ scale: 0.99 }}>
                    <label className={labelClasses}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                    {field === "photoUrl" ? (
                      <div className="space-y-3">
                        <input type="text" name={field} placeholder="Image URL (optional if uploading)" className={inputClasses} />
                        <div className="relative">
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`${inputClasses} flex items-center justify-center border-dashed border-2 text-blue-400 bg-blue-500/5 transition-colors group-hover:bg-blue-500/10`}>
                            {photoBase64 ? "✓ Image Uploaded Successfully" : "+ Click to Upload from Device"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <input type={field === "email" ? "email" : "text"} name={field} required={field === "name" || field === "email" || field === "linkedinUrl"} className={inputClasses} />
                    )}
                  </motion.div>
                ))}
                <motion.button 
                  type="submit" 
                  disabled={loading} 
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-3.5 mt-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                    loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </motion.button>
                <div className="text-center mt-6 text-sm text-gray-400 pb-2">
                  Already a member? <span className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors" onClick={() => setView("login")}>Login</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  );
}
