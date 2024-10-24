const bcrypt = require("bcrypt");

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; 
  }
}

async function comparePassword(originalPassword, hashedPassword) {
  try {
    const match = await bcrypt.compare(originalPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
}

module.exports = { hashPassword, comparePassword };
