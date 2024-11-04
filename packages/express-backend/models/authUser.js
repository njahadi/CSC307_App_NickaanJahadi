import mongoose from "mongoose";

const authUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    }
  },
  { collection: "auth_users" }
);

const AuthUser = mongoose.model("AuthUser", authUserSchema);

export default AuthUser;
