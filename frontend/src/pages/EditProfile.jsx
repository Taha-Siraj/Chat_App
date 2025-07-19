import React, { useContext, useState } from 'react'
import { GlobalContext } from '../context/Context'
import { FaUpload } from 'react-icons/fa';
import { api } from '../Api';
import { Toaster , toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { state } = useContext(GlobalContext);
  const [updatedProfile, setupdatedProfile] = useState({
    firstName: state.user.firstName ,
    lastName: state.user.lastName,
    email: state.user.email,
    phoneNumber: "",
    Bio: ""
  })
  const [image, setImage] = useState(null);
 const navigate = useNavigate()
  

  const handleChange = (e) => {
  const {name, value} = e.target;

  setupdatedProfile((prev) => ({
    ...prev,
    [name]: value
  }))
  console.log(updatedProfile)
  }

    

  const handleprofile = async () => {
    let {firstName , lastName , email , phoneNumber , Bio} = updatedProfile;  
    try {
        let res = await api.put(`/api/v1/updateprofile/${state?.user?.user_id}`, {
          firstName,
          lastName,
          email,
          phoneNumber,
          Bio
        })
        toast.success("updated Profile")
        setupdatedProfile({ phoneNumber: "" , Bio: ""});
        setTimeout(() => {
          navigate('/viewprofile')
        }, 1000);
      console.log(res.data)
      } catch (error) {
        console.log("error", error.response.data)
      }
    } 


 const handleUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('image', file);

  console.log(file);

  try {
    const res = await api.put(`/api/v1/profile-pic/${state.user.user_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        withCredentials: true
      }
    });

    console.log(res.data);
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};

  let inputStyle = 'mt-2 bg-[#374151] outline-none focus:ring-[#6366F1] text-[15px] placeholder:capitalize focus:ring-4 py-4 px-4 rounded-lg w-full'
  return (
    <div className='pt-20 bg-black min:h-screen font-poppins'>
      <Toaster richColors position='top-center' closeButton />
      <div className='flex flex-col justify-center items-center gap-y-8'>
        <h1 className='text-6xl font-extrabold text-center mt-4 text-[#818CF8] capitalize'> edit profile </h1>
        <div className='px-5 flex justify-center items-center flex-col py-6 gap-y-6 rounded-xl min-h-[500px] bg-[#1F2937] w-[500px]'>
          <div className='flex flex-col  justify-center items-center gap-y-3'><img className='border-2 border-[#818CF8] cursor-pointer h-28 rounded-full w-28' src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} alt="" />
            <label htmlFor="photo-upload" className="cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2">
              <FaUpload /> Change Photo
              <input
               id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              />
            </label>
          </div>
          <div className='w-full flex flex-col justify-center gap-y-4'>
            <label className='text-sm text-white'> 
              First Name
              <input
              name='firstName'
              value={updatedProfile.firstName}
              onChange={handleChange}
              type="text" placeholder='first name' className={inputStyle} />
            </label>
            <label className='text-sm text-white'> 
              Last Name
              <input
              name='lastName'
              value={updatedProfile.lastName}
              onChange={handleChange}
              type="text" placeholder='first name' className={inputStyle} />
            </label>
            <label className='text-sm text-white'> 
             Email Address
              <input 
              name='email'
              value={updatedProfile.email}
              onChange={handleChange}
              type="text"
             placeholder='your,email@gmail.com' className={inputStyle} />
            </label>
            <label className='text-sm text-white'> 
             Phone Number
              <input 
              name='phoneNumber'
              value={updatedProfile.phoneNumber}
              onChange={handleChange}
              type="number" placeholder='eg; +92 3XXXXXXXX' className={inputStyle} />
            </label>
            <label className='text-sm text-white'> 
             Bio (Optional)
              <textarea 
              name='Bio'
              value={updatedProfile.Bio}
              onChange={handleChange}
              placeholder='Tell Us about yourself...' className={inputStyle} />
            </label>
          </div>

          <button onClick={handleprofile} className='py-3 px-4 w-full rounded-lg font-semibold bg-blue-700 text-white' > Save Change</button>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
