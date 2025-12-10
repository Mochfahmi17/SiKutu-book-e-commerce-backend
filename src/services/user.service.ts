import User from "../models/user.model";

type registerUserProps = {
  name: string;
  email: string;
  password: string;
};

export const getUserById = async (userId: string) => {
  try {
    const user = await User.findById(userId).select("-password").lean();

    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email });

    return user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (data: registerUserProps) => {
  try {
    const user = await User.create(data);

    return user;
  } catch (error) {
    throw error;
  }
};
