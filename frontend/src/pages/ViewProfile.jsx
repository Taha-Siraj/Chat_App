import React from 'react'

const ViewProfile = () => {
  return (
    <div className='pt-20 bg-black h-screen font-poppins text-white'>
      <div>
         <h1 className='text-[#818CF8] text-4xl text-center font-semibold' >view profile</h1>

         <div className='px-4 rounded-lg max-h-[500px] bg-[#1F2937] w-[400px] ' >
          <div><img  className='border-2 border-[#818CF8] cursor-pointer h-28 rounded-full w-28' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s" alt="" /></div>
          <div className='rounded-lg w-full py-3 px-3 bg-[#111827]'> 
          
          </div>
         </div>
      </div>
    </div>
  )
}

export default ViewProfile
