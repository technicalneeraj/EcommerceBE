const bcrypt=require("bcrypt");
const saltRounds = 10;

async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

async function comparePassword(OriginalPassword, hashedPassword) {
    try {
        const match = await bcrypt.compare(OriginalPassword, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error comparing passwords:', error);
    }
}

module.exports={hashPassword,comparePassword}