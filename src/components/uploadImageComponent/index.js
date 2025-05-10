"use client"

import {useContext, useRef, useState} from 'react'
import PhotoCard from './PhotoCard'
import ButtonSubmit from '../buttonComponent'
import { toast } from 'react-toastify'
import { GlobalContext } from '@/context'



export default function UploadForm({files, setFiles}){
    const{showLoading, setShowLoading} =useContext(GlobalContext)

const formRef = useRef()

async function handlefile(e){
    if(!files.length<1) return  toast.error("You have not chosen any file")
        if(files.length>1){  toast.error("You can only Upload one Images for this Product")}
    else{
 const filess= e.target.files

 const newFiles= [...filess].filter(file =>{
    if(file.size <1024*1024 && file.type.startsWith('image/')){
        return file
    }})
setFiles(prev => [...newFiles, ...prev])
formRef.current.reset()
}
}


async function handleFileDelete(index){
const newFiles= files.filter((_, i) => i !== index)
setFiles(newFiles)
}



    return (

        <form action="" ref ={formRef}>
            <div className='mx-0 my-1 bg-slate-700 p-2 min-h-fit'>
                <input
                type='file'
                accept='image/*'
                multiple
                onChange={handlefile}
                />

                <h5 className='text-red-400'>
                    (*) Only accept one image file less than 1mb in size.
                </h5>
            <div className='flex flex-row justify-start space-x-2  space-y-2'>
                {

                files.map((file, index) => (
                    <PhotoCard key={index} url={URL.createObjectURL(file)} onClick={()=>handleFileDelete(index)}/>
                ))
                }
                {showLoading &&
                    <ButtonSubmit value={'Uploading Image...'}/>
                }
            </div>
            </div>
        </form>
    )
} 