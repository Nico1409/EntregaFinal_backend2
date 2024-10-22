import mongoose from "mongoose";

export const connectionDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_STRING);
        console.log('BBDD conectada')
    } catch (e) {
        console.log('Error al conectarse a la bbdd');
    }
}
