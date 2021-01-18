var router = require('express').Router();
var product = require("../controllers/product.controller");

router.get("/search", product.search);
router.get("/supplier/:user_id", product.supplierProducts);
router.get("/:pid", product.findOne);
router.post("", product.create);

module.exports = router;
