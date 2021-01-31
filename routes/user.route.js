var router = require("express").Router();
var user = require("../controllers/user.controller");

router.get("", user.welcome);

module.exports = router;