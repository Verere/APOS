// Helper to run code inside a MongoDB transaction using Mongoose sessions.
// Usage:
// await withTransaction(async (session) => {
//   // perform mongoose operations with { session }
// })

import mongoose from 'mongoose'
import connectToDB from '@/utils/connectDB'


/**
 * Run the provided callback inside a MongoDB transaction session.
 * The callback receives the `session` and should use it on all DB writes.
 * The session is committed on success and aborted on error. Session is
 * always ended.
 * @param {(session: import('mongoose').ClientSession)=>Promise<any>} callback
 */
export default async function withTransaction(callback){
	// ensure DB connection
	await connectToDB()

	const session = await mongoose.startSession()
	try{
		session.startTransaction()
		const result = await callback(session)
		await session.commitTransaction()
		return result
	}catch(err){
		try{ await session.abortTransaction() }catch(e){}
		throw err
	}finally{
		session.endSession()
	}
}
