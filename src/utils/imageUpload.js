export const imageUpload = async (file) => {
   
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", process.env.CLOUD_UPDATE_PRESET)
        formData.append("cloud_name", process.env.CLOUD_NAME)

        const res = await fetch(process.env.CLOUD_API, {
            method: "POST",
            body: formData
        })

        const data = await res.json()
        const image = data.url
      
       

     //   imgArr.push({public_id: data.public_id, url: data.secure_url})

   return image
}