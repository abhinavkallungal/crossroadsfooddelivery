var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");


module.exports = {
    doSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10);
            db.get().collection(collections.ADMIN_COLLECTIONS).insertOne(adminData)
                .then((data) => {
                    console.log(data.ops)
                    resolve(data.ops);
                });
        });
    },
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collections.ADMIN_COLLECTIONS)
                .findOne({ Email: adminData.Email });
            if (user) {
                bcrypt.compare(adminData.Password, user.Password).then((status) => {
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
    }

};
