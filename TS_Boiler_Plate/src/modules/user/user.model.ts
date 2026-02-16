import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface.js';
import { USER_ROLE } from '../../constant/role.constant.js';
import config from '../../config/index.js';



const userSchema = new Schema<IUser, UserModel>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: 0 },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
      index: true,
    },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false, index: true },
    otp: { type: String, select: 0 },
    otpExpires: { type: Date, select: 0 },
  },
  { timestamps: true }
);

// [Performance] Compound index for searchable fields (firstName, lastName, email)
// Note: email is already unique/indexed, but adding it here helps with compound queries
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
userSchema.index({ firstName: 1, lastName: 1 }); // Useful for sorting/filtering by name

// [Security] Hash password before saving
// 2. Fix the Middleware: Use "this: IUser & Document"
userSchema.pre('save', async function (this: IUser & Document) {
  // Check if password is dirty
  if (!this.isModified('password')) {
    return; // Equivalent to next()
  }

  // Hash the password
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds)
  );
  // No need to call next() in async pre-save hooks
});

userSchema.statics.isPasswordMatch = async function (plainText, hashed) {
  return await bcrypt.compare(plainText, hashed);
};

// [Security] Static method for credential verification
userSchema.statics.isPasswordMatch = async function (
  plainText: string,
  hashed: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashed);
};

export const User = model<IUser, UserModel>('Users', userSchema);