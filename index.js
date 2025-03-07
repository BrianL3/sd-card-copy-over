const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const SD_MOUNT_POINT = '/media/pi'; // Common mount point for USB devices on Raspberry Pi
const VIDEO_EXTENSIONS = ['.mp4', '.MP4'];
const LOCAL_VIDEO_FOLDER = '/home/pi/videos'; // Change this to your destination folder

// Function to detect mounted SD card
async function detectSDCard() {
    try {
        const { stdout } = await execAsync('lsblk -o MOUNTPOINT,NAME | grep sd');
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 1) {
                const mountPoint = parts[0];
                if (mountPoint.startsWith(SD_MOUNT_POINT)) {
                    return mountPoint;
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Error detecting SD card:', error);
        return null;
    }
}

// Function to find video files on SD card
async function getVideoFiles(directory) {
    try {
        const files = fs.readdirSync(directory);
        return files
            .filter(file => VIDEO_EXTENSIONS.includes(path.extname(file)))
            .map(file => path.join(directory, file));
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error);
        return [];
    }
}

// Function to find GoPro videos (usually in DCIM folder)
async function findGoProVideos(sdPath) {
    const dcimPath = path.join(sdPath, 'DCIM');
    if (!fs.existsSync(dcimPath)) {
        console.log('No DCIM folder found. Not a GoPro SD card.');
        return [];
    }

    const dcimFolders = fs.readdirSync(dcimPath).map(folder => path.join(dcimPath, folder));
    let videoFiles = [];
    
    for (const folder of dcimFolders) {
        if (fs.lstatSync(folder).isDirectory()) {
            const videos = await getVideoFiles(folder);
            videoFiles = videoFiles.concat(videos);
        }
    }

    return videoFiles;
}

// Function to compare and find new videos
async function getNewVideos(sdVideos) {
    const localVideos = await getVideoFiles(LOCAL_VIDEO_FOLDER);
    const localVideoNames = new Set(localVideos.map(file => path.basename(file)));

    return sdVideos.filter(file => !localVideoNames.has(path.basename(file)));
}

// Function to copy new videos to the local directory
async function copyVideos(newVideos, destination) {
    for (const video of newVideos) {
        const destinationPath = path.join(destination, path.basename(video));
        try {
            console.log(`Copying ${video} to ${destinationPath}...`);
            await execAsync(`cp "${video}" "${destinationPath}"`);
            console.log(`Successfully copied ${video}`);
        } catch (error) {
            console.error(`Failed to copy ${video}:`, error);
        }
    }
}

// Main function to orchestrate the process
async function main() {
    console.log('Checking for SD card...');
    const sdPath = await detectSDCard();
    
    if (!sdPath) {
        console.log(`No SD card detected at ${SD_MOUNT_POINT}. Exiting.`);
        return;
    }

    console.log(`SD card detected at ${sdPath}`);

    console.log('Scanning for GoPro videos...');
    const sdVideos = await findGoProVideos(sdPath);

    if (sdVideos.length === 0) {
        console.log('No GoPro videos found.');
        return;
    }

    console.log(`Found ${sdVideos.length} videos on SD card.`);

    console.log('Checking for new videos...');
    const newVideos = await getNewVideos(sdVideos);

    if (newVideos.length === 0) {
        console.log('No new videos to copy.');
        return;
    }

    console.log(`Copying ${newVideos.length} new videos...`);
    await copyVideos(newVideos, LOCAL_VIDEO_FOLDER);

    console.log('All new videos have been copied successfully.');
}

// Execute main function
main().catch(console.error);