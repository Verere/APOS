"use server"
import path from 'path'
import fs from 'fs/promises'
import {v4 as uuidv4} from 'uuid'
import os from 'os'
import cloudinary from 'cloudinary';
import { revalidatePath } from 'next/cache'


       
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});



async function savePhotoToLocal(formData){
const files = formData.getAll('files')

const multipleBufferPromise= files.map(file =>(
    file.arrayBuffer().then(data =>
        {
            const buffer= Buffer.from(data)
            const name = uuidv4()
            const ext = file.type.split('/'[1])

    //        // const uploadDir = path.join(process.cwd(), "public", `/${name}.${ext}`)  //Dont work in vercel
       const tempdir = os.tmpdir()
       const uploadDir = path.join(tempdir, `${name}.{ext}`)  //work in vercel
       fs.writeFile(uploadDir, buffer)
    return {filepath: uploadDir, filename: file.name}
        }
        )
))
return await Promise.all(multipleBufferPromise)
}


async function uploadPhotosToCloud(newFiles){
    try {
let imgArr=[]
        const multiplePhotosPromise = newFiles.map(file =>(
   
            cloudinary.v2.uploader.upload(file.filepath, {folder: "averit_commerce_store"}, function(error, result) {imgArr.push({url: result?.secure_url});  return imgArr})
        
                
            ))
        
            await Promise.all(multiplePhotosPromise) 
             return imgArr
    } catch (error) {
       console.log(error)
    }
   
}

export const uploadPhotos = async(formData) => {

    try {
        //Save fotos to temp folder
        const newFiles = await savePhotoToLocal(formData)
       
        //upload to cloudinary
        const data = await uploadPhotosToCloud(newFiles)
        // console.log(data)
       
       

        //del fotos from temp folder after successful upload
        newFiles.map(file =>fs.unlink(file.filepath))
        revalidatePath('/')

        return data
   
    } catch (error) {
        console.log('error', error)
    }


}

export async function getAllPhotos(){
    try {
        
    } catch (error) {
        
    }
}
 //     const response = await fetch('/api/register', {
    //         method:'POST',  
    //         headers: {
    //             'content-type': 'application/json'
    //         },
    //         body: JSON.stringify(formData)
    //     }) 
    //     const finalData = await response.json()
    //     return finalData