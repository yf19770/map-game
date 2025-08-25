// js/ui.js

export class UI {
    constructor() {
        this.mapContainer = document.getElementById('map-container');
        this.choicesContainer = document.getElementById('choices-container');
        this.questionArea = document.getElementById('question-area');
        this.questionTextElement = this.questionArea.querySelector('p');
        this.completionMessage = document.getElementById('completion-message');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text'); 
        this.gameTitle = document.getElementById('game-title');
        this.uiPanel = document.getElementById('ui-panel'); 
        this.mistakesCounter = document.getElementById('mistakes-counter');
        this.completionTitle = document.getElementById('completion-title');
        this.completionSubtitle = document.getElementById('completion-subtitle');
        this.summaryTime = document.getElementById('summary-time');
        this.summaryAccuracy = document.getElementById('summary-accuracy');
        this.summaryMistakes = document.getElementById('summary-mistakes');
    }
    
    setQuestionText(regionType) {
        // Use 'country' if the regionType is 'Country', otherwise default to 'region'.
        const noun = (regionType || '').toLowerCase() === 'country' ? 'country' : 'region';
        if (this.questionTextElement) {
            this.questionTextElement.textContent = `The highlighted ${noun} is...`;
        }
    }

    setGameTitle(regionType) {
        if (regionType) {
            this.gameTitle.textContent = `Identify the ${regionType}`;
        }
    }

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
        this.removePulseEffect(); 
        
        paths.forEach(path => {
            path.classList.remove('highlighted', 'correct', 'incorrect-final');
            if (correctStates.includes(path.id)) {
                path.classList.add('correct');
            }
        });
    }

      highlightState(stateId) {
        const path = document.getElementById(stateId);
        if (!path) return;

        // Apply the standard highlight class to the original state
        path.classList.add('highlighted');

        // Create the pulsing clone
        const clone = path.cloneNode(true);
        clone.removeAttribute('id'); 
        clone.classList.remove('highlighted'); 
        clone.classList.add('pulsing-clone'); 

        const bbox = path.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        clone.style.transformOrigin = `${centerX}px ${centerY}px`;
    
        path.parentNode.appendChild(path);
        path.parentNode.insertBefore(clone, path);
    }
    
    removePulseEffect() {
        const existingClone = this.mapContainer.querySelector('.pulsing-clone');
        if (existingClone) {
            existingClone.remove();
        }
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

    showFinalMapResults(incorrectlyGuessedIds) {
        this.removePulseEffect(); // Clean up any active pulse
        const paths = this.mapContainer.querySelectorAll('svg .state');

        paths.forEach(path => {
            // Remove any temporary styling
            path.classList.remove('highlighted');

            if (incorrectlyGuessedIds.includes(path.id)) {
                // This state had at least one mistake
                path.classList.remove('correct');
                path.classList.add('incorrect-final');
            } else {
                // This state was answered correctly on the first try
                path.classList.remove('incorrect-final');
                path.classList.add('correct');
            }
        });
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