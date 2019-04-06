module.exports = function (app) {
    
    //Routes 
    app.get("/", function (req, res) {
        res.render("home");
    });

    app.get("/home", function (req, res) {
        res.render("home");
    });

    app.get("/saved", function (req, res) {
        res.render("saved");
    });

};