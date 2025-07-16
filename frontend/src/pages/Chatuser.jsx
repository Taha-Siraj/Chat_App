import React from 'react'
import Alluser from './Alluser'
import { useParams } from 'react-router-dom'
import { api } from '../Api'

const chat = () => {

  const id = useParams()
  console.log(id)

  const sentMsg =  async () => {
    try {
      let res = await api.post(`/chat/${id}`)
    } catch (error) {
      
    }
  }
  return (
    <div className='py-20 bg-black h-screen text-white font-poppins'>
      <h1 className='text-5xl font-bold' >Chat</h1>
      <input type="text" className='py-2 px-4 rounded-md' />
      <br />
      <button onClick={sentMsg} className='py-2 px-4 bg-green-600 rounded-md mt-2' > Send Msg</button>
    </div>
  )
}

export default chat
