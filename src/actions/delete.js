"use server";
import {redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
import Store from "@/models/store"
import Menu from "@/models/menu"
import Location from "@/models/location"
import MenuCategory from "@/models/menuCategory"
import MenuStock from "@/models/menuStock"
import Group from "@/models/group"
// import Product from "@/models/product"

import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { hash } from "bcryptjs";
import User  from '@/models/user';