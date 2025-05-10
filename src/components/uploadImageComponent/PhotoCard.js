import Image from 'next/image'
import React from 'react'

const PhotoCard = ({url, onClick}) => {
  return (

        <div className="relative " style={{minHeight:'60px', border:'2px solid black', padding: 5}}>
            <Image
            src={url}
            alt='pix'
            width={100}
            height={60}
            priority
            />
    <button onClick={onClick} className='text-red-500 absolute right-1 top-1 z-10 mt-1 mr-1 bg-slate-100 rounded text-xl font-medium' type='button'>X</button>
    </div>
  )
}

export default PhotoCard