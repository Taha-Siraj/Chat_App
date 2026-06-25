import React, { useContext, useState } from 'react'
import { GlobalContext } from '../context/Context'
import { api } from '../Api';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { LuCamera, LuSave, LuUser, LuMail, LuPhone, LuCompass } from 'react-icons/lu';

const EditProfile = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [updatedProfile, setupdatedProfile] = useState({
    firstName: state.user.firstName || '',
    lastName: state.user.lastName || '',
    email: state.user.email || '',
    phoneNumber: state.user.phoneNumber || '',
    Bio: state.user.bio || ''
  })
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setupdatedProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleprofile = async () => {
    let { firstName, lastName, email, phoneNumber, Bio } = updatedProfile;  
    try {
      await api.put(`/api/v1/updateprofile/${state.user.user_id || state.user._id}`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        Bio
      });
      dispatch({
        type: 'USER_LOGIN',
        user: { ...state.user, firstName, lastName, email, phoneNumber, bio: Bio }
      });
      toast.success("Profile Updated");
      setTimeout(() => {
        navigate('/viewprofile');
      }, 1000);
    } catch (error) {
      console.log("error", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    const uploadToast = toast.loading("Uploading picture...");
    try {
      const res = await api.put(`/api/v1/profile-pic/${state.user.user_id || state.user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          withCredentials: true
        }
      });
      dispatch({ type: 'USER_LOGIN', user: { ...state.user, profile: res.data.profileUrl || res.data.profile } });
      toast.success("Profile Avatar Uploaded", { id: uploadToast });
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error("Avatar Upload Failed", { id: uploadToast });
    }
  };

  let labelClass = 'block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-1.5 select-none';
  let inputContainerClass = 'relative flex items-center mb-4';
  let iconClass = 'absolute left-4 text-[#8696a0]';
  let inputStyle = 'pl-11 pr-4 py-2.5 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full text-xs font-sans placeholder-zinc-550 shadow-inner';

  return (
    <>
      <Header />
      <div className='pt-28 pb-20 bg-[#0b141a] min-h-screen text-white relative font-sans px-4 transition-all'>
        <Toaster position='top-center' />

        {/* Glow Backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#00a884]/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

        <div className='flex flex-col justify-center items-center gap-y-6 max-w-md mx-auto relative z-10 animate-fade-in'>
          <h1 className='text-xl font-bold tracking-wider text-white uppercase font-display select-none'>
            Edit Profile Details
          </h1>
          
          <div className='px-6 py-8 flex justify-center items-center flex-col gap-y-5 rounded-2xl w-full bg-[#111b21] border border-[#222d34] shadow-2xl transition-all'>
            
            {/* Avatar Change */}
            <div className='flex flex-col justify-center items-center gap-y-3'>
              <div className="relative group cursor-pointer w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 shadow-md">
                <img 
                  className='h-full w-full object-cover transition group-hover:brightness-50' 
                  src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                  alt="avatar" 
                />
                <label htmlFor="photo-upload" className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition bg-black/40 text-center p-1 cursor-pointer">
                  <LuCamera className="text-xl mb-0.5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Change</span>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className='w-full flex flex-col justify-center'>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <div className={inputContainerClass}>
                    <LuUser className={iconClass} />
                    <input
                      name='firstName'
                      value={updatedProfile.firstName}
                      onChange={handleChange}
                      type="text" 
                      placeholder="First Name" 
                      className={inputStyle} 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Last Name</label>
                  <div className={inputContainerClass}>
                    <LuUser className={iconClass} />
                    <input
                      name='lastName'
                      value={updatedProfile.lastName}
                      onChange={handleChange}
                      type="text" 
                      placeholder="Last Name" 
                      className={inputStyle} 
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className={inputContainerClass}>
                  <LuMail className={iconClass} />
                  <input 
                    name='email'
                    value={updatedProfile.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="you@domain.com" 
                    className={inputStyle} 
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className={inputContainerClass}>
                  <LuPhone className={iconClass} />
                  <input 
                    name='phoneNumber'
                    value={updatedProfile.phoneNumber}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Phone number" 
                    className={inputStyle} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Bio</label>
                <div className="relative flex items-start mb-4">
                  <LuCompass className="absolute left-4 top-3.5 text-[#8696a0]" />
                  <textarea 
                    name='Bio'
                    value={updatedProfile.Bio}
                    onChange={handleChange}
                    placeholder="About you..." 
                    className="pl-11 pr-4 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full text-xs font-sans placeholder-zinc-550 shadow-inner resize-none" 
                    rows="2.5"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleprofile} 
              className='py-3 px-4 w-full rounded-xl font-bold text-xs uppercase tracking-wider bg-[#00a884] hover:bg-[#008f72] text-[#111b21] transition shadow-md flex items-center justify-center gap-2 hover:scale-105 duration-200 mt-1'
            > 
              <LuSave className="text-sm" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProfile
