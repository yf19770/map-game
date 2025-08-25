import { trackEvent } from './analytics.js';

export class Game {
    constructor(ui, countryData) {
        this.ui = ui;
        this.countryData = countryData;
        this.allStates = [];
        this.correctlyGuessed = [];
        this.incorrectlyGuessed = []; 
        this.currentQuestionStateId = null;
        this.mistakesMade = 0;
        this.startTime = null;
    }

    getStatsStorageKey() {
        return this.countryData.storageKey + '_stats';
    }

      async start() {
        this.startTime = Date.now();
        
        this.ui.setGameTitle(this.countryData.regionType);
        this.ui.setQuestionText(this.countryData.regionType);
        
        await this.ui.renderMap(this.countryData.svgUrl, this.countryData.name);
        this.loadStateDataFromSVG();
        
        if (this.allStates.length === 0) {
            console.error("No states found in the SVG.");
            return;
        }

        if (this.loadAndDisplayCompletionStats()) {
            return; 
        }

        this.loadProgress(); 
        this.ui.updateMapStyles(this.correctlyGuessed);
        this.ui.updateMistakes(this.mistakesMade);
        this.nextQuestion();
    }

    loadAndDisplayCompletionStats() {
        const statsData = localStorage.getItem(this.getStatsStorageKey());
        if (statsData) {
            const stats = JSON.parse(statsData);
            this.correctlyGuessed = this.allStates.map(s => s.id);
            this.loadProgress();
            this.ui.showFinalMapResults(this.incorrectlyGuessed);
            this.ui.showCompletionScreen(stats);
            return true;
        }
        return false;
    }
    
    saveCompletionStats(stats) {
        localStorage.setItem(this.getStatsStorageKey(), JSON.stringify(stats));
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
            const duration = Date.now() - this.startTime;
            
            const gameStats = {
                mistakes: this.mistakesMade,
                duration: duration,
                totalQuestions: this.allStates.length
            };
            
            this.saveCompletionStats(gameStats);
            this.ui.showCompletionScreen(gameStats);
            this.ui.showFinalMapResults(this.incorrectlyGuessed); 
            
            const totalQuestions = this.allStates.length;
            const accuracy = totalQuestions + this.mistakesMade === 0 ? 100 : (totalQuestions / (totalQuestions + this.mistakesMade)) * 100;
            trackEvent('game_completed', {
                country_name: this.countryData.name,
                mistakes: this.mistakesMade,
                duration_seconds: Math.round(duration / 1000),
                accuracy_percentage: parseFloat(accuracy.toFixed(1)), 
                total_questions: totalQuestions
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
            setTimeout(() => this.nextQuestion(), 400);
        } else {
            this.mistakesMade++;
            if (!this.incorrectlyGuessed.includes(correctState.id)) {
                this.incorrectlyGuessed.push(correctState.id);
            }
            this.ui.updateMistakes(this.mistakesMade);
            this.saveProgress(); 
            setTimeout(() => this.nextQuestion(), 600);
        }
    }
    
    saveProgress() {
        const progressData = {
            correctlyGuessed: this.correctlyGuessed,
            incorrectlyGuessed: this.incorrectlyGuessed, 
            mistakesMade: this.mistakesMade
        };
        localStorage.setItem(this.countryData.storageKey, JSON.stringify(progressData));
    }

    loadProgress() {
        const savedJSON = localStorage.getItem(this.countryData.storageKey);
        if (savedJSON) {
            const savedData = JSON.parse(savedJSON);
            this.correctlyGuessed = savedData.correctlyGuessed || [];
            this.incorrectlyGuessed = savedData.incorrectlyGuessed || []; 
            this.mistakesMade = savedData.mistakesMade || 0;
        } else {
            this.correctlyGuessed = [];
            this.incorrectlyGuessed = []; 
            this.mistakesMade = 0;
        }
    }

    reset() {
        trackEvent('reset_game', { country_name: this.countryData.name });
        
        this.correctlyGuessed = [];
        this.incorrectlyGuessed = []; 
        this.mistakesMade = 0;
        this.startTime = Date.now(); 
        localStorage.removeItem(this.countryData.storageKey);
        localStorage.removeItem(this.getStatsStorageKey()); 
        this.ui.updateMistakes(this.mistakesMade);
        this.nextQuestion();
    }
}