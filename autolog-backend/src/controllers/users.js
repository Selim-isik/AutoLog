import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/user.js';

export const getCustomersController = async (req, res) => {
  const customers = await UsersCollection.find(
    { role: 'customer' },
    '-password',
  );

  res.json({
    status: 200,
    message: 'Customers retrieved successfully!',
    data: customers,
  });
};

export const getCustomerByIdController = async (req, res) => {
  const { id } = req.params;

  const user = await UsersCollection.findById(id, '-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    status: 200,
    message: 'Customer retrieved successfully!',
    data: user,
  });
};

export const updateCustomerStatusController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedUser = await UsersCollection.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    status: 200,
    message: 'Status updated successfully',
    data: updatedUser,
  });
};

export const updateUserController = async (req, res) => {
  const { id } = req.params;
  const { name, email, avatar, password } = req.body;

  const updateData = { name, email, avatar };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await UsersCollection.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    status: 200,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
};

export const deleteCustomerController = async (req, res) => {
  const { id } = req.params;

  const deletedUser = await UsersCollection.findByIdAndDelete(id);

  if (!deletedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    status: 200,
    message: 'Customer deleted successfully',
    data: deletedUser,
  });
};
