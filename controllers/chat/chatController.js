const sellerModel = require("../../models/sellerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const { responseReturn } = require("../../utils/response");

// ALL COMMENTS HERE IS A REFERENCE TO THE FOLLOWING CODE>>> I NEED THEM

class chatController {
  // Method to add a seller to the customer's friends list, and vice versa
  add_customer_friend = async (req, res) => {
    // Extract sellerId and userId (customerId) from the request body
    const { sellerId, userId } = req.body;

    try {
      // If sellerId is provided (i.e., the user is adding a seller as a friend)
      // Fetch the seller's details using their ID
      // Fetch the customer's details using their ID
      if (sellerId !== "") {
        const seller = await sellerModel.findById(sellerId);
        const user = await customerModel.findById(userId);

        // Check if the seller is already in the customer's friend list
        const checkSeller = await sellerCustomerModel.findOne({
          $and: [
            { myId: { $eq: userId } }, // Check if the customer is the owner of this friends list
            {
              myFriends: {
                $elemMatch: { fdId: sellerId }, // Check if the seller is already a friend
              },
            },
          ],
        });

        // If the seller is not in the customer's friends list, add them
        if (!checkSeller) {
          await sellerCustomerModel.updateOne(
            { myId: userId }, // Update the customer's friends list
            {
              $push: {
                myFriends: {
                  // Seller's
                  fdId: sellerId,
                  name: seller.shopInfo?.shopName,
                  image: seller.image,
                },
              },
            }
          );
        }

        // Check if the customer is already in the seller's friends list
        const checkCustomer = await sellerCustomerModel.findOne({
          $and: [
            // Check if the seller is the owner of this friends list
            { myId: { $eq: sellerId } },
            {
              myFriends: {
                // Check if the customer is already a friend
                $elemMatch: { fdId: userId },
              },
            },
          ],
        });

        // If the customer is not in the seller's friends list, add them
        if (!checkCustomer) {
          await sellerCustomerModel.updateOne(
            // Update the seller's friends list
            { myId: sellerId },
            {
              $push: {
                myFriends: {
                  fdId: userId, // Customer's ID
                  name: user.name, // Customer's name
                  image: "", // No image for the customer (could be added later)
                },
              },
            }
          );
        }

        // Fetch chat messages between the seller and customer
        const messages = await sellerCustomerMessage.find({
          $or: [
            {
              $and: [
                { receverId: { $eq: sellerId } }, // Messages where the seller is the receiver
                { senderId: { $eq: userId } }, // and the customer is the sender
              ],
            },
            {
              $and: [
                { receverId: { $eq: userId } }, // Messages where the customer is the receiver
                { senderId: { $eq: sellerId } }, // and the seller is the sender
              ],
            },
          ],
        });

        // Fetch the customer's entire friends list
        const MyFriends = await sellerCustomerModel.findOne({
          myId: userId, // Get the list where the customer is the owner
        });

        // Find the specific friend (the seller) in the customer's friends list
        const currentFd = MyFriends.myFriends.find((s) => s.fdId === sellerId);

        // Send a response containing the customer's friends list, the current friend (seller), and their chat messages
        responseReturn(res, 200, {
          MyFriends: MyFriends.myFriends,
          currentFd,
          messages,
        });
      } else {
        // If no sellerId is provided (i.e., just fetch the customer's friends list)
        const MyFriends = await sellerCustomerModel.findOne({
          myId: userId,
        });

        // Send a response with just the friends list
        responseReturn(res, 200, {
          MyFriends: MyFriends.myFriends,
        });
      }
    } catch (error) {
      // Log any errors that occur during the process
      console.log(error);
    }
  };

  // END METHod

  customer_message_add = async (req, res) => {
    // console.log(req.body);
    // Extract necessary details from the request body
    const { userId, text, sellerId, name } = req.body;

    try {
      // 1. Add the new message to the database
      const message = await sellerCustomerMessage.create({
        senderId: userId,
        senderName: name,
        receverId: sellerId,
        message: text,
      });

      // 2. Reorder the friends list of the customer (userId) to put the seller at the top

      // Fetch the customer's friends list (where the customer is the owner)
      const data = await sellerCustomerModel.findOne({ myId: userId });
      let myFriends = data.myFriends; // Get the array of friends

      // Find the index of the seller in the customer's friends list
      let index = myFriends.findIndex((f) => f.fdId === sellerId);

      // Move the seller to the top of the list by swapping positions
      while (index > 0) {
        let temp = myFriends[index]; // Temporarily hold the current friend (seller)
        myFriends[index] = myFriends[index - 1]; // Swap positions with the previous friend
        myFriends[index - 1] = temp; // Move the seller up in the list
        index--; // Continue until the seller reaches the top
      }

      // Update the customer's friends list in the database with the reordered list

      // Find the record where the customer is the owner
      // Update the friends list with the reordered array
      await sellerCustomerModel.updateOne({ myId: userId }, { myFriends });

      // 3. Reorder the friends list of the seller (sellerId) to put the customer at the top
      // Fetch the seller's friends list (where the seller is the owner)
      // Get the seller's friends list
      const data1 = await sellerCustomerModel.findOne({ myId: sellerId });
      let myFriends1 = data1.myFriends;

      // Find the index of the customer in the seller's friends list
      let index1 = myFriends1.findIndex((f) => f.fdId === userId);

      // Move the customer to the top of the list by swapping positions
      while (index1 > 0) {
        // Temporarily hold the current friend (customer)
        let temp1 = myFriends1[index1];
        // Swap positions with the previous friend
        myFriends1[index1] = myFriends[index1 - 1];
        // Move the customer up in the list
        myFriends1[index1 - 1] = temp1;
        // Continue until the customer reaches the top
        index1--;
      }

      // Update the seller's friends list in the database with the reordered list
      await sellerCustomerModel.updateOne(
        // Find the record where the seller is the owner
        // Update the friends list with the reordered array
        { myId: sellerId },
        { myFriends1 }
      );

      // 4. Send a response with the newly added message
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error);
    }
  };
  // End Method

  get_customers = async (req, res) => {
    // console.log(req.params)
    const { sellerId } = req.params;
    try {
      const data = await sellerCustomerModel.findOne({ myId: sellerId });
      responseReturn(res, 200, {
        customers: data.myFriends,
      });
    } catch (error) {
      console.log(error);
    }
  };
  // End Method

  get_customers_seller_message = async (req, res) => {
    console.log(req.params);
    const { id } = req;
    console.log(id);
  };
  // End Method
}

module.exports = new chatController();
