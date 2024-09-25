const bcrypt = require("bcrypt");
const adminModel = require("./models/adminModel");


const updatePassword = async () => {


  

  try {
    const plainPassword = "admin1"; 
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);


    await adminModel.findOneAndUpdate(
      { email: "admin@example.com" }, 
      { password: hashedPassword }
    );

    console.log("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error.message);
  }
};

 
updatePassword();
