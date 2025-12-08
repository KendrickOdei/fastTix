import mongoose from 'mongoose';

// Define an async function to handle the database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
            process.exit(1); // Exit process if critical variable is missing
        }

        const conn = await mongoose.connect(mongoUri);

        // Success message showing the host the connection was made to
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Error handling if connection fails
        console.error(`MongoDB Connection Error: ${error}`);
        // Exit process with failure code
        process.exit(1);
    }
};

export default connectDB;