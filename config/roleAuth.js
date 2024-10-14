const Category = require("../models/category.model");

const rolesPermissions = {
    admin: {
      products: { get: true, post: true, put: true, delete: true },
      Category: { get: true, post: true, put: true, delete: true },
    },
    customer: {
      products: { get: true, post: false, put: false, delete: false },
      Category: { get: true, post: false, put: false, delete: false },
    }
};


module.exports=rolesPermissions;
