// js/app.js (Updated for smooth transitions)
import { Game } from './game.js';
import { UI } from './ui.js';
import { MAP_DATA } from './maps.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectionContainer = document.getElementById('country-selection');
    const gameContainer = document.getElementById('game-container');
    const countryButtons = document.querySelectorAll('.country-button');

    let game; // To hold the game instance

    const showGameScreen = (countryData) => {
        // 1. Add fade-out animation class to selection screen
        selectionContainer.style.animation = 'scaleIn 0.5s ease-in reverse';

        // 2. After animation, hide it and show the game screen
        setTimeout(() => {
            selectionContainer.classList.add('hidden');
            selectionContainer.style.animation = ''; // Reset animation
            
            gameContainer.classList.remove('hidden');
            gameContainer.style.animation = 'scaleIn 0.5s ease-out'; // Add fade-in animation

            // Initialize the game
            const ui = new UI();
            game = new Game(ui, countryData);
            game.start();
        }, 450); 
    };

    const showSelectionScreen = () => {
        // 1. Animate game screen out
        gameContainer.style.animation = 'scaleIn 0.5s ease-in reverse';
        
        
        setTimeout(() => {
            gameContainer.classList.add('hidden');
            gameContainer.style.animation = '';
            
            selectionContainer.classList.remove('hidden');
            selectionContainer.style.animation = 'scaleIn 0.5s ease-out';
            if (game) game = null; // Clean up game instance
        }, 450);
    };

    // Handle country selection
    countryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const countryId = button.dataset.country;
            const countryData = MAP_DATA[countryId];
            if (countryData) {
                showGameScreen(countryData);
            }
        });
    });

    
    document.getElementById('reset-button').addEventListener('click', () => {
        if (game) game.reset();
    });

    document.getElementById('change-country-button').addEventListener('click', () => {
        
        showSelectionScreen();
    });
});