import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Plus, Phone, Droplets, MapPin, Loader2, User, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { GAS_URLS } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

interface Donor {
  name: string;
  department: string;
  class: string;
  contact: string;
  bloodGroup: string;
}

export default function BloodBank() {
  const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Emergency Request form
  const [emergencyData, setEmergencyData] = useState({
    hospital: '',
    requiredGroup: '',
    units: '',
    details: '',
    contactName: '',
    contactPhone: ''
  });

  // Donor Registration form
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    class: '',
    contact: '',
    bloodGroup: ''
  });

  const handleEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('blood_emergency_requests')
        .insert([{
          blood_group: emergencyData.requiredGroup,
          units_required: emergencyData.units,
          hospital_venue: emergencyData.hospital,
          contact_number: emergencyData.contactPhone,
          status: 'active'
        }]);

      if (error) throw error;
      
      alert("Emergency Alert Broadcasted! NSS Volunteers will be notified.");
      setEmergencyData({ hospital: '', requiredGroup: '', units: '', details: '', contactName: '', contactPhone: '' });
      setActiveTab('donors');
    } catch (err) {
      alert("Error broadcasting alert");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDonors = async (bg?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('blood_donors').select('*');
      if (bg) query = query.eq('blood_group', bg);
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (data) {
        setDonors(data.map(d => ({
          name: d.full_name,
          department: d.unit ? `Unit ${d.unit}` : 'NSS',
          class: d.last_donated ? `Last: ${d.last_donated}` : 'New Donor',
          contact: d.mobile,
          bloodGroup: d.blood_group
        })));
      }
    } catch (err) {
      console.error("Failed to load donors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('blood_donors')
        .insert([{
          full_name: formData.name,
          blood_group: formData.bloodGroup,
          mobile: formData.contact,
          unit: localStorage.getItem('unit') || 'Unknown'
        }]);

      if (error) throw error;
      
      alert("Donor Registered Successfully!");
      setFormData({ name: '', department: '', class: '', contact: '', bloodGroup: '' });
      setShowAddForm(false);
      fetchDonors();
    } catch (err) {
      alert("Error adding donor");
    } finally {
      setSubmitting(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-red-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
              <Heart size={40} className="fill-current text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">AMRIT BLOOD BANK</h1>
            <p className="text-red-100 mt-2 text-lg font-medium">NSS College Ottapalam | Units 36 & 94</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Register as Donor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tab Switcher */}
        <div className="flex bg-white rounded-3xl shadow-sm border border-slate-100 p-2 max-w-lg mx-auto mb-12">
          <button 
            onClick={() => setActiveTab('donors')}
            className={cn(
              "flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'donors' ? "bg-red-600 text-white shadow-xl shadow-red-600/20" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Donor Directory
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={cn(
              "flex-1 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'requests' ? "bg-red-600 text-white shadow-xl shadow-red-600/20" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Emergency Request
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'donors' ? (
            <motion.div
              key="donors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by name or blood group..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-14 bg-white rounded-2xl pl-12 pr-4 shadow-sm border border-slate-100 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {bloodGroups.map(bg => (
                    <button
                      key={bg}
                      onClick={() => fetchDonors(bg)}
                      className="px-6 py-4 bg-white text-slate-600 font-bold rounded-xl shadow-sm border border-slate-100 hover:border-red-500 hover:text-red-600 transition-all whitespace-nowrap"
                    >
                      {bg}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchDonors()}
                    className="px-6 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all whitespace-nowrap"
                  >
                    All Groups
                  </button>
                </div>
              </div>

              {/* Donor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="bg-white h-64 rounded-[2rem] shadow-sm animate-pulse border border-slate-100" />
                  ))
                ) : filteredDonors.length > 0 ? (
                  filteredDonors.map((donor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="pro-card pro-card-hover p-8 group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 flex items-center justify-center rounded-bl-[3rem]">
                        <span className="text-2xl font-black text-red-600">{donor.bloodGroup}</span>
                      </div>
                      
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                        <User size={24} />
                      </div>
                      
                      <h4 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{donor.name}</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                        {donor.department} • {donor.class}
                      </p>
                      
                      <a 
                        href={`tel:${donor.contact}`}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                      >
                        <Phone size={14} />
                        {donor.contact}
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <Droplets size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No Donors Found</h3>
                    <p className="text-slate-400 mt-2">Try adjusting your filters or search keywords.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-red-600/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-red-100 text-red-600 rounded-3xl">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Submit Emergency Request</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Broadcast to all matching unit donors instantly</p>
                  </div>
                </div>

                <form onSubmit={handleEmergencyRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital Name</label>
                       <input required type="text" value={emergencyData.hospital} onChange={e => setEmergencyData({...emergencyData, hospital: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold" placeholder="e.g., Taluk Hospital, Ottapalam" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Blood Group</label>
                       <select required value={emergencyData.requiredGroup} onChange={e => setEmergencyData({...emergencyData, requiredGroup: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-red-100 transition-all font-black">
                          <option value="">Select Group</option>
                          {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                       <input required type="text" value={emergencyData.contactName} onChange={e => setEmergencyData({...emergencyData, contactName: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                       <input required type="tel" value={emergencyData.contactPhone} onChange={e => setEmergencyData({...emergencyData, contactPhone: e.target.value})} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Details</label>
                    <textarea value={emergencyData.details} onChange={e => setEmergencyData({...emergencyData, details: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all font-bold min-h-[100px] resize-none" placeholder="Reason for requirement, patient name, etc." />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3">
                    {submitting ? <Loader2 className="animate-spin" /> : <>Broadcast Emergency Request <ArrowRight size={18} /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Donor Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Register as Donor</h3>
                  <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="text" required placeholder="Full Name" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Department" 
                      value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" 
                    />
                    <input 
                      type="text" placeholder="Class" 
                      value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" 
                    />
                  </div>
                  <input 
                    type="tel" required placeholder="Contact Number" 
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" 
                  />
                  <select 
                    required 
                    value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                  
                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
