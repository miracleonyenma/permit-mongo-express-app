import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  createdAt: Date;
}

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>("User", UserSchema);

export default User;
