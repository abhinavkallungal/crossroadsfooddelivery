var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId=require('mongodb').ObjectID


module.exports = {
    
    doLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collections.VENDOR_COLLECTIONS)
                .findOne({  Name: vendorData.Name });
            if (user) {
                bcrypt.compare(vendorData.Password, user.Password).then((status) => {
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

    getAllCategorys:()=>{
        return new Promise(async(resolve,reject)=>{
            let Categorys=await db.get().collection(collections.CATEGORY_COLLECTIONS).find().toArray()
            console.log(Categorys)
            resolve(Categorys)

        })
    },


  

};
