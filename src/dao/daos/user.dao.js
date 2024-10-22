import {UserModel} from "../models/user.model.js";

class UserDAO {
  async findByEmail(email) {
    return await UserModel.findOne({email});
  }

  async createUser(user) {
    return await UserModel.create(user);
  }
}

export default new UserDAO();
