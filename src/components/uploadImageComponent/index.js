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

                <div ref={formRef}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center gap-4 shadow-sm">
                        <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Logo Upload</label>
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-900 transition" onClick={() => document.getElementById('logo-upload').click()}>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlefile}
                                    className="hidden"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Drag & drop or click to select logo (max 1MB, image only)</span>
                            </div>
                            <h5 className="text-xs text-red-400 mt-2">Only one image file less than 1MB is accepted.</h5>
                        </div>
                        <div className="flex flex-row flex-wrap justify-center gap-4 mt-4">
                            {files.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img src={URL.createObjectURL(file)} alt="Logo preview" className="w-20 h-20 object-cover rounded-full border-2 border-blue-400 shadow" />
                                    <button type="button" onClick={() => handleFileDelete(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 group-hover:opacity-100 transition">&times;</button>
                                </div>
                            ))}
                            {showLoading && <ButtonSubmit value={'Uploading Image...'} />}
                        </div>
                    </div>
                </div>
    )
} 