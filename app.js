if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered successfully.'))
        .catch(err => console.error('Service Worker registration failed:', err));
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.createElement('button');
    installButton.innerText = 'Install EEE';
    installButton.classList.add('install-popup');
    document.body.appendChild(installButton);

    installButton.addEventListener('click', () => {
        installButton.style.display = 'none'; // Hide the button
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt.');
            } else {
                console.log('User dismissed the install prompt.');
            }
            deferredPrompt = null;
        });
    });
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully.');
    const installButton = document.querySelector('.install-popup');
    if (installButton) {
        installButton.remove();
    }
});

// Existing schedule functionality goes here...





const scheduleDiv = document.getElementById('schedule');
const semesterButton = document.getElementById('semesterButton');
const dayButton = document.getElementById('dayButton');
const dayMenu = document.getElementById('dayMenu');
const semesterModal = document.getElementById('semesterModal');
const roomButton = document.getElementById('roomButton');
const roomModal = document.getElementById('roomModal');
const teacherButton = document.getElementById('teacherButton');
const teacherModal = document.getElementById('teacherModal');

let selectedDay = getToday(); // Default to today's day
let selectedSemester = 'All'; // Default semester
let selectedRoom = 'All'; // Default to "All Rooms"
let selectedTeacher = 'All'; // Default to "All Teachers"

const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv';

// Update date and time
function updateDateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    document.getElementById('date-time').innerText = `${date} - ${time}`;
    document.getElementById('last-synced').innerText = `Last Synced: ${time}`;
}

// Get today's day in the format used in schedule (e.g., "Monday")
function getToday() {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[today.getDay()];
}

// Fetch schedule
function fetchSchedule() {
    fetch(sheetUrl)
        .then(response => response.text())
        .then(data => {
            scheduleDiv.innerHTML = '';
            const rows = data.split('\n');
            let isDark = true;
            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const cols = row.split('\t');
                if (cols.length < 8) return;
                // Filter by semester, day, room, and teacher
                if (
                    (selectedSemester === 'All' || cols[0].trim() === selectedSemester) &&
                    cols[1].trim() === selectedDay &&
                    (selectedRoom === 'All' || cols[5].trim() === selectedRoom) &&
                    (selectedTeacher === 'All' || cols[4].trim() === selectedTeacher)
                ) {
                    const scheduleContainer = document.createElement('div');
                    scheduleContainer.classList.add('schedule-container', isDark ? 'dark' : 'yellow');
                    scheduleContainer.innerHTML = `
                        <h3>Time: ${cols[2]}</h3>
                        <p>Course: ${cols[3]}</p>
                        <p>Teacher: ${cols[4]}</p>
                        <p>Room: ${cols[5]}</p>
                        <p>Semester: ${cols[0]}</p>
                        ${cols[6].trim() ? `<p>Special Note: ${cols[6]}</p>` : ''}
                        ${cols[7].trim() ? `<p><strong>Important Link:</strong> <a href="${cols[7]}" target="_blank">${cols[7]}</a></p>` : ''}
                    `;
                    scheduleDiv.appendChild(scheduleContainer);
                    isDark = !isDark; // Alternate colors
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Event Listeners
semesterButton.addEventListener('click', () => semesterModal.style.display = 'flex');
dayButton.addEventListener('click', () => {
    dayMenu.style.display = (dayMenu.style.display === 'none' || !dayMenu.style.display) ? 'flex' : 'none';
});
roomButton.addEventListener('click', () => roomModal.style.display = 'flex');
teacherButton.addEventListener('click', () => teacherModal.style.display = 'flex');

function selectDay(day) {
    selectedDay = day;
    dayButton.innerText = `Select Day: ${day}`;
    dayMenu.style.display = 'none';
    fetchSchedule();
}

function closeDayMenu() {
    dayMenu.style.display = 'none';
}

function selectSemester(semester) {
    selectedSemester = semester;
    semesterButton.innerText = `Select Semester: ${semester === 'All' ? 'All Semesters' : semester}`;
    semesterModal.style.display = 'none';
    fetchSchedule();
}

function closeModal() {
    semesterModal.style.display = 'none';
}

function selectRoom(room) {
    selectedRoom = room;
    roomButton.innerText = `Select Room: ${room === 'All' ? 'All Rooms' : room}`;
    roomModal.style.display = 'none';
    fetchSchedule();
}

function closeRoomModal() {
    roomModal.style.display = 'none';
}

function selectTeacher(teacher) {
    selectedTeacher = teacher;
    teacherButton.innerText = `Select Teacher: ${teacher === 'All' ? 'All Teachers' : teacher}`;
    teacherModal.style.display = 'none';
    fetchSchedule();
}

function closeTeacherModal() {
    teacherModal.style.display = 'none';
}

if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('update-sheet');
    }).catch(err => {
        console.error('Failed to register sync:', err);
    });
}



// Initialize
updateDateTime();
fetchSchedule();
setInterval(updateDateTime, 60000); // Update every minute
