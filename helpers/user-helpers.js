var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require('mongodb').ObjectID
const config = require("../config/config");
const client = require("twilio")(config.accountSID, config.authToken);
const Razorpay = require("razorpay")
const crypto = require('crypto');
const { resolve } = require("path");
var instance = new Razorpay({
  key_id: 'rzp_test_GyVJAdzPLcnbjg',
  key_secret: 'L23H9XwK9v1B9XsD9vArpHXm',
});


module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      let Email = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
      if (Email) {
        console.log("if")
        resolve({ status: true });
      } else {
        console.log("else");
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get().collection(collections.USER_COLLECTIONS).insertOne(userData)
          .then((data) => {
            // console.log(data.ops)
            status = false;
            resolve(data.ops[0]);
          });
      }



    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed 1");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed 2");
        resolve({ status: false });
      }
    });
  },
  getUserStatus: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ _id: objectId(userId) })

      if (user.Status === "active") {

        resolve({ UserStatus: "active" })
      } else {

        resolve({ UserStatus: "block" })
      }
    })
  },
  doemailvalidation: (Email) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Email: Email })
      if (user) {
        resolve({ emailavailability: false });
      } else {
        resolve({ emailavailability: true });
      }

    })


  },
  doMobileValidation: (mobile) => {
    console.log(mobile);
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Mobile: mobile })
      if (user) {
        console.log(user);
        resolve({ available: true });
      } else {
        resolve({ available: false });
      }

    })
  },

  doSendOtp: (MobileNumber) => {
    return new Promise(async (resolve, reject) => {
      client.verify
        .services("VA8cd480f75d3e7d3f45949aa50a1f305f")
        .verifications.create({
          to: MobileNumber,
          channel: "sms",
        })
        .then((response) => {
          console.log(response);
          resolve(response)

        });
    })
  },

  doVerifyOtp: (MobileNumber, Otp) => {
    return new Promise(async (resolve, reject) => {

      let response = {};
      let user = await db.get().collection(collections.USER_COLLECTIONS)
        .findOne({ Mobile: MobileNumber });
        console.log(user);
      if (user) {
        client.verify
          .services("VA8cd480f75d3e7d3f45949aa50a1f305f")
          .verificationChecks
          .create({
            to: MobileNumber,
            code: Otp
          }).then((data) => {
            console.log(data.status);
            if (data.status === "approved") {
              console.log("login success");
              response.user = user;
              response.status = true;
              console.log(response.user ,response.status)
              resolve(response);
            } else {
              console.log("login failed 1");
              resolve({ status: false });
            }
          });
      }

    })
  },

  checkCartAvaiable: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      resolve(userCart)
    })
  },

  addToCart: (proId, vendorId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
      vendorId: objectId(vendorId)
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          db
            .get().collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            ).then((response) => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get().collection(collections.CART_COLLECTIONS).insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collections.CART_COLLECTIONS)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;;
      }
      resolve(count);
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },
  getTotelAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collections.CART_COLLECTIONS).aggregate([
        {
          $match: { user: objectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: collections.PRODUCT_COLLECTIONS,
            localField: "item",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            products: { $arrayElemAt: ["$products", 0] },
          }
        },
        {
          $group: {
            _id: null,
            total: 0,
            total: { $sum: { $multiply: ["$quantity", "$products.Price"] } }

          }
        }
      ])
        .toArray();
      console.log(total[0].total);
      resolve(total[0].total);

    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collections.CART_COLLECTIONS)
          .updateOne({ _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } }
            }
          ).then((response) => {
            resolve({ removeProduct: true });
          })
      } else {
        db.get().collection(collections.CART_COLLECTIONS)
          .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
            {
              $inc: { "products.$.quantity": details.count }
            }
          ).then((response) => {

            resolve({ status: true })
          })
      }

    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collections.CART_COLLECTIONS).findOne({ user: objectId(userId) })
      console.log(products);
      resolve({ products })
    })
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
      let orderObj = {

        userId: objectId(order.userId),
        paymentMethod: order['payment-method'],
        products: products.products.products,
        toatlAmount: total,
        date: new Date(),
        status: status,
        deliveryDetails: {
          FirstName: order.firstName,
          LastName: order.lastName,
          Email: order.Email,
          Address: order.Address,
          Address2: order.Address2,
          Zip: order.zip,
          Mobile: order.Mobile

        },

      }
      db.get().collection(collections.ORDER_COLLECTIONS).insertOne(orderObj).then((response) => {
        db.get().collection(collections.CART_COLLECTIONS).removeOne({ user: objectId(order.userId) })
        console.log("order id is =" + response.ops[0]._id);
        resolve(response.ops[0]._id)
      })
    })

  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collections.ORDER_COLLECTIONS)
        .find({ userId: objectId(userId) }).toArray()
      console.log(orders);
      resolve(orders);
    })
  },
  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collections.ORDER_COLLECTIONS)
        .find({ _id: objectId(orderId) }).toArray()
      console.log(order);
      resolve(order);
    })
  },
  getOrderProduct: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collections.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log(orderItems);
      resolve(orderItems);
    });
  },
  generateRazorpay:(orderId,totalPrice) =>{
    return new Promise((resolve,reject)=>{
      var options = {
        amount: totalPrice*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt:""+orderId
      };
      instance.orders.create(options, function(err, order) {
        console.log("new order",order);
        resolve(order)
      });
    })

  },
  verifyRazorpay:(details)=>{
    return new Promise((resolve,reject)=>{
      let hmac = crypto.createHmac('sha256', "L23H9XwK9v1B9XsD9vArpHXm")
      hmac.update(details['Payment[razorpay_order_id]']+'|'+details['Payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac=== details['Payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    })

  },
  changePayementStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collections.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},
      {
        $set:{
          status:'placed'
        }
      }
      ).then(()=>{
        resolve()
      })
    })
  }

};








