
exports.welcome = (req, res) => {

    res.status(200).json({
        'message': "welcome to user apis"
    });
    
}