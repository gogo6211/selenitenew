"use strict";

/*
   New Perspectives on HTML5, CSS3, and JavaScript 6th Edition
   Tutorial 14
   Tutorial Case

   Author: George
   Date:   7/2/19
   
   Filename: ag_poker.js

*/

window.addEventListener('load', playDrawPoker);

function playDrawPoker() {
    var dealButton = document.getElementById('dealB');
    var drawButton = document.getElementById('drawB');
    var standButton = document.getElementById('standB');
    var resetButton = document.getElementById('resetB');
    var handValueText = document.getElementById('handValue');
    var betSelection = document.getElementById('bet');
    var bankBox = document.getElementById('bank');
    // Enable the Draw and Stan buttons after the deal
    dealButton.addEventListener('click',
        function() {
            disableObj(dealButton);
            disableObj(betSelection);
            enableObj(drawButton);
            enableObj(standButton);
        });

    // Enable the Deal and Bet options when the current hand ends
    drawButton.addEventListener('click',
        function() {
            enableObj(dealButton);
            enableObj(betSelection);
            disableObj(drawButton);
            disableObj(standButton);
        });

        standButton.addEventListener('click',
        function() {
            enableObj(dealButton);
            enableObj(betSelection);
            disableObj(drawButton);
            disableObj(standButton);
        });

    // Disable Poker Button
    function disableObj(obj) {
        obj.disable = true;
        obj.style.opacity = 0.25;
    }

    // Enable Poker Button
    function enableObj(obj) {
        obj.disable = false;
        obj.style.opacity = 1;
    }
}