// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
let axios = require("axios");
let cheerio = require("cheerio");

// Require all models
let db = require("../models");

// Routes
module.exports = function (app) {

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.nytimes.com/section/food").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            let $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("div.story-body").each(function (i, element) {
                // Save an empty result object
                let result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .find("h2.headline")
                    .text();
                result.summary = $(this)
                    .find("p.summary")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });

            // If we were able to successfully scrape and save an Article, send a message to the client
            console.log("Scrape Complete");
            res.send(result);
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
            .then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Dropping Collection
    app.post("/clear", function (req, res) {
        db.Article.deleteMany({})
            .then(function (data) {
                console.log("You have dropped the collection!");
                res.send(data);
            })
            .catch(function (err) {
                return res.json(err);
            })
    });

    // Creating an entry in the Saved Articles Collection
    app.post("/save", function (req, res) {
        console.log(req.body);
        db.SavedArticle.create(req.body)
            .then(function (dbSavedArticle) {
                // View the added result in the console
                console.log("You created the saved article collection");
                console.log(dbSavedArticle);
                res.json(dbSavedArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                return res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for getting all saved articles from the db
    app.get("/display_saved", function (req, res) {
        // Grab every document in the Articles collection
        db.SavedArticle.find({})
            .then(function (dbSavedArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbSavedArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for deleting saved articles from the db
    app.post("/delete", function (req, res) {
        // Grab every document in the Articles collection
        db.SavedArticle.deleteOne({ _id: req.body })
            .then(function (dbSavedArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbSavedArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for displaying notes
    app.get("/display_notes/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.SavedArticle.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            .then(function (dbSavedArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbSavedArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for deleting saved notes from the db
    app.post("/delete_note", function (req, res) {
        // Grab every document in the Articles collection
        db.Note.deleteOne({ _id: req.body })
            .then(function (dbNote) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbNote);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saveing notes
    app.post("/notes/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.SavedArticle.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (dbSavedArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbSavedArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
};