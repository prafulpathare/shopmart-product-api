var config = require("../config");
var mongoClient = require('mongodb').MongoClient;

exports.create = (req, res) => {
    mongoClient.connect(config.MONGO_URI, { useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        db.db("shopmart").collection("products").insertOne(req.body, function (err, result) {
            if (err) throw err;
            db.close();
            res.status(200).json({
                product: result
            });
        });
    });
}

exports.search = (req, res) => {
    mongoClient.connect(config.MONGO_URI, { useUnifiedTopology: true }, function (err, db) {
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
            })
        db.db("shopmart").collection("products")
            .find(query, { name: 1, company: 0, price: 1, imgurl: 0 })
            .sort(sort).skip(page * limit).limit(limit)
            .toArray(function (err, result) {
                if (err) throw err;
                db.close();
                res.status(200).json({
                    // products: random.shuffle(result),
                    products: result,
                    q: req.query.q,
                    size: result.length,
                    page: page,
                    totalPages: Math.floor(totalRecordsFound / limit),
                    sort: req.query.sort,
                    total: totalRecordsFound,
                    isLast: (Math.floor(totalRecordsFound / limit) == page) ? true : false,
                    isFirst: (page == 0) ? true : false,
                });
            });
    });
}

exports.findOne = (req, res) => {
    var pid = req.params.pid && (req.params.pid !== "") ? req.params.pid : "5f3150f234026d4ff8866aa6";
    mongoClient.connect(config.MONGO_URI, { useUnifiedTopology: true }, function (err, db) {
        db.db("shopmart").collection("products").findOne({ _id: require('mongodb').ObjectId(pid) }, function (err, result) {
            db.close();
            res.status(200).json({
                product: result
            });
        });
    });
}




