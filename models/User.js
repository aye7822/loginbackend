const mongoose = require('mongoose');
const bcrypt =require('bcrypt')

// Define the schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },  // Added `unique`
  password: { type: String, required: true }
});
//before saving data you have encrypt the password 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});



// Create the model
const User = mongoose.model('User', userSchema);  // Capitalize model name

// Export the model
module.exports = User;
