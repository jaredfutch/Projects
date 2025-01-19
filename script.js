let words = [];
let currentIndex = 0;
let currentScrambledWord = "";
let score = 0; // Track the user's score
let isCelebrationTriggered = false; // To prevent multiple celebrations
let canScramble = true; // To control scramble button timing

// Load words from uploaded Excel file
document.getElementById('fileUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            words = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }).flat();
            if (words.length) {
                startQuiz();
            }
        };
        reader.readAsArrayBuffer(file);
    }
});

// Shuffle word letters
function shuffleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

// Display a scrambled word
function displayScrambledWord() {
    const word = words[currentIndex];
    currentScrambledWord = shuffleWord(word);
    document.getElementById('scrambledWord').textContent = currentScrambledWord;
}

// Start the quiz
function startQuiz() {
    currentIndex = 0;
    displayScrambledWord();
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('scrambleBtn').disabled = false; // Enable the scramble button
}

// Check if the user input is correct
// Check if the user input is correct
function checkAnswer() {
    const userInput = document.getElementById('userInput').value.trim();
    const originalWord = words[currentIndex];
    const feedbackEl = document.getElementById('feedback');
    const correctAnswerSound = document.getElementById('correctAnswerSound');
    const loseSound = document.getElementById('loseSound');

    if (userInput.toLowerCase() === originalWord.toLowerCase()) {
        feedbackEl.textContent = 'Correct!';
        feedbackEl.style.color = 'green';
        correctAnswerSound.play(); // Play the correct answer sound
        updateScore(3); // Increase score by 3
        nextWord(); // Move to the next word immediately after a correct answer
    } else {
        feedbackEl.textContent = 'Incorrect, try again.';
        feedbackEl.style.color = 'red';
        loseSound.play(); // Play losing sound
        updateScore(-1); // Decrease score by 1 for incorrect answer
    }
}

// Update the user's score and move the spaceship
function updateScore(points) {
    score += points;

    // Ensure score is within bounds (0 to 45)
    if (score < 0) score = 0;
    if (score > 45) score = 45;

    moveSpaceship(); // Update spaceship position based on score
}

// Move to the next word
function nextWord() {
    document.getElementById('userInput').value = ''; // Clear user input
    document.getElementById('feedback').textContent = ''; // Clear feedback
    currentIndex++;
    if (currentIndex < words.length) {
        displayScrambledWord(); // Display next scrambled word
        document.getElementById('submitBtn').disabled = false; // Re-enable submit button
        document.getElementById('nextBtn').disabled = true; // Disable next button again
    } else {
        document.getElementById('scrambledWord').textContent = 'Quiz Complete!';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true; // Disable next button at the end
        document.getElementById('scrambleBtn').disabled = true; // Disable scramble button at the end
    }
}


// Move the spaceship and update the green background based on the user's score
function moveSpaceship() {
    const spaceship = document.getElementById('spaceship');
    const spaceshipBackground = document.getElementById('spaceshipBackground');
    const maxHeight = 90; // 90% of the screen height
    const newPosition = (score / 45) * maxHeight; // Calculate the position as a percentage of max height

    // Move the spaceship upwards
    spaceship.style.transform = `translateY(-${newPosition}vh)`;

    // Increase the green background height based on score
    spaceshipBackground.style.height = `${newPosition}vh`;

    // Trigger celebration if the spaceship reaches the top
    if (score === 45 && !isCelebrationTriggered) {
        triggerRocketCelebration(); // Play celebration sound when rocket reaches the top
        isCelebrationTriggered = true; // Ensure celebration only happens once
    }
}

// Trigger the special celebration when the spaceship reaches the top
function triggerRocketCelebration() {
    const rocketCelebrationSound = document.getElementById('rocketCelebrationSound');
    rocketCelebrationSound.play();

    // Create confetti pieces dynamically
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti';
    document.body.appendChild(confettiContainer);

    // Create multiple confetti pieces (e.g., 100 pieces)
    for (let i = 0; i < 100; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.classList.add('confetti-piece');
        confettiPiece.style.left = `${Math.random() * 100}vw`; // Random starting horizontal position
        confettiPiece.style.backgroundColor = getRandomColor(); // Random color
        confettiPiece.style.animationDelay = `${Math.random() * 2}s`; // Random animation delay
        confettiPiece.style.animationDuration = `${2 + Math.random() * 3}s`; // Random fall duration
        confettiPiece.style.transform = `rotate(${Math.random() * 360}deg)`; // Random initial rotation
        confettiContainer.appendChild(confettiPiece);
    }

    // Remove confetti after a few seconds
    setTimeout(() => {
        confettiContainer.remove();
    }, 5000);
}

// Helper function to get random color for confetti
function getRandomColor() {
    const colors = ['#ffcc00', '#ff6699', '#66ccff', '#66ff66', '#ff6666', '#ff9966', '#cc66ff', '#ff99cc'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Scramble the word again (but limit it to every 10 seconds)
function scrambleWordAgain() {
    if (canScramble) {
        displayScrambledWord();
        canScramble = false;
        document.getElementById('scrambleBtn').disabled = true;

        // Allow scramble button to be used again after 10 seconds
        setTimeout(() => {
            canScramble = true;
            document.getElementById('scrambleBtn').disabled = false;
        }, 10000);
    }
}

// Move to the next word
function nextWord() {
    document.getElementById('userInput').value = '';
    document.getElementById('feedback').textContent = '';
    currentIndex++;
    if (currentIndex < words.length) {
        displayScrambledWord();
        document.getElementById('submitBtn').disabled = false; // Re-enable submit button
        document.getElementById('nextBtn').disabled = true; // Disable next button again
    } else {
        document.getElementById('scrambledWord').textContent = 'Quiz Complete!';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('scrambleBtn').disabled = true; // Disable scramble button at the end
    }
}

// Submit answer when Enter is pressed
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Event listeners for buttons
document.getElementById('submitBtn').addEventListener('click', checkAnswer);
document.getElementById('nextBtn').addEventListener('click', nextWord);
document.getElementById('scrambleBtn').addEventListener('click', scrambleWordAgain);
