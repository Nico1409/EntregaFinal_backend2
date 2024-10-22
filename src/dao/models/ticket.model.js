import { Schema, model } from 'mongoose';

const TicketSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return Math.random().toString(36).substr(2, 9); 
    }
  },
  purchase_datetime: {
    type: Date,
    default: Date.now  
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true  
  }
});


export const TicketModel = model("Ticket", TicketSchema);
