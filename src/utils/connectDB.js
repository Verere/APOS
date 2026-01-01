import mongoose from "mongoose";


// const configOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,

// };

const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState===0 ){
    await mongoose.connect(process.env.MONGODB_URL, {});
console.log('connected')
    }
  } catch (error) {
    console.log(`error from db connection ${error.message}`);    
};
}
export default connectToDB;

