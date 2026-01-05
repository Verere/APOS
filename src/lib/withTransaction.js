// Helper to run code inside a MongoDB transaction using Mongoose sessions.
// Usage:
// await withTransaction(async (session) => {
//   // perform mongoose operations with { session }
// })

import mongoose from 'mongoose'
import connectToDB from '@/utils/connectDB'


/**
 * Check if an error is a transient transaction error that can be retried
 */
function isTransientError(error) {
	if (!error) return false
	
	// MongoDB transient error codes
	const transientCodes = [
		112, // WriteConflict
		251, // TransactionExceededLifetimeLimitSeconds
		
	]
	
	// Check for catalog change errors
	const isCatalogError = error.message && (
		error.message.includes('catalog changes') ||
		error.message.includes('please retry')
	)
	
	return (
		error.hasErrorLabel?.('TransientTransactionError') ||
		transientCodes.includes(error.code) ||
		isCatalogError
	)
}

/**
 * Run the provided callback inside a MongoDB transaction session.
 * The callback receives the `session` and should use it on all DB writes.
 * The session is committed on success and aborted on error. Session is
 * always ended. Automatically retries on transient errors.
 * @param {(session: import('mongoose').ClientSession)=>Promise<any>} callback
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 */
export default async function withTransaction(callback, maxRetries = 3){
	// ensure DB connection
	await connectToDB()

	let lastError
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		// Start session from the mongoose connection to ensure same MongoClient
		const session = await mongoose.connection.startSession()
		try{
			session.startTransaction()
			const result = await callback(session)
			await session.commitTransaction()
			return result
		}catch(err){
			try{ await session.abortTransaction() }catch(e){}
			lastError = err
			
			// If this is a transient error and we have retries left, continue loop
			if (isTransientError(err) && attempt < maxRetries) {
				console.log(`Transaction failed with transient error, retrying... (attempt ${attempt + 1}/${maxRetries})`)
				// Wait a bit before retrying (exponential backoff)
				await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, attempt), 1000)))
				continue
			}
			
			// Not a transient error or out of retries
			throw err
		}finally{
			session.endSession()
		}
	}
	
	// Should never reach here, but just in case
	throw lastError
}
