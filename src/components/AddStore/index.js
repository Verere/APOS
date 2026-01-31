'use client'
import { addStore } from "@/actions";
import React, {useEffect, useContext, useState, useRef, useActionState  } from "react";
import {GlobalContext} from '@/context'
import { StatesFormControl } from "@/utils/states";
import UploadForm from "../uploadImageComponent";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadPhotos } from "@/actions/uploadPhoto";
import {  useFormStatus } from "react-dom";

const AddStore =()=>{

    const [loading, setLoading] =useState(false)
    const [states, setStates] = useState('')
    const [lga, setLga] = useState('')
    const [lgas, setLgas] = useState([])
    const [country, setCountry] = useState('')
    const initialState = { error: null };
    const { pending } = useFormStatus();
const [state, formAction] = useActionState (addStore, initialState);
    // const [result, formAction, isPending] = React.useActionState(addStore);
    const [logo, setLogo] = useState([])
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const {replace} = useRouter()
    const {
      user,
      files,
      setFiles,     
      setShowLoading,   
    } = useContext(GlobalContext);
      
    const formRef = useRef(null)
    
    // Note: rely on native form submission to invoke server action (formAction)
    
    useEffect(() => {
      async function handleUpload(event) {
        if (files.length !== 0) {
          setShowLoading(true);
          const formDatas = new FormData();
          files.forEach((file) => {
            formDatas.append("files", file);
          });
          const data = await uploadPhotos(formDatas);
          if (data) {
            setLogo(data)
          
            setShowLoading(false);
          } else {
            toast.error("Something went wrong please upload image again");
            setFiles([]);
            setShowLoading(false);
            setLogo([])
          }
        }
      }
      handleUpload();
    }, [files]);
    
    useEffect(()=>{
      // initialize store email from current user if available
      if (user && user.email) setStoreEmail(user.email)
    },[user])
        useEffect(()=>{
      // console.log(StatesFormControl)
      const getLgas = ()=>{
        const lg = StatesFormControl.filter(order=>order?.label===states)
        let slg= lg[0]?.lga
        setLgas(slg)
      }
      getLgas()
    },[states])
    // useEffect(()=>{
    //   // load lgas only when a state is selected; reset lga selection
    //   if (!states) {
    //     setLgas([])
    //     setLga('')
    //     return
    //   }

    //   const entry = StatesFormControl.find(s => String(s.label) === String(states) || String(s.id) === String(states))

    //   if (entry) {
    //     // ensure the structure has an array for lga
    //     if (!Array.isArray(entry.lga)) {
    //       entry.lga = []
    //     }
    //     setLgas(entry.lga)
    //   } else {
    //     // if the source data lacks an entry for this state, create a fallback
    //     const fallback = { id: String(states).toLowerCase().replace(/\s+/g, '-'), label: states, lga: [] }
    //     StatesFormControl.push(fallback)
    //     setLgas([])
    //   }
    //   setLga('')
    // },[states])
    useEffect(()=>{
      if (!state) return
      setLoading(false)
      if (state.error) {
        toast.error(state.error || 'Failed to create store')
        return
      }
      if (state.success) {
        toast.success(state.message || 'Store created')
        if (formRef.current) formRef.current.reset()
        replace('/dashboard')
      }
    },[state, replace])
    return(
        <form ref={formRef} action={formAction} className="flex flex-col w-full max-w-2xl mx-auto space-y-6 px-4 py-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <h3 className="text-center font-bold uppercase pt-4 text-2xl text-gray-800 dark:text-white">Enter New Store</h3>

          <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2">

            <input type="text" placeholder="Enter Business Name" name="name" className="border border-gray-400 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500" required />
            <div className="w-full">
              <label className="text-sm font-medium">Contact Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  const v = e.target.value
                  setEmail(v)
                  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
                  if (!v) setEmailError('Email is required')
                  else if (!re.test(v)) setEmailError('Invalid email address')
                  else setEmailError('')
                }}
                onBlur={(e) => { if (!e.target.value) setEmailError('Email is required') }}
                placeholder="contact@business.com"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              {emailError ? <p className="text-sm text-red-500 mt-1">{emailError}</p> : null}
            </div>
          {/* ...existing code... */}

            <div className="w-full">
              <label className="text-sm font-medium">Country</label>
              <select
                name="country"
                className="border border-gray-400 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
              >
              <option value="">Select Country</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Algeria">Algeria</option>
              <option value="Andorra">Andorra</option>
              <option value="Angola">Angola</option>
              <option value="Antigua and Barbuda">Antigua and Barbuda</option>
              <option value="Argentina">Argentina</option>
              <option value="Armenia">Armenia</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Azerbaijan">Azerbaijan</option>
              <option value="Bahamas">Bahamas</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Barbados">Barbados</option>
              <option value="Belarus">Belarus</option>
              <option value="Belgium">Belgium</option>
              <option value="Belize">Belize</option>
              <option value="Benin">Benin</option>
              <option value="Bhutan">Bhutan</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
              <option value="Botswana">Botswana</option>
              <option value="Brazil">Brazil</option>
              <option value="Brunei">Brunei</option>
              <option value="Bulgaria">Bulgaria</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Burundi">Burundi</option>
              <option value="Cabo Verde">Cabo Verde</option>
              <option value="Cambodia">Cambodia</option>
              <option value="Cameroon">Cameroon</option>
              <option value="Canada">Canada</option>
              <option value="Central African Republic">Central African Republic</option>
              <option value="Chad">Chad</option>
              <option value="Chile">Chile</option>
              <option value="China">China</option>
              <option value="Colombia">Colombia</option>
              <option value="Comoros">Comoros</option>
              <option value="Congo">Congo</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Croatia">Croatia</option>
              <option value="Cuba">Cuba</option>
              <option value="Cyprus">Cyprus</option>
              <option value="Czechia">Czechia</option>
              <option value="Denmark">Denmark</option>
              <option value="Djibouti">Djibouti</option>
              <option value="Dominica">Dominica</option>
              <option value="Dominican Republic">Dominican Republic</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Egypt">Egypt</option>
              <option value="El Salvador">El Salvador</option>
              <option value="Equatorial Guinea">Equatorial Guinea</option>
              <option value="Eritrea">Eritrea</option>
              <option value="Estonia">Estonia</option>
              <option value="Eswatini">Eswatini</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Fiji">Fiji</option>
              <option value="Finland">Finland</option>
              <option value="France">France</option>
              <option value="Gabon">Gabon</option>
              <option value="Gambia">Gambia</option>
              <option value="Georgia">Georgia</option>
              <option value="Germany">Germany</option>
              <option value="Ghana">Ghana</option>
              <option value="Greece">Greece</option>
              <option value="Grenada">Grenada</option>
              <option value="Guatemala">Guatemala</option>
              <option value="Guinea">Guinea</option>
              <option value="Guinea-Bissau">Guinea-Bissau</option>
              <option value="Guyana">Guyana</option>
              <option value="Haiti">Haiti</option>
              <option value="Honduras">Honduras</option>
              <option value="Hungary">Hungary</option>
              <option value="Iceland">Iceland</option>
              <option value="India">India</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Iran">Iran</option>
              <option value="Iraq">Iraq</option>
              <option value="Ireland">Ireland</option>
              <option value="Israel">Israel</option>
              <option value="Italy">Italy</option>
              <option value="Jamaica">Jamaica</option>
              <option value="Japan">Japan</option>
              <option value="Jordan">Jordan</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="Kenya">Kenya</option>
              <option value="Kiribati">Kiribati</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Kyrgyzstan">Kyrgyzstan</option>
              <option value="Laos">Laos</option>
              <option value="Latvia">Latvia</option>
              <option value="Lebanon">Lebanon</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Liberia">Liberia</option>
              <option value="Libya">Libya</option>
              <option value="Liechtenstein">Liechtenstein</option>
              <option value="Lithuania">Lithuania</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Madagascar">Madagascar</option>
              <option value="Malawi">Malawi</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Maldives">Maldives</option>
              <option value="Mali">Mali</option>
              <option value="Malta">Malta</option>
              <option value="Marshall Islands">Marshall Islands</option>
              <option value="Mauritania">Mauritania</option>
              <option value="Mauritius">Mauritius</option>
              <option value="Mexico">Mexico</option>
              <option value="Micronesia">Micronesia</option>
              <option value="Moldova">Moldova</option>
              <option value="Monaco">Monaco</option>
              <option value="Mongolia">Mongolia</option>
              <option value="Montenegro">Montenegro</option>
              <option value="Morocco">Morocco</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Myanmar">Myanmar</option>
              <option value="Namibia">Namibia</option>
              <option value="Nauru">Nauru</option>
              <option value="Nepal">Nepal</option>
              <option value="Netherlands">Netherlands</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Nicaragua">Nicaragua</option>
              <option value="Niger">Niger</option>
              <option value="Nigeria">Nigeria</option>
              <option value="North Korea">North Korea</option>
              <option value="North Macedonia">North Macedonia</option>
              <option value="Norway">Norway</option>
              <option value="Oman">Oman</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Palau">Palau</option>
              <option value="Palestine State">Palestine State</option>
              <option value="Panama">Panama</option>
              <option value="Papua New Guinea">Papua New Guinea</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Peru">Peru</option>
              <option value="Philippines">Philippines</option>
              <option value="Poland">Poland</option>
              <option value="Portugal">Portugal</option>
              <option value="Qatar">Qatar</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
              <option value="Saint Lucia">Saint Lucia</option>
              <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
              <option value="Samoa">Samoa</option>
              <option value="San Marino">San Marino</option>
              <option value="Sao Tome and Principe">Sao Tome and Principe</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Senegal">Senegal</option>
              <option value="Serbia">Serbia</option>
              <option value="Seychelles">Seychelles</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="Singapore">Singapore</option>
              <option value="Slovakia">Slovakia</option>
              <option value="Slovenia">Slovenia</option>
              <option value="Solomon Islands">Solomon Islands</option>
              <option value="Somalia">Somalia</option>
              <option value="South Africa">South Africa</option>
              <option value="South Korea">South Korea</option>
              <option value="South Sudan">South Sudan</option>
              <option value="Spain">Spain</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Sudan">Sudan</option>
              <option value="Suriname">Suriname</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Syria">Syria</option>
              <option value="Taiwan">Taiwan</option>
              <option value="Tajikistan">Tajikistan</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Thailand">Thailand</option>
              <option value="Timor-Leste">Timor-Leste</option>
              <option value="Togo">Togo</option>
              <option value="Tonga">Tonga</option>
              <option value="Trinidad and Tobago">Trinidad and Tobago</option>
              <option value="Tunisia">Tunisia</option>
              <option value="Turkey">Turkey</option>
              <option value="Turkmenistan">Turkmenistan</option>
              <option value="Tuvalu">Tuvalu</option>
              <option value="Uganda">Uganda</option>
              <option value="Ukraine">Ukraine</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Uzbekistan">Uzbekistan</option>
              <option value="Vanuatu">Vanuatu</option>
              <option value="Vatican City">Vatican City</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Yemen">Yemen</option>
              <option value="Zambia">Zambia</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>
          </div>

         
      <div className="flex gap-3 w-full flex-col sm:flex-row">
        {country === 'Nigeria' ? (
          <>
            <select name="state" id="cat" className="mb-2 p-3 w-full border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500" value={states} onChange={(e) => setStates(e.target.value)}>
              <option value="">State Located</option>
              {StatesFormControl.map((s) => (
                <option key={s.id} id={s.label} value={s.label}>{s.label}</option>
              ))}
            </select>
            <select name="lga" id="cat" className="mb-2 p-3 w-full border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500" value={lga} onChange={(e) => setLga(e.target.value)}>
              <option value="">Choose Lga</option>
              {lgas?.map((lg) => (
                <option key={lg} id={lg} value={lg}>{lg}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <input type="text" name="state" placeholder="Enter State" className="mb-2 p-3 w-full border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500" value={states} onChange={(e) => setStates(e.target.value)} />
            <input type="text" name="lga" placeholder="Enter LGA" className="mb-2 p-3 w-full border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500" value={lga} onChange={(e) => setLga(e.target.value)} />
          </>
        )}
      </div>
            <textarea
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              required
              name="address"
              id="address"
              rows="3"
              placeholder="Enter Business Address"
            ></textarea>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 w-full">
            <input type="text" placeholder="Your Phone Number" name="phone" className="border border-gray-400 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Business Number" name="whatsapp" className="border border-gray-400 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500" />
          </div>
  
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 w-full">
            <div className='w-full sm:w-1/2'>
              <label htmlFor='opens' className='block text-sm font-medium'>Opening Time</label>
              <input
                type='time'
                id='check_in_time'
                name='opens'
                className='mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div className='w-full sm:w-1/2'>
              <label htmlFor='check_in_time' className='block text-sm font-medium'>Closing Time</label>
              <input
                type='time'
                id='check_in_time'
                name='closes'
                className='mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          </div>
  
          <div className="flex flex-col w-full mt-4">
            <label className="block text-sm font-medium mb-2">Upload your logo here</label>
            <UploadForm files={files} setFiles={setFiles} />
            <input type="hidden" name="user" value={user?._id || ''} />
            <input type="hidden" name="logo" value={logo[0]?.url || ''} />
          </div>
          
          
          <button disabled={pending || loading || !!emailError || !email} type="submit" className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60">
            {pending || loading ? "Creating store..." : "Create Store"}
          </button>
        
       </div>
        </form>
    )
}
export default AddStore