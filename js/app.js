// js/app.js
import { Game } from './game.js';
import { UI } from './ui.js';
import { MAP_DATA } from './maps.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectionContainer = document.getElementById('country-selection');
    const gameContainer = document.getElementById('game-container');
    const countryButtons = document.querySelectorAll('.country-button');

    let game; // To hold the game instance

    // Handle country selection
    countryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const countryId = button.dataset.country;
            const countryData = MAP_DATA[countryId];

            if (countryData) {
                selectionContainer.classList.add('hidden');
                gameContainer.classList.remove('hidden');
                
                // Initialize the game with the selected country
                const ui = new UI();
                game = new Game(ui, countryData);
                game.start();
            }
        });
    });

    // Handle game controls
    document.getElementById('reset-button').addEventListener('click', () => {
        if (game) game.reset();
    });

    document.getElementById('change-country-button').addEventListener('click', () => {
        // Simple reload to go back to the selection screen
        location.reload();
    });
});