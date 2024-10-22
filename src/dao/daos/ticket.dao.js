import {TicketModel} from "../models/ticket.model.js";

class TicketDAO {
  async createTicket(ticketData) {
    return await TicketModel.create(ticketData);
  }

  async getTicketById(ticketId) {
    return await TicketModel.findById(ticketId);
  }
}

export default new TicketDAO();
