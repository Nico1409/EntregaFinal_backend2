import mongoose ,{ Schema ,model} from "mongoose";


const CartSchema = new Schema({
    products: {
        type: [{
            quantity: {
                type: Number
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        }],
        default: []
    },
});

export const CartModel = model('carts', CartSchema)