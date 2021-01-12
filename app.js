var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var PORT = process.env.PORT || 3200;

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/"));

// routes
app.use("/product", require("./routes/product.route"));
app.use("/user", require("./routes/user.route"));

app.get("**", (req, res) => res.sendStatus(404));

app.listen(PORT, () => console.log("[" + PORT + "] DEPLOYED"));
