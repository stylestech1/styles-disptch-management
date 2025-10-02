import React from 'react'

const Titles = ({children} : {children : React.ReactNode}) => {
  return (
    <div className='font-bold text-4xl'>{children}</div>
  )
}

export default Titles