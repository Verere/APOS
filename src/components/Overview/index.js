'use client'
import { currencyFormat } from '@/utils/currency'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar } from '@radix-ui/themes'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { CalendarIcon } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { GlobalContext } from '@/context'
import { useContext, useEffect, useState } from 'react'
import { MdPending } from "react-icons/md";
import { MdIncompleteCircle, MdOutlineCancel  } from "react-icons/md";
import { FcSalesPerformance } from "react-icons/fc";


const OverviewPage=({slug, order, store, pending, cancelled, completed, products})=>{
const { setStore}= useContext(GlobalContext)
const [pick, setPick] = useState(0)
const [withins, setWithins] = useState(0)
const [del, setDel] = useState(0)
const [total, setTotal]= useState(0)

    useEffect(()=>{
        setStore(store)
    })

    useEffect(()=>{
        const dailyOrder= async()=>{
            const pickup = order.filter(order=>order?.orderOption==='pick up')
            const delivery = order.filter(order=>order?.orderOption==='delivery')
            const within = order.filter(order=>order?.orderOption==='within')
            let countPick= 0
            let countDelivery= 0
            let countWithin= 0
            for(const obj of pickup)countPick++
            setPick(countPick)
            for(const obj of delivery)countDelivery++
            setDel(countDelivery)
            for(const obj of within)countWithin++
            setWithins(countWithin)

            let newCartItems=[]
            newCartItems =  order.map((i) =>
              i.totalAmount)
          
                if(order?.length > 0){
                  const amtTotal = newCartItems.reduce((acc, item) => 
                acc + (item)
                ,0)
          
                  setTotal(amtTotal)
                }else{
                  setTotal(0)
                } 
        }
        dailyOrder()
    })
    return(
        <div className="min-h-screen">
        <div className="flex flex-wrap px-4 gap-5 items-center ">
  

  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center px-2">
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Total Orders</CardTitle>
      <CardDescription> {order.length}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>
          <div className="flex justify-between items-center space-x-4">      
            
            <Card>
     <div className="flex justify-between items-center px-2">
    <FcSalesPerformance className="mr-2 h-4 w-4 opacity-70" />
<CardHeader>
  <CardTitle>total Sales</CardTitle>
  <CardDescription>{currencyFormat(total)}</CardDescription>
</CardHeader>

      </div>
</Card>
      </div>

  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center px-2">
        <MdPending className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Pending Orders</CardTitle>
      <CardDescription> {pending.length}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>
  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center px-2">
        <MdIncompleteCircle className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Completed Orders</CardTitle>
      <CardDescription> {completed.length}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>
  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center px-2">
        <MdOutlineCancel  className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Cancelled Orders</CardTitle>
      <CardDescription> {cancelled.length}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>

  {/* <div className="flex justify-between items-center space-x-4 ">      
            
                <Card>
         <div className="flex justify-between items-center">
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Pick ups
  </CardTitle>
      <CardDescription>{pick}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>
  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center">
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle> Home Deliveries
  </CardTitle>
      <CardDescription>{del}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div>
  <div className="flex justify-between items-center space-x-4">      
            
                <Card>
         <div className="flex justify-between items-center">
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
    <CardHeader>
      <CardTitle>Orders Within
  </CardTitle>
      <CardDescription>{withins}</CardDescription>
    </CardHeader>
  
          </div>
  </Card>
          </div> */}

   
                
  <div className="flex justify-between items-center space-x-4">      
            
            </div>
          </div>
          </div>
             
       
    )
}
export default OverviewPage