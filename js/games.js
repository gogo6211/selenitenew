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
});

function loadGames(data) {
	let starredgames = getCookie("starred");
	if (!Array.isArray(starredgames)) {
		console.warn("Invalid or missing 'starred' cookie, resetting to empty array.");
		starredgames = [];
	}

	$("#gamesearch").prop({
		placeholder: "Click here to search through our " + data.length + " games!",
	});

	data.sort(dynamicSort("name"));
	gamelist = data;

	for (let i = 0; i < data.length; i++) {
		let game = data[i];

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
			$element.find("img.star").attr("id", "starred").attr("src", "img/star-fill.svg");
			let $pinnedelement = $element.clone();
			$("#pinned").append($pinnedelement);
			if ($("#pinnedmessage")) {
				$("#pinnedmessage").hide();
			}
		}

		$("#games").append($element);
	}

	$("#games #message").remove();

	// search logic
	if ((search = 1)) {
		let txt = $("#gamesearch").val();
		if (txt == "") {
			$("#games .suggest").show();
		} else {
			$("#games .suggest").hide();
		}
		$("#games .game").hide();
		$("#games .game").each(function () {
			if (
				$(this).text().toUpperCase().includes(txt.toUpperCase()) ||
				$(this).attr("id").toUpperCase().includes(txt.toUpperCase())
			) {
				$(this).show();
			}
		});
	}

	// starred games
	$(document).on("click", ".game", function (event) {
		try {
			if ($(event.target).is("img.star")) {
				let gameId = $(this).attr("id");
				let starred = getCookie("starred") || [];

				if (!$(event.target).attr("id")) {
					// Add star
					$(event.target).prop({ id: "starred", src: "img/star-fill.svg" });
					if (!starred.includes(gameId)) {
						starred.push(gameId);
						setCookie("starred", starred, 180);
					}
					let $element = $(this).clone();
					$("#pinned").append($element);
					$("#pinnedmessage").hide();

					let temp = $("#pinned")[0].childNodes;
					let pinnedarray = [...temp];
					pinnedarray.sort(dynamicSort("id"));

					$("#pinned").empty();
					for (let i = 0; i < pinnedarray.length; i++) {
						let child = pinnedarray[i].childNodes;
						child = [...child];
						let $element = $("<div>")
							.prop({
								class: "game",
								id: pinnedarray[i].id,
							})
							.append(
								$("<img>").prop({
									src: child[0].src,
									alt: child[0].alt,
									class: "gameicon",
								})
							)
							.append($("<h1>").text(child[1].innerHTML))
							.append(
								$("<img>").prop({
									src: "img/star-fill.svg",
									alt: "star",
									class: "star",
									id: "starred",
								})
							);
						$("#pinned").append($element);
					}
				} else {
					// Remove star
					$(event.target).removeAttr("id").attr("src", "img/star.svg");
					let selector = "#" + gameId.replace(".", "\\.");
					starred = starred.filter(id => id !== gameId);
					setCookie("starred", starred, 180);
					$("#pinned " + selector).remove();
					if ($("#pinned").is(":empty")) {
						$("#pinnedmessage").show();
					}
					$(selector + " #starred").attr("src", "img/star.svg").removeAttr("id");
				}
			} else {
				redirectGame($(this).attr("id"));
			}
		} catch (err) {
			console.error("Error handling star toggle or redirect:", err);
		}
	});
}

function redirectGame(dir) {
	window.location.href = window.location.origin + "/" + dir + "/index.html";
}

function dynamicSort(property) {
	let sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		return sortOrder * a[property].localeCompare(b[property]);
	};
}

function selectRandomGame() {
	try {
		const game = gamelist[Math.floor(Math.random() * gamelist.length)];
		redirectGame(game.directory);
	} catch (err) {
		console.error("Failed to select random game:", err);
	}
}

let viewrecommended = 0;
function recommendedGames() {
	if (viewrecommended == 0) {
		$("#games .game").hide().filter("[recommended]").show();
		$("#recommend").text("Click to view all games again!");
		viewrecommended = 1;
	} else {
		$("#games .game").show();
		viewrecommended = 0;
		$("#recommend").text("Click to view recommended games!");
	}
}
