var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var PORT = process.env.PORT || 3200;
var MongoClient = require('mongodb').MongoClient;
var fileUpload = require('express-fileupload');

var random = require('./utils/random');
// var mongoURI = "mongodb+srv://praful:imking98@shopmartcluster.rvilr.mongodb.net/shopmart?retryWrites=true&w=majority";
var mongoURI = "mongodb://localhost:27017/"; // system mongo
// var mongoURI = "mongodb://localhost:27018/"; // docker mongo_pod

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static(__dirname + "/"));


// upload images
app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0 || !req.body.uid || Object.keys(req.body.uid).length === 0 || req.files.sampleFile.name.split('.').length !== 2) {
    return res.status(400).send('invalid inputs.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(__dirname+'/public/profiles/'+req.body.uid+'_'+Date.now()+'.'+req.files.sampleFile.name.split('.')[1], function(err) {
    if (err)
      return res.status(500).send(err);

	res.status(200).json({
		'success': true,
		'message': "File uploaded"
	});
  });
});



app.get("/products", function (req, res) {
   MongoClient.connect(mongoURI, { useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var page = req.query.page ? parseInt(req.query.page) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 8;
        var query = req.query.q && (req.query.q !== "") ? { name: { '$regex': req.query.q, '$options': 'i' } } : {};
        var sort;
        if (req.query.sort) {
            switch (req.query.sort) {
                case "priceAsc": sort = { price: 1 }; break;
                case "priceDesc": sort = { price: -1 }; break;
                case "views": sort = { views: -1 }; break;
                default: sort = { views: -1 }; break;
            }
        } else sort = { views: -1 };
        var totalRecordsFound = 0;
        db.db("shopmart").collection("products")
            .countDocuments(query, function (err, no_of_rec) {
                totalRecordsFound = no_of_rec; 
            } )
        db.db("shopmart").collection("products")
            .find(query, { name: 1, company: 0, price: 1, imgurl: 0  })
            .sort(sort).skip(page*limit).limit(limit)
            .toArray(function (err, result) {
                if (err) throw err;
                db.close();
                res.status(200).json({
                    // products: random.shuffle(result),
                    products: result,
                    q: req.query.q,
                    size: result.length,
                    page: page,
                    totalPages: Math.floor(totalRecordsFound/limit),
                    sort: req.query.sort,
                    total: totalRecordsFound,
                    isLast: (Math.floor(totalRecordsFound/limit) == page) ? true : false,
                    isFirst: (page == 0) ? true : false,                
                });
            });
    });
});

// get product by ID
app.get("/product", function (req, res) {
    var pid = req.query.pid && (req.query.pid !== "") ? req.query.pid : "5f3150f234026d4ff8866aa6";
    MongoClient.connect(mongoURI, { useUnifiedTopology: true }, function (err, db) {
        // if (err) throw err;
        db.db("shopmart").collection("products").findOne({ _id: require('mongodb').ObjectId(pid) }, function (err, result) {
            // if (err) throw err;
            db.close();
            res.status(200).json({
                product: result
            });
        });
    });
});

// add product
app.post("/products/add", function (req, res) {
    MongoClient.connect(mongoURI, { useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        db.db("shopmart").collection("products").insertOne(req.body, function (err, addedProduct) {
            if (err) throw err;
            db.close();
            res.status(200).json({
                product: addedProduct
            });
        });
    });
});

app.get("/", function (req, res) {
    res.json({
        endpoints: [
            { "query products by name": "/products?q=iphone" },
            { "access product by ID": "/product?pid=5f31562b19049f8091d08dd4" }
        ]
    });
});

app.listen(PORT, function () {
    console.log("[" + PORT + "] DEPLOYED");
});
