# 🚀 Raspberry Pi GoPro Video Transfer Script

This project automates the transfer of GoPro videos from an **SD card (via USB reader)** to a **Raspberry Pi** when a button is pressed.

## 📌 Features
- Detects an **SD card** when inserted.
- Scans for **GoPro videos** (`.MP4`) inside the **DCIM** folder.
- Compares files to prevent **duplicate transfers**.
- Copies **only new videos** to the Raspberry Pi.
- **Button-triggered** operation via GPIO.

---

## 🛠️ **Setup Instructions**

### **1. Install Node.js & `nvm`**
Before running this project, ensure you have **Node.js** installed using `nvm`.

#### **🔹 Install `nvm` (if not already installed)**
```sh
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # or source ~/.zshrc if using Zsh
```
🔹 Install the correct Node.js version
```
nvm install
nvm use
```
(This automatically uses the version specified in .nvmrc.)

---
### **2. Clone the Project & Navigate

git clone https://github.com/your-repo/gopro-video-transfer.git
cd gopro-video-transfer

---
### **3. Install Dependencies

🚨 Don’t forget this step! Be inside the project (sibling to `package.json`)

npm install

---

📂 Folder Setup

Required Directories

Before running the script, ensure the following folders exist:
	•	SD Card Mount Point: (Usually auto-mounted, but if needed, create manually)

sudo mkdir -p /media/pi

	•	Local Video Storage (on Raspberry Pi)

mkdir -p ~/videos

---

🔌 Wiring the Button
	•	Connect one leg of the button to GND (ground).
	•	Connect the other leg to GPIO 17.

---

▶️ Running the Script

To start the button listener:

node button_trigger.js

Press the button, and the script will transfer new videos from the SD card to ~/videos.

---

🛠️ Make It Run on Boot (Optional)

Option 1: Using pm2 (Recommended)

npm install -g pm2
pm2 start button_trigger.js --name button-script
pm2 save
pm2 startup

Option 2: Using crontab

crontab -e

Add the following line at the bottom:

@reboot /usr/bin/node /home/pi/gopro-video-transfer/button_trigger.js



---

✅ Checking Everything Works
	1.	Insert the SD card with GoPro videos.
	2.	Press the button.
	3.	Check ~/videos for transferred files.
	4.	Verify logs:

tail -f button_trigger.log

---


❓ Troubleshooting
	•	If Node.js version is incorrect, run:

nvm use


	•	If the script doesn’t start on boot, verify pm2:

pm2 list
pm2 logs button-script


	•	If videos aren’t copying, check the SD card path:

lsblk