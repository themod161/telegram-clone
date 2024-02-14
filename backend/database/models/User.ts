import mongoose, { Schema, Document, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IServerUser } from '../../types/types';

type UserCreate = {
  username: string;
  password: string;
};

interface IUser extends Document {
  username: string;
  password: string;
  token?: string;
  img_url?: string;
  generateAuthToken(): string;
}
interface IUserModel extends Model<IUser> {
  findByCredentials(username: string, password: string): Promise<IUser | null | -1>;
  updateToken(token: string): Promise<IServerUser | null>;
  findUser(id: string): Promise<IServerUser | null>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  img_url: {
    type: String,
  },
  token: {
    type: String
  }
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.TOKEN_SECRET || '');
  this.token = token;
  return token;
};
UserSchema.statics.updateToken = async function(token: string): Promise<IServerUser | null> {
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET || '') as { id: string };

  const user = await this.findById(decoded.id);
  if (!user) {
      return null;
  }

  // Генерация нового токена
  const newToken = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET || '', { expiresIn: '90d' });
  user.token = newToken;
  await user.save();

  return user;
};
UserSchema.statics.findByCredentials = async function(username: string, password: string): Promise<IUser | null | -1> {
  const user = await this.findOne({ username });

  if (!user) {
      return null;
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
      return -1;
  }

  return user;
};
UserSchema.statics.findUser = async function(id: string): Promise<IServerUser | null> {
  return this.findById(id);
};

const UserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);

export { UserModel, UserCreate };