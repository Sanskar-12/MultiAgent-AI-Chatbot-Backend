import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Agent Service DB connected");
  } catch (error) {
    console.log("Agent Service DB Connection failed ", error);
  }
};

export default connectToDB;
