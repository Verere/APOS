import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import User from '@/models/user'
import Store from '@/models/store'

const SECRET = process.env.NEXTAUTH_SECRET

// Read token from incoming request (route handlers)
export async function getTokenFromRequest(req){
  return await getToken({ req, secret: SECRET })
}

// Read token from server-side cookies (server actions / server components)
export async function getTokenFromCookies(){
  try{
    const cookieStore = await cookies()
    const all = cookieStore.getAll()
    const names = all.map(c => c.name).join(', ')
    try{ console.debug('auth cookies available:', names) }catch(e){}

    const preferred = all.find(c => c.name === 'next-auth.session-token') || all.find(c => c.name === '__Secure-next-auth.session-token')
    const cookieHeader = preferred ? `${preferred.name}=${preferred.value}` : all.map(c => `${c.name}=${c.value}`).join('; ')
    try{ console.debug('auth cookieHeader (truncated):', cookieHeader ? cookieHeader.slice(0,200) : '') }catch(e){}

    return await getToken({ req: { headers: { cookie: cookieHeader } }, secret: SECRET })
  }catch(e){
    console.error('getTokenFromCookies error:', e)
    return null
  }
}

// Attempt to retrieve a NextAuth token from several locations:
// 1. If a request object is provided, try getToken({ req })
// 2. Try cookies() (server actions / components)
// 3. If a request is provided, try the Authorization header
export async function getTokenAuto(req){
  // 1) try request
  if(req){
    try{
      const t = await getToken({ req, secret: SECRET })
      if(t) return t
    }catch(e){}
  }

  // 2) try cookies
  try{
    const cookieStore = await cookies()
    const all = cookieStore.getAll()
    const names = all.map(c => c.name).join(', ')
    try{ console.debug('getTokenAuto - cookies available:', names) }catch(e){}

    const preferred = all.find(c => c.name === 'next-auth.session-token') || all.find(c => c.name === '__Secure-next-auth.session-token')
    const cookieHeader = preferred ? `${preferred.name}=${preferred.value}` : all.map(c => `${c.name}=${c.value}`).join('; ')
    try{ console.debug('getTokenAuto - cookieHeader (truncated):', cookieHeader ? cookieHeader.slice(0,200) : '') }catch(e){}

    if(cookieHeader){
      try{
        const t2 = await getToken({ req: { headers: { cookie: cookieHeader } }, secret: SECRET })
        if(t2) return t2
      }catch(e){
        console.error('getTokenAuto - getToken from cookies failed:', e)
      }
    }
  }catch(e){}

  // 3) if req provided, try Authorization header
  if(req){
    try{
      const auth = (req.headers && (req.headers.get ? req.headers.get('authorization') : req.headers.authorization)) || null
      if(auth && auth.startsWith('Bearer ')){
        try{
          const t3 = await getToken({ req: { headers: { authorization: auth } }, secret: SECRET })
          if(t3) return t3
        }catch(e){}
      }
    }catch(e){}
  }

  return null
}

// Lookup user document and determine privilege relative to a slug
export async function authorizeBySlugOrRole(email, slug){
  if(!email) return { ok:false }
  const user = await User.findOne({ email }).lean()
  const isPrivileged = user && (user.isAdmin === true || user.root === true || ['admin','manager'].includes(user.role))
  if(isPrivileged) return { ok:true, user }
  if(!slug) return { ok:false }
  const owner = await Store.findOne({ slug, user: email }).lean()
  if(owner) return { ok:true, user: owner }
  return { ok:false }
}

export default {
  getTokenFromRequest,
  getTokenFromCookies,
  getTokenAuto,
  authorizeBySlugOrRole
}
