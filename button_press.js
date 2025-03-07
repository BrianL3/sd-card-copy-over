const { exec } = require('child_process');
const { Gpio } = require('onoff');

// Define the GPIO pin for the button (e.g., GPIO 17)
const BUTTON_PIN = 17;

// Set up the button as an input with a pull-up resistor
const button = new Gpio(BUTTON_PIN, 'in', 'falling', { debounceTimeout: 50 });

// Function to execute the video copying script
function runScript() {
    console.log('Button pressed! Running index.js...');
    exec('node /home/pi/sd-card-copy-over/index.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
        }
        console.log(`Script output:\n${stdout}`);
    });
}

// Watch for button press
button.watch((err, value) => {
    if (err) {
        console.error('Error watching button:', err);
        return;
    }
    runScript();
});

console.log('Waiting for button press...');

// Cleanup GPIO on exit
process.on('SIGINT', () => {
    button.unexport();
    console.log('GPIO cleaned up. Exiting.');
    process.exit();
});