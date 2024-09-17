const bcrypt = require('bcrypt');

const generateHash = async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log(hashedPassword);
};

generateHash();
