$(document).ready(function () {

  // Function to display scraped articles
  function displayScraped() {
    $.get("/articles").then(function (data) {
      console.log("Yes it worked!");
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        $("#articleContainer").append(createNewRow(data[i]));
      };
    }).catch(function (err) {
      console.log(err);
    });
  };

  displayScraped();

  // Scrape Button
  $("#scrapeBTN").on("click", function () {
    // Scraping for articles
    $.get("/scrape").then(function (data) {
      return data;
    }).then(function () {
      // displaying articles on homepage
      $.get("/articles").then(function (data) {
        $('#loadingGif').modal('hide');
        console.log("Yes it worked!");
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          $("#articleContainer").append(createNewRow(data[i]));
        };
      });
    })
      .catch(function (err) {
        console.log(err);
      });
  });

  // Clear Button
  $("#clearBTN").on("click", function () {
    // Drop collection
    console.log("Clicked on Clear Articles!")
    $.post("/clear").then(function (data) {
      console.log(data);
      location.reload();
    })
      .catch(function (err) {
        console.log(err);
      });
  });

  // Funtion to create a row for each article in homepage
  function createNewRow(article) {

    //Setting Up the Card
    let newArticleCard = $("<div>");
    newArticleCard.addClass("card mb-3");
    let newArticleCardHeading = $("<div>");
    newArticleCardHeading.addClass("card-header");
    let newArticleTitle = $("<h5>");
    let newArticleCardBody = $("<div>");
    newArticleCardBody.addClass("card-body");
    let newArticleBody = $("<h6>");

    //Save Button
    let saveBTN = $("<button>");
    saveBTN.attr('class', 'saveBTN');
    // saveBTN.attr('data-dismiss', 'modal');
    saveBTN.attr('data-articleTitle', article.title);
    saveBTN.attr('data-articleSummary', article.summary);
    saveBTN.attr('data-articleLink', article.link);
    saveBTN.text("Save Article");
    saveBTN.addClass("btn btn-success");
    saveBTN.css({
      float: "right",
      "margin-top": "-5px"
    });

    //Adding Into the Card
    newArticleTitle.append("<a href='" + article.link + "' target='_blank'>" + article.title + "</a>");
    newArticleCardHeading.append(saveBTN);
    newArticleCardHeading.append(newArticleTitle);
    newArticleBody.append(article.summary);
    newArticleCardBody.append(newArticleBody);
    newArticleCard.append(newArticleCardHeading);
    newArticleCard.append(newArticleCardBody);

    return newArticleCard;
  };

  // Save Button
  $(document).on("click", "button.saveBTN", function () {
    console.log("Clicked Saved")

    console.log($(this).attr("data-articleTitle"));
    console.log($(this).attr("data-articleSummary"));
    console.log($(this).attr("data-articleLink"));

    $.post("/save", {
      title: $(this).attr("data-articleTitle"),
      summary: $(this).attr("data-articleSummary"),
      link: $(this).attr("data-articleLink")
    })
      .then(function (data) {
        console.log(data);
      }).catch(function (err) {
        console.log(err);
      });

  });

  // Function to display the saved articles
  function displaySaved() {
    $.get("/display_saved").then(function (data) {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        $("#savedArticleContainer").append(createNewRowSaved(data[i]));
      };
    })
      .catch(function (err) {
        console.log(err);
      });
  };

  displaySaved();

  // Funtion to create a row for each saved article in savepage
  function createNewRowSaved(article) {

    // Setting Up the Card
    let newArticleCard = $("<div>");
    newArticleCard.addClass("card mb-3");
    let newArticleCardHeading = $("<div>");
    newArticleCardHeading.addClass("card-header");
    let newArticleTitle = $("<h5>");
    let newArticleCardBody = $("<div>");
    newArticleCardBody.addClass("card-body");
    let newArticleBody = $("<h6>");

    // Save Article Notes Button
    let noteBTN = $("<button>");
    noteBTN.attr('class', 'noteBTN');
    noteBTN.attr('data-toggle', 'modal');
    noteBTN.attr('data-target', '#savedArticleModal');
    noteBTN.attr('data-articleID', article._id);
    noteBTN.text("Article Notes");
    noteBTN.addClass("btn btn-primary mr-2");
    noteBTN.css({
      float: "right",
      "margin-top": "-5px"
    });

    // Delete Article Button
    let deleteBTN = $("<button>");
    deleteBTN.attr('class', 'deleteBTN');
    // deleteBTN.attr('data-dismiss', 'modal');
    deleteBTN.attr('data-articleID', article._id);
    deleteBTN.text("Delete From Saved");
    deleteBTN.addClass("btn btn-danger");
    deleteBTN.css({
      float: "right",
      "margin-top": "-5px"
    });

    //Adding Into the Card
    newArticleTitle.append("<a href='" + article.link + "' target='_blank'>" + article.title + "</a>");
    newArticleCardHeading.append(deleteBTN);
    newArticleCardHeading.append(noteBTN);
    newArticleCardHeading.append(newArticleTitle);
    newArticleBody.append(article.summary);
    newArticleCardBody.append(newArticleBody);
    newArticleCard.append(newArticleCardHeading);
    newArticleCard.append(newArticleCardBody);

    return newArticleCard;
  };

  // Delete Article Button
  $(document).on("click", "button.deleteBTN", function () {
    console.log("Clicked Delete")

    console.log($(this).attr("data-articleID"));

    $.post("/delete", {
      _id: $(this).attr("data-articleID")
    }).then(function (data) {
      console.log("You have deleted the article!!!")
      console.log(data);
      location.reload();
    }).catch(function (err) {
      console.log(err);
    });

  });

  // Article Notes
  $(document).on("click", "button.noteBTN", function () {
    console.log("Clicked Article Notes")
    $("#noteInput").empty();

    let noteID = $(this).attr("data-articleID");
    console.log(noteID);

    $.get("/display_notes/" + noteID)
      .then(function (data) {
        console.log("You have retrieved notes!");
        console.log(data);

        if (data.note) {
          $("#noteDiv").empty();
          $("#noteDiv").append(createNoteRow(data.note));
        }
        else {
          $("#noteDiv").text("No notes for this article yet.");
        };

        $("#saveNoteBTN").attr("data-articleID", noteID);

      }).catch(function (err) {
        console.log(err);
      });

  });

  // Funtion to create a row for each saved note in modal
  function createNoteRow(note) {

    // Setting Up the Card
    let newNoteCard = $("<div>");
    newNoteCard.addClass("card");
    let newNoteCardBody = $("<div>");
    newNoteCardBody.addClass("card-body");
    let newNoteBody = $("<h6>");

    // Delete Notes Button
    let deleteNoteBTN = $("<button>");
    deleteNoteBTN.attr('class', 'deleteNoteBTN');
    deleteNoteBTN.attr('data-dismiss', 'modal');
    deleteNoteBTN.attr('data-noteID', note._id);
    deleteNoteBTN.text("X");
    deleteNoteBTN.addClass("btn btn-danger");
    deleteNoteBTN.css({
      float: "right",
      "margin-top": "-5px"
    });

    //Adding Into the Card
    newNoteCardBody.append(deleteNoteBTN);
    newNoteBody.append(note.note);
    newNoteCardBody.append(newNoteBody);
    newNoteCard.append(newNoteCardBody);

    return newNoteCard;
  };

  // Delete Note Button
  $(document).on("click", "button.deleteNoteBTN", function () {
    console.log("Clicked Delete Note")

    console.log($(this).attr("data-noteID"));

    $.post("/delete_note", {
      _id: $(this).attr("data-noteID")
    }).then(function (data) {
      console.log("You have deleted the note!!!")
      console.log(data);
    }).catch(function (err) {
      console.log(err);
    });

  });

  // Save Notes
  $(document).on("click", "button#saveNoteBTN", function () {
    console.log("Clicked Save Notes")

    console.log($("#noteInput").val());

    $.post("/notes/" + $(this).attr("data-articleID"), {
      note: $("#noteInput").val()
    }).then(function (data) {
      console.log("You have save a note!!")
      console.log(data);
    }).catch(function (err) {
      console.log(err);
    });

  });

});