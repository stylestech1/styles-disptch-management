import React from 'react'

const Labels = ({children} : {children : React.ReactNode}) => {
  return (
    <label className='text-xl text-blue-600 font-bold'>{children}</label>
  )
}

export default Labels