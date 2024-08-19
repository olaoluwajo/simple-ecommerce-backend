const jwt =require('jsonwebtoken')

module.exports.createToken = async(data) => {
  const token = await jwt.sign(data, process.env.SECRET, {
    expiresIn: "7d", // token expires in 1 day
  });
  return token;
}