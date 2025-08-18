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
    }

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
            this.uiPanel.classList.add('shake-animation'); // Shake the panel now
            setTimeout(() => this.uiPanel.classList.remove('shake-animation'), 500);
        }
    }

    disableChoices() {
        this.choicesContainer.querySelectorAll('.choice-button').forEach(b => b.disabled = true);
    }

    showCompletionScreen() {
        this.questionArea.classList.add('hidden');
        this.choicesContainer.classList.add('hidden');
        this.completionMessage.classList.remove('hidden');
    }
}