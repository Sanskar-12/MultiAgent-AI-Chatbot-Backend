import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Chat Service DB connected");
  } catch (error) {
    console.log("Chat Service DB Connection failed ", error);
  }
};

export default connectToDB;
