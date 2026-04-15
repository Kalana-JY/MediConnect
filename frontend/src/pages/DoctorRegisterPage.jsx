import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi } from '../services/api';

const DoctorRegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    specialization: '', qualifications: '', experience: '', consultationFee: '',
    hospitalAffiliation: '', gender: 'Male', serviceType: 'both', bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const h = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        qualifications: form.qualifications.split(',').map(q => q.trim()).filter(Boolean),
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
      };
      const res = await doctorApi.register(payload);
      login(res.doctor, res.token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "h-12 px-4 rounded-xl border border-[#d0d8e0] bg-white text-[14px] text-[#1e2a3a] outline-none focus:border-[#0d5f3a] focus:ring-2 focus:ring-[#0d5f3a22] placeholder:text-[#a0aec0] w-full";

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] to-[#e0ecf4] p-6 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e8edf2]">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d5f3a] to-[#1a9960] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v8M8 6h8M3 20h18M5 20V10a2 2 0 012-2h10a2 2 0 012 2v10" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1e2a3a]">Doctor Registration</h1>
            <p className="text-[13.5px] text-[#6b7b8d] mt-1">Join MediConnect as a healthcare provider</p>
          </div>

          {error && <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13.5px]">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">First Name *</label><input type="text" required value={form.firstName} onChange={e => h('firstName', e.target.value)} className={inputCls} placeholder="Jane" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Last Name *</label><input type="text" required value={form.lastName} onChange={e => h('lastName', e.target.value)} className={inputCls} placeholder="Smith" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Email *</label><input type="email" required value={form.email} onChange={e => h('email', e.target.value)} className={inputCls} placeholder="doctor@example.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Password *</label><input type="password" required minLength={6} value={form.password} onChange={e => h('password', e.target.value)} className={inputCls} placeholder="Min 6 chars" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Phone *</label><input type="tel" required value={form.phone} onChange={e => h('phone', e.target.value)} className={inputCls} placeholder="0771234567" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Specialization *</label><input type="text" required value={form.specialization} onChange={e => h('specialization', e.target.value)} className={inputCls} placeholder="Cardiologist" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Gender</label>
                <select value={form.gender} onChange={e => h('gender', e.target.value)} className={inputCls}>{['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}</select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-[#4a5568]">Service Offering *</label>
              <select value={form.serviceType} onChange={e => h('serviceType', e.target.value)} className={inputCls}>
                <option value="in-person">In-Person Only</option>
                <option value="telemedicine">Telemedicine Only</option>
                <option value="both">Both In-Person and Telemedicine</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Qualifications (comma separated)</label><input type="text" value={form.qualifications} onChange={e => h('qualifications', e.target.value)} className={inputCls} placeholder="MBBS, MD, MRCP" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Experience (yrs)</label><input type="number" value={form.experience} onChange={e => h('experience', e.target.value)} className={inputCls} placeholder="10" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Fee (LKR)</label><input type="number" value={form.consultationFee} onChange={e => h('consultationFee', e.target.value)} className={inputCls} placeholder="3000" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Hospital</label><input type="text" value={form.hospitalAffiliation} onChange={e => h('hospitalAffiliation', e.target.value)} className={inputCls} placeholder="Asiri Hospital" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-[12.5px] font-medium text-[#4a5568]">Bio</label><textarea value={form.bio} onChange={e => h('bio', e.target.value)} rows={3} className="px-4 py-3 rounded-xl border border-[#d0d8e0] bg-white text-[14px] text-[#1e2a3a] outline-none focus:border-[#0d5f3a] resize-none placeholder:text-[#a0aec0]" placeholder="Brief professional bio..." /></div>
            <button type="submit" disabled={loading} className="mt-2 h-12 bg-gradient-to-r from-[#0d5f3a] to-[#1a9960] text-white font-semibold rounded-xl border-none cursor-pointer transition-all duration-300 hover:shadow-lg disabled:opacity-60 text-[15px]">
              {loading ? 'Registering...' : 'Register as Doctor'}
            </button>
          </form>
          <p className="mt-4 text-center text-[12.5px] text-[#8a9bae]">Your profile will be verified by an admin before becoming visible.</p>
          <div className="mt-3 text-center text-[13.5px] text-[#6b7b8d]">Already registered? <Link to="/doctor/login" className="text-[#0d5f3a] font-semibold no-underline hover:underline">Sign In</Link></div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegisterPage;
