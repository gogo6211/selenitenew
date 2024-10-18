$(document).ready(function() {
    $.getJSON("/quotes.json", function(data) {
        // Select a random quote from the JSON array
        let randomQuote = data[Math.floor(Math.random() * data.length)];
        
        // Update the content of the HTML element with the random quote
        $('#randomquote').html(randomQuote);
    }).fail(function() {
        console.error("Error loading the quotes.json file.");
    });
});
