var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require('mongodb').ObjectID


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
         
            let email = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
            if (email){
                console.log("if")
                resolve({ status: true });
           }else{
               console.log("else");
                userData.password = await bcrypt.hash(userData.password, 10);
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
            let user = await db
                .get()
                .collection(collections.USER_COLLECTIONS)
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
    doemailvalidation:(email) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTIONS)
                .findOne({ Email: userData.Email })
            if (user) {
                resolve({ emailavailability: false });
            } else {
                resolve({ emailavailability: true });
            }

        })
       

    }






};






