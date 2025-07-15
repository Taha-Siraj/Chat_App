import React from 'react'
import Alluser from './Alluser'
import { useParams } from 'react-router-dom'

const chat = () => {

  const id = useParams()
  console.log(id)
  return (
    <div className='py-20'>
      <h1>Chat</h1>
    </div>
  )
}

export default chat
