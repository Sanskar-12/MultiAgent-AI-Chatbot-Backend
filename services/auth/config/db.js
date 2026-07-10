import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Auth Service DB connected");
  } catch (error) {
    console.log("Auth Service DB Connection failed ", error);
  }
};

export default connectToDB;
