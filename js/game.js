// js/game.js (Updated with timer logic)
import { trackEvent } from './analytics.js';

export class Game {
    constructor(ui, countryData) {
        this.ui = ui;
        this.countryData = countryData;
        this.allStates = [];
        this.correctlyGuessed = [];
        this.currentQuestionStateId = null;
        this.mistakesMade = 0;
        this.startTime = null; // To track game duration
    }

    async start() {
        this.startTime = Date.now(); // Start the timer
        await this.ui.renderMap(this.countryData.svgUrl, this.countryData.name);
        this.loadStateDataFromSVG();
        
        if (this.allStates.length === 0) {
            console.error("No states found in the SVG.");
            return;
        }

        this.loadProgress();
        this.ui.updateMapStyles(this.correctlyGuessed);
        this.ui.updateMistakes(this.mistakesMade);
        this.nextQuestion();
    }

    loadStateDataFromSVG() {
        const paths = document.querySelectorAll('#map-container svg .state');
        this.allStates = Array.from(paths).map(path => ({
            id: path.id,
            name: path.getAttribute('name')
        })).filter(state => state.id && state.name);
    }

    nextQuestion() {
        this.ui.updateProgressBar(this.correctlyGuessed.length, this.allStates.length);
        const remainingStates = this.allStates.filter(s => !this.correctlyGuessed.includes(s.id));

        if (remainingStates.length === 0) {
            const duration = Date.now() - this.startTime; // Calculate final time
            this.ui.updateMapStyles(this.correctlyGuessed);
            
            // Pass all stats to the UI for the summary card
            this.ui.showCompletionScreen({
                mistakes: this.mistakesMade,
                duration: duration,
                totalQuestions: this.allStates.length
            });
            
            trackEvent('game_completed', {
                country_name: this.countryData.name,
                mistakes: this.mistakesMade,
                duration_seconds: Math.round(duration / 1000),
            });
            return;
        }

        const questionState = remainingStates[Math.floor(Math.random() * remainingStates.length)];
        this.currentQuestionStateId = questionState.id;
        
        this.ui.updateMapStyles(this.correctlyGuessed);
        this.ui.highlightState(questionState.id);
        
        const choices = this.generateChoices(questionState);
        this.ui.displayChoices(choices, (answer, button) => this.checkAnswer(answer, button));
    }

    generateChoices(correctState) {
        let choices = [correctState];
        const incorrectOptions = this.allStates.filter(s => s.id !== correctState.id);
        
        while (choices.length < 6 && incorrectOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
            choices.push(incorrectOptions.splice(randomIndex, 1)[0]);
        }
        return choices.sort(() => Math.random() - 0.5);
    }

    checkAnswer(selectedName, button) {
        const correctState = this.allStates.find(s => s.id === this.currentQuestionStateId);
        const isCorrect = selectedName === correctState.name;

        trackEvent('answer_given', {
            country_name: this.countryData.name,
            state_name: correctState.name,
            is_correct: isCorrect
        });

        this.ui.showAnswerFeedback(isCorrect, button);
        new Audio(isCorrect ? './sounds/correct.mp3' : './sounds/incorrect.mp3').play();

        if (isCorrect) {
            this.correctlyGuessed.push(correctState.id);
            this.saveProgress();
            setTimeout(() => this.nextQuestion(), 800);
        } else {
            this.mistakesMade++;
            this.ui.updateMistakes(this.mistakesMade);
            setTimeout(() => this.nextQuestion(), 1200);
        }
    }

    saveProgress() {
        localStorage.setItem(this.countryData.storageKey, JSON.stringify(this.correctlyGuessed));
    }

    loadProgress() {
        const savedData = localStorage.getItem(this.countryData.storageKey);
        if (savedData) this.correctlyGuessed = JSON.parse(savedData);
        this.mistakesMade = 0; 
    }

    reset() {
        trackEvent('reset_game', { country_name: this.countryData.name });
        
        this.correctlyGuessed = [];
        this.mistakesMade = 0;
        this.startTime = Date.now(); // Reset timer on reset
        localStorage.removeItem(this.countryData.storageKey);
        this.ui.updateMistakes(this.mistakesMade);
        this.nextQuestion();
    }
}