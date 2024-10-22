import mongoose ,{ Schema, model } from "mongoose";

const UserSchema = new Schema({
  nombre: String,
  apellido: String,
  email: {
    type: String,
    unique: true,
  },
  edad: Number,
  password: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
  role: {
    type: String,
    default: "user",
  },
});

export const UserModel = model("User", UserSchema);
