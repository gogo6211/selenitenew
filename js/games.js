// ===============================
// A few users were having random errors so i had ai make my life easier and add better error loging.
// ===============================

// Global variable to capture errors
let errorLogs = [];

// Override console.error to capture error messages
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(" ");
  errorLogs.push(message);
  originalConsoleError.apply(console, args);
};

// Capture uncaught errors (modern browsers support this event)
window.addEventListener("error", function(event) {
  const errorMessage = `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
  errorLogs.push(errorMessage);
});

// ===============================
// Fetch and load games
// ===============================

$.getJSON("/games.json", function (data) {
  if (document.readyState === "complete") {
    loadGames(data);
  } else {
    let areGamesReady = setInterval(() => {
      if (document.readyState === "complete") {
        loadGames(data);
        clearInterval(areGamesReady);
      }
    }, 50);
  }
})
.fail(function(jqxhr, textStatus, error) {
  console.error("Error fetching games.json:", textStatus, error);
  // Optionally display an inline message immediately if the JSON fails to load:
  $("#games").append('<div style="color:red; margin-top:10px;">Error: Unable to load games list.</div>');
});

// ===============================
// Load games into the page
// ===============================
function loadGames(data) {
  // Log the start of the game loading process
  console.log("Loading games data...", data);

  // Try to get the "starred" games; add error handling here too
  let starredgames = getCookie("starred");
  if (starredgames === "") {
    starredgames = [];
  } else {
    try {
      starredgames = JSON.parse(starredgames);
    } catch (e) {
      console.error("Error parsing starred games cookie:", e);
      starredgames = [];
    }
  }

  $("#gamesearch").prop({
    placeholder: "Click here to search through our " + data.length + " games!",
  });

  // Sort games; log error if something unexpected is found.
  try {
    data.sort(dynamicSort("name"));
  } catch (e) {
    console.error("Error sorting games data:", e);
  }

  // Save globally for use in other functions
  gamelist = data;

  // Iterate through data and create game elements
  for (let i = 0; i < data.length; i++) {
    let game = data[i];

    if (!game.directory || !game.image || !game.name) {
      console.error("Game data missing required fields:", game);
      continue; // Skip invalid game data
    }

    let $element = $("<div>")
      .attr({
        class: "game",
        id: game.directory,
        recommended: game.recommended,
      })
      .data("recommended", game.recommended)
      .append(
        $("<img>").prop({
          src: game.directory + "/" + game.image,
          alt: game.name + " logo",
        })
      )
      .append($("<h1>").text(game.name))
      .append(
        $("<img>").prop({
          src: "img/star.svg",
          alt: "star",
          class: "star",
        })
      );

    if (starredgames.includes(game.directory)) {
      $element.find("img.star").attr("id", "starred");
      $element.find("img.star").attr("src", "img/star-fill.svg");
      let $pinnedelement = $element.clone();
      $("#pinned").append($pinnedelement);
      if ($("#pinnedmessage").length) {
        $("#pinnedmessage").hide();
      }
    }

    $("#games").append($element);
  }

  // Remove the loading placeholder
  $("#games #message").remove();

  // Handle search filtering
  if ((search = 1)) {  // consider revisiting this logic if search is expected to be a condition
    var txt = $("#gamesearch").val();
    if (txt === "") {
      $("#games .suggest").show();
    } else {
      $("#games .suggest").hide();
    }
    $("#games .game").hide();
    $("#games .game").each(function () {
      if (
        $(this).text().toUpperCase().indexOf(txt.toUpperCase()) !== -1 ||
        $(this).attr("id").toUpperCase().indexOf(txt.toUpperCase()) !== -1
      ) {
        $(this).show();
      }
    });
  }

  // Set up click handlers for starred games and game redirection
  setupGameClickHandlers();
  console.log("Games loaded successfully.");
}

// ===============================
// Click handlers for game elements
// ===============================
function setupGameClickHandlers() {
  $(document).on("click", ".game", function (event) {
    // Determine if the star image was clicked
    if ($(event.target).is("img.star")) {
      if (!$(event.target).attr("id")) {
        $(event.target).prop({ id: "starred" });
        $(event.target).prop({ src: "img/star-fill.svg" });
        let starred = Cookies.get("starred");
        if (starred) {
          try {
            starred = JSON.parse(starred);
          } catch (e) {
            console.error("Error parsing starred cookie during click:", e);
            starred = [];
          }
        } else {
          starred = [];
        }
        starred.push($(this).attr("id"));
        Cookies.set("starred", JSON.stringify(starred));
        let $element = $(this).clone();
        $("#pinned").append($element);
        $("#pinnedmessage").hide();
        // Re-sort pinned games for consistency
        let temp = $("#pinned")[0].childNodes;
        let pinnedarray = [...temp];
        pinnedarray.sort(dynamicSort("id"));
        $("#pinned").empty();
        for (let i = 0; i < pinnedarray.length; i++) {
          let pinnedarraynodes = pinnedarray[i].childNodes;
          pinnedarraynodes = [...pinnedarraynodes];
          let $newElement = $("<div>")
            .prop({
              class: "game",
              id: pinnedarray[i].id,
            })
            .append(
              $("<img>").prop({
                src: pinnedarraynodes[0].src,
                alt: pinnedarraynodes[0].alt,
                class: "gameicon",
              })
            )
            .append($("<h1>").text(pinnedarraynodes[1].innerHTML))
            .append(
              $("<img>").prop({
                src: "img/star-fill.svg",
                alt: "star",
                class: "star",
                id: "starred",
              })
            );
          $("#pinned").append($newElement);
        }
      } else {
        // If already starred: unstar it
        $(event.target).removeAttr("id");
        $(event.target).attr("src", "img/star.svg");
        let thisDiv = "#" + $(this).attr("id");
        thisDiv = thisDiv.replace(".", "\\.");
        let starred = Cookies.get("starred");
        try {
          starred = JSON.parse(starred);
        } catch (e) {
          console.error("Error parsing starred cookie for unstar:", e);
          starred = [];
        }
        let ourindex = starred.indexOf($(this).attr("id"));
        if (ourindex > -1) {
          starred.splice(ourindex, 1);
        }
        Cookies.set("starred", JSON.stringify(starred));
        $("#pinned " + thisDiv).remove();
        if ($("#pinned").is(":empty")) {
          $("#pinnedmessage").show();
        }
        $($thisdiv + " #starred").attr("src", "img/star.svg");
        $($thisdiv + " #starred").removeAttr("id");
      }
    } else {
      // If clicking the game but not on the star, redirect
      redirectGame($(this).attr("id"));
    }
  });
  $(document).on("click", "#game img .star", function (event) {
    $(this).prop({ class: "material-symbols-outlined fill" });
  });
}

// ===============================
// Redirect to game
// ===============================
function redirectGame(dir) {
  if (!dir) {
    console.error("No directory specified for redirection.");
    return;
  }
  window.location.href = window.location.origin + "/" + dir + "/index.html";
}

// ===============================
// Sorting helper
// ===============================
function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    if (!a[property] || !b[property]) {
      console.error("Missing property when sorting:", property, a, b);
      return 0;
    }
    if (sortOrder === -1) {
      return b[property].localeCompare(a[property]);
    } else {
      return a[property].localeCompare(b[property]);
    }
  };
}

// ===============================
// Random game selection
// ===============================
function selectRandomGame() {
  if (!gamelist || !gamelist.length) {
    console.error("Cannot select random game; 'gamelist' is empty or undefined.");
    return;
  }
  let index = Math.floor(Math.random() * gamelist.length);
  redirectGame(gamelist[index].directory);
}

// ===============================
// Recommended games toggle
// ===============================
let viewrecommended = 0;
function recommendedGames() {
  if (viewrecommended === 0) {
    $("#games .game").hide();
    $("#games .game").each(function () {
      if ($(this).attr("recommended")) {
        $(this).show();
      }
    });
    $("#recommend").text("Click to view all games again!");
    viewrecommended = 1;
  } else {
    $("#games .game").show();
    viewrecommended = 0;
    $("#recommend").text("Click to view recommended games!");
  }
}

// ===============================
// Fallback UI: Display error logger if games never load
// ===============================

// After 1 second, check if games loaded by seeing if the placeholder (with id "message") still exists.
setTimeout(() => {
  if ($("#message").length) {
    // Inject an error reporting UI block below the current #games container.
    $("#games").append(`
      <div id="errorReport" style="margin-top:20px; padding: 10px; border: 1px solid red;">
        <p style="font-weight:bold; color:red;">Games not loading?</p>
        <a href="/suggest.html" style="color: blue; text-decoration: underline;">Make a bug report</a>
        <pre id="consoleLogs" style="max-height:150px; overflow-y:auto; background:#eee; color:#333; padding:10px; margin-top:10px;">${errorLogs.join("\n")}</pre>
        <button id="copyLogs" style="margin-top:10px; padding:5px 10px;">Copy</button>
      </div>
    `);
    // Setup copy button
    $("#copyLogs").on("click", function(){
      const text = errorLogs.join("\n");
      navigator.clipboard.writeText(text).then(() => {
        alert("Error logs copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy error logs:", err);
      });
    });
  }
}, 1000);
