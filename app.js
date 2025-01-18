const scheduleDiv = document.getElementById('schedule');
const semesterButton = document.getElementById('semesterButton');
const dayButton = document.getElementById('dayButton');
const dayMenu = document.getElementById('dayMenu');
const semesterModal = document.getElementById('semesterModal');
const roomButton = document.getElementById('roomButton');
const roomModal = document.getElementById('roomModal');

let selectedDay = getToday(); // Default to today's day
let selectedSemester = '4th'; // Default semester
let selectedRoom = 'All'; // Default to "All Rooms"

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
                if (cols[0].trim() === selectedSemester && cols[1].trim() === selectedDay) {
                    // Only show rows that match the selected room if it's not "All"
                    if (selectedRoom !== 'All' && cols[5].trim() !== selectedRoom) {
                        return; // Skip if room doesn't match selected one
                    }
                    const scheduleContainer = document.createElement('div');
                    scheduleContainer.classList.add('schedule-container', isDark ? 'dark' : 'yellow');
                    scheduleContainer.innerHTML = `
                        <h3>Time: ${cols[2]}</h3>
                        <p>Course: ${cols[3]}</p>
                        <p>Teacher: ${cols[4]}</p>
                        <p>Room: ${cols[5]}</p>
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
    dayMenu.style.display = (dayMenu.style.display === 'none' || !dayMenu.style.display) ? 'block' : 'none';
});
roomButton.addEventListener('click', () => roomModal.style.display = 'flex');

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
    semesterButton.innerText = `Select Semester: ${semester}`;
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

// Initialize
updateDateTime();
fetchSchedule();
setInterval(updateDateTime, 60000); // Update every minute
