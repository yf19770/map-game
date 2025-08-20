// js/ui.js (Updated with summary screen logic)
export class UI {
    constructor() {
        this.mapContainer = document.getElementById('map-container');
        this.choicesContainer = document.getElementById('choices-container');
        this.questionArea = document.getElementById('question-area');
        this.completionMessage = document.getElementById('completion-message');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text'); 
        this.gameTitle = document.getElementById('game-title');
        this.uiPanel = document.getElementById('ui-panel'); 
        this.mistakesCounter = document.getElementById('mistakes-counter');
        
        // Summary card elements
        this.completionTitle = document.getElementById('completion-title');
        this.completionSubtitle = document.getElementById('completion-subtitle');
        this.summaryTime = document.getElementById('summary-time');
        this.summaryAccuracy = document.getElementById('summary-accuracy');
        this.summaryMistakes = document.getElementById('summary-mistakes');
    }

    // Helper to format milliseconds into m s format
    formatDuration(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }

    // ... renderMap, updateProgressBar, updateMapStyles, highlightState, displayChoices, showAnswerFeedback, disableChoices, updateMistakes are unchanged ...
    async renderMap(mapPath, countryName) {
        try {
            this.gameTitle.textContent = `Map of ${countryName}`; 
            const response = await fetch(mapPath);
            if (!response.ok) throw new Error('Map not found');
            const svgData = await response.text();
            this.mapContainer.innerHTML = svgData;
        } catch (error) {
            console.error('Error loading map:', error);
            this.mapContainer.innerHTML = '<p>Could not load the map.</p>';
        }
    }
    updateProgressBar(current, total) {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${current} / ${total}`; 
    }
    updateMapStyles(correctStates) {
        const paths = this.mapContainer.querySelectorAll('svg .state');
        paths.forEach(path => {
            path.classList.remove('highlighted', 'correct');
            if (correctStates.includes(path.id)) {
                path.classList.add('correct');
            }
        });
    }
    highlightState(stateId) {
        const path = document.getElementById(stateId);
        if (path) path.classList.add('highlighted');
    }
    displayChoices(choices, checkAnswerCallback) {
        this.choicesContainer.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.name;
            button.dataset.stateId = choice.id; 
            button.onclick = () => {
                this.disableChoices();
                checkAnswerCallback(choice.name, button);
            };
            this.choicesContainer.appendChild(button);
        });
        this.questionArea.classList.remove('hidden');
        this.choicesContainer.classList.remove('hidden');
        this.completionMessage.classList.add('hidden');
    }
    showAnswerFeedback(isCorrect, button) {
        button.classList.add(isCorrect ? 'correct-feedback' : 'incorrect-feedback');
        if (!isCorrect) {
            this.uiPanel.classList.add('shake-animation');
            setTimeout(() => this.uiPanel.classList.remove('shake-animation'), 500);
        }
    }
    disableChoices() {
        this.choicesContainer.querySelectorAll('.choice-button').forEach(b => b.disabled = true);
    }
    updateMistakes(count) {
        if (count > 0) {
            this.mistakesCounter.textContent = `Mistakes: ${count}`;
            this.mistakesCounter.classList.add('visible');
        } else {
            this.mistakesCounter.classList.remove('visible');
        }
    }

    showCompletionScreen({ mistakes, duration, totalQuestions }) {
        this.questionArea.classList.add('hidden');
        this.choicesContainer.classList.add('hidden');

        // Calculate accuracy. Total attempts = correct answers + mistakes.
        const accuracy = totalQuestions + mistakes === 0 ? 100 : (totalQuestions / (totalQuestions + mistakes)) * 100;

        // Update text content
        this.summaryTime.textContent = this.formatDuration(duration);
        this.summaryAccuracy.textContent = `${accuracy.toFixed(1)}%`;
        this.summaryMistakes.textContent = mistakes;

        if (mistakes === 0) {
            this.completionTitle.textContent = "Perfect Score!";
            this.completionSubtitle.textContent = "You're a true Geo Genius!";
            
            if (window.confetti) {
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            }
        } else {
            this.completionTitle.textContent = "Challenge Complete!";
            this.completionSubtitle.textContent = "Great effort! Review and try again.";
        }

        this.completionMessage.classList.remove('hidden');
    }
}