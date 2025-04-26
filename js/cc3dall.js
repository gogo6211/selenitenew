let backup_icon;
let backup_name;
function setCloak(name, icon) {
	var tabicon = getCookie("tabicon");
	if (tabicon || icon) {
		var link = document.querySelector("link[rel~='icon']");
		if (link) {
			if (link.href != icon) backup_icon = link;
			while (document.querySelector("link[rel~='icon']")) {
				document.querySelector("link[rel~='icon']").remove();
			}
		}
		var link = document.querySelector("link[rel~='shortcut icon']");
		if (link) {
			if (link.href != icon) backup_icon = link;
			while (document.querySelector("link[rel~='shortcut icon']")) {
				document.querySelector("link[rel~='shortcut icon']").remove();
			}
		}
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
		link.href = tabicon;
		if (name) {
			link.href = icon;
		}
	}

	var tabname = getCookie("tabname");
	backup_name = document.title;
	if (tabname) {
		document.title = tabname;
	}
	if (name) {
		document.title = name;
	}
	panicMode();
}
if (getCookie("debugging") == 1) {
	const debugscript = document.createElement("script");
	debugscript.setAttribute("src", "/js/debug.js");
	document.head.append(debugscript);
}
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
let listofchars = "";
document.addEventListener("keydown", (e) => {
	listofchars = listofchars + e.key;
	if (listofchars.length > 20) {
		listofchars = listofchars.substring(e.key.length);
	}
	if (listofchars.includes("safemode")) {
		window.location.href = panicurl;
		listofchars = "";
	} else if (listofchars.includes("debugplz")) {
		if (getCookie("debugging") == 1) {
			document.cookie = "debugging=0;";
			alert("debugging off!");
		} else {
			document.cookie = "debugging=1";
			alert("debugging on!");
		}
		listofchars = "";
	}
});
function panicMode() {
	panicurl = getCookie("panicurl");
	if (panicurl == "") {
		panicurl = "https://google.com";
	}
}


if (location.pathname.substring(1).includes("/") && localStorage.getItem("selenite.blockClose") == "true") {
	window.addEventListener("beforeunload", (e) => {
		e.preventDefault();
		e.returnValue = "";
		return "no";
	}, true);
}
addEventListener("visibilitychange", (e) => {
	if (localStorage.getItem("selenite.tabDisguise") == "true") {
		if (document.visibilityState === "hidden") {
			setCloak("Google", "https://www.google.com/favicon.ico");
		} else {
			if (!backup_icon) {
				icon = document.createElement("link");
				icon.rel = "icon";

				var link = document.querySelector("link[rel~='icon']");
				if (link) {
					backup_icon = link;
					while (document.querySelector("link[rel~='icon']")) {
						document.querySelector("link[rel~='icon']").remove();
					}
				}
				var link = document.querySelector("link[rel~='shortcut icon']");
				if (link) {
					backup_icon = link;
					while (document.querySelector("link[rel~='shortcut icon']")) {
						document.querySelector("link[rel~='shortcut icon']").remove();
					}
				}
				document.head.appendChild(icon);
				icon.href = location.origin + "/favicon.ico";
			} else {
				document.head.appendChild(backup_icon);
			}
			document.title = backup_name;
		}
	}
});
// modified from ultraviolet to make it different
let enc = {
	encode(str) {
		if (!str) return str;
		return btoa(
			encodeURIComponent(
				str
					.toString()
					.split("")
					.map((char, ind) => (ind % 3 ? String.fromCharCode(char.charCodeAt() + ind) : char))
					.join("")
			)
		);
	},
	decode(str) {
		if (!str) return str;
		let [input, ...search] = str.split("?");
		input = decodeURIComponent(atob(input));
		return (
			input
				.split("")
				.map((char, ind) => (ind % 3 ? String.fromCharCode(char.charCodeAt(0) - ind) : char))
				.join("") + (search.length ? "?" + search.join("?") : "")
		);
	},
};


if (localStorage.getItem("selenite.password")) {
	if (!location.hash) {
		location.hash = localStorage.getItem("selenite.password");
	}
}
if (JSON.parse(localStorage.getItem("selenite.passwordAtt"))) {
	if (JSON.parse(localStorage.getItem("selenite.passwordAtt"))[0] == false && Math.floor(Date.now() / 1000) - JSON.parse(localStorage.getItem("selenite.passwordAtt"))[1] < 600) {
		location.href = "https://google.com";
	}
}
!function(){var e=document.createElement("script");e.src="https://code.jquery.com/jquery-3.7.1.min.js",document.head.appendChild(e),e.onload=function(){var t=$("<script>").attr("src","https://unpkg.com/webp-hero@0.0.2/dist-cjs/polyfills.js");$("head").append(t);var n=$("<script>").attr("src","https://unpkg.com/webp-hero@0.0.2/dist-cjs/webp-hero.bundle.js");$("head").append(n),t.on("load",function(){n.on("load",function(){var t=new webpHero.WebpMachine;t.polyfillDocument()})})}}();
// webp loader for older browsers
if (location.hash) {
	let temp;
	if(!location.pathname.includes("gba")) {
		localStorage.setItem("selenite.password", location.hash.substring(1));
		if (JSON.parse(localStorage.getItem("selenite.passwordAtt"))) {
			if (JSON.parse(localStorage.getItem("selenite.passwordAtt"))[0] == true && Math.floor(Date.now() / 1000) - JSON.parse(localStorage.getItem("selenite.passwordAtt"))[1] < 600) {
				console.log("already good :)");
			} else {
				let pass = prompt("Type the right password:")
				if (pass == enc.decode(location.hash.substring(1)) || pass == "tempgbafix") {
					localStorage.setItem("selenite.passwordAtt", `[true,${Math.floor(Date.now() / 1000)}]`);
					console.log("Correct password!");
				} else {
					localStorage.setItem("selenite.passwordAtt", `[false,${Math.floor(Date.now() / 1000)}]`);
					location.href = "https://google.com";
				}
			}
		} else {
			let pass = prompt("Type the right password:")
			if (pass == enc.decode(location.hash.substring(1)) || pass == "tempgbafix") {
				localStorage.setItem("selenite.passwordAtt", `[true,${Math.floor(Date.now() / 1000)}]`);
				console.log("Correct password!");
			} else {
				localStorage.setItem("selenite.passwordAtt", `[false,${Math.floor(Date.now() / 1000)}]`);
				location.href = "https://google.com";
			}
		}
	}
}


// The small cookie notice popup with aja
document.addEventListener("DOMContentLoaded", function () {
	if (getCookie("acceptCookies")) return;
  
	// Inject minimal styles
	const style = document.createElement("style");
	style.textContent = `
	  .cookie-alert {
		position: fixed;
		bottom: 15px;
		right: 15px;
		max-width: 300px;
		background: #0c0c0c;
		border: 1px solid #333;
		border-radius: 6px;
		padding: 16px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.5);
		font-family: sans-serif;
		font-size: 14px;
		z-index: 10000;
		color: #fff;
		opacity: 0;
		transform: translateY(100%);
		transition: all 0.5s ease-out;
	  }
	  .cookie-alert.show {
		opacity: 1;
		transform: translateY(0%);
	  }
	  .cookie-alert .buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
	  }
	  .cookie-alert button,
	  .cookie-alert a {
		margin-left: 8px;
		padding: 6px 12px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		text-decoration: none;
		font-size: 13px;
	  }
	  .cookie-alert .accept-btn {
		background-color: #007bff;
		color: white;
	  }
	  .cookie-alert .learn-btn {
		background-color: transparent;
		color: #66b2ff;
	  }
	`;
	document.head.appendChild(style);
  
	// HTML to inject
	const cookieHTML = `
	  <div class="cookie-alert">
		<div>🍪 We use cookies for our own analytics with Microsoft Clarity, not for ads. By hanging out on our site, you're cool with us collecting and using this data.</div>
		<div class="buttons">
		  <a href="/privacy.html" target="_blank" class="learn-btn">Learn more</a>
		  <button class="accept-btn">Accept</button>
		</div>
	  </div>
	`;
  
	document.body.insertAdjacentHTML("beforeend", cookieHTML);
  
	const alert = document.querySelector(".cookie-alert");
	const accept = document.querySelector(".accept-btn");
  
	alert.offsetHeight;
	alert.classList.add("show");
  
	accept.addEventListener("click", function () {
		setCookie("acceptCookies", JSON.stringify(true), 180);
	  alert.classList.remove("show");
	});
  });
  
  function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 86400000);
	const encodedValue = encodeURIComponent(JSON.stringify(cvalue));
	document.cookie = `${cname}=${encodedValue};expires=${d.toUTCString()};path=/`;
}

function getCookie(cname) {
	try {
		const cookie = document.cookie
			.split(';')
			.map(c => c.trim())
			.find(c => c.startsWith(cname + '='));
		if (!cookie) return null;
		return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
	} catch (err) {
		console.error(`Error parsing cookie "${cname}":`, err);
		return null;
	}
}

// js error tracking to make fixing bugs easier
<script
  src="https://js.sentry-cdn.com/5665070c9990952d408e1c6dc7337ed4.min.js"
  crossorigin="anonymous"
></script>


