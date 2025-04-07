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
        <div>🍪 We use cookies to ensure you get the best experience on our website.</div>
        <div class="buttons">
          <a href="http://cookiesandyou.com/" target="_blank" class="learn-btn">Learn more</a>
          <button class="accept-btn">Accept</button>
        </div>
      </div>
    `;
  
    document.body.insertAdjacentHTML("beforeend", cookieHTML);
  
    const alert = document.querySelector(".cookie-alert");
    const accept = document.querySelector(".accept-btn");
  
    // Show it
    alert.offsetHeight;
    alert.classList.add("show");
  
    accept.addEventListener("click", function () {
      setCookie("acceptCookies", true, 180); // Store for 6 months
      alert.classList.remove("show");
    });
  });
  
  // Simple cookie helpers
  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 86400000);
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
  }
  
  function getCookie(cname) {
    return document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(cname + '='))?.split('=')[1] || '';
  }
  
  
  

