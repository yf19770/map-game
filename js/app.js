// js/app.js (Updated with dev button logic)
import { Game } from './game.js';
import { UI } from './ui.js';
import { MAP_DATA } from './maps.js';
import { trackEvent } from './analytics.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectionContainer = document.getElementById('country-selection');
    const gameContainer = document.getElementById('game-container');
    const countryButtons = document.querySelectorAll('.country-button');
    
    const ui = new UI(); // Create UI instance once
    let game; 

    const showGameScreen = (countryData) => {
        trackEvent('select_country', { country_name: countryData.name });
        selectionContainer.style.animation = 'scaleIn 0.5s ease-in reverse';

        setTimeout(() => {
            selectionContainer.classList.add('hidden');
            selectionContainer.style.animation = ''; 
            gameContainer.classList.remove('hidden');
            gameContainer.style.animation = 'scaleIn 0.5s ease-out';
            
            game = new Game(ui, countryData); // Pass the shared UI instance
            game.start();
        }, 450); 
    };

    const showSelectionScreen = () => {
        trackEvent('return_to_selection');
        gameContainer.style.animation = 'scaleIn 0.5s ease-in reverse';
        
        setTimeout(() => {
            gameContainer.classList.add('hidden');
            gameContainer.style.animation = '';
            selectionContainer.classList.remove('hidden');
            selectionContainer.style.animation = 'scaleIn 0.5s ease-out';
            if (game) game = null;
        }, 450);
    };

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

    // --- DEV BUTTONS LOGIC ---
    document.getElementById('dev-perfect').addEventListener('click', () => {
        const randomTime = Math.random() * (180000 - 30000) + 30000; // 30s to 3m
        ui.showCompletionScreen({
            mistakes: 0,
            duration: randomTime,
            totalQuestions: 50 // Simulate a map with 50 states
        });
    });

    document.getElementById('dev-imperfect').addEventListener('click', () => {
        const randomTime = Math.random() * (300000 - 60000) + 60000; // 1m to 5m
        const randomMistakes = Math.floor(Math.random() * 10) + 1; // 1 to 10 mistakes
        ui.showCompletionScreen({
            mistakes: randomMistakes,
            duration: randomTime,
            totalQuestions: 50 // Simulate a map with 50 states
        });
    });
});