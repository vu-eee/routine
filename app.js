const scheduleDiv = document.getElementById('schedule');
const dayButton = document.getElementById('dayButton');
const dayMenu = document.getElementById('dayMenu');
const semesterDropdown = document.getElementById('semesterDropdown');

let selectedDay = 'Today'; // Default value is 'Today'
let selectedSemester = 'all'; // Default value to show all semesters

const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv';

// Update date and time
function updateDateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  document.getElementById('date-time').innerText = `${date} - ${time}`;
  document.getElementById('last-synced').innerText = `Last Synced: ${time}`;
}

// Fetch and filter schedule for selected day and semester
function fetchSchedule(day = selectedDay, semester = selectedSemester) {
  fetch(sheetUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      const rows = data.split('\n');
      scheduleDiv.innerHTML = ''; // Clear previous schedule
      let isDark = true;

      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const cols = row.split('\t');
        if (cols.length < 8) return;

        const rowSemester = cols[0].trim();
        const rowDay = cols[1].trim();
        const matchesDay = rowDay === day || (day === 'Today' && rowDay === new Date().toLocaleString('en-US', { weekday: 'long' }));
        const matchesSemester = semester === 'all' || rowSemester === semester;

        if (matchesDay && matchesSemester) {
          const scheduleContainer = document.createElement('div');
          scheduleContainer.classList.add('schedule-container', isDark ? 'dark' : 'yellow');
          scheduleContainer.innerHTML = `
            <h3>Time: ${cols[2]}</h3>
            <p>Course: ${cols[3]}</p>
            <p>Teacher: ${cols[4]}</p>
            <p>Room: ${cols[5]}</p>
            ${cols[6].trim() ? `<p>Special Note: ${cols[6]}</p>` : ''}
            ${cols[7].trim() ? `<p><strong>Important Link:</strong> <a href="${cols[7].trim()}" target="_blank" class="important-link">${cols[7].trim().slice(0, 30)}...</a></p>` : ''}
          `;
          scheduleDiv.appendChild(scheduleContainer);
          isDark = !isDark; // Alternate between dark and yellow backgrounds
        }
      });
    })
    .catch(error => console.error('Error fetching or processing data:', error));
}

// Select day and update the button text
function selectDay(day) {
  selectedDay = day;
  dayButton.innerText = `Select Day: ${day}`;
  dayMenu.style.display = 'none'; // Hide the menu after selection
  fetchSchedule(day, selectedSemester);
}

// Close the day menu
function closeDayMenu() {
  dayMenu.style.display = 'none';
}

// Event listener for semester dropdown
semesterDropdown.addEventListener('change', () => {
  selectedSemester = semesterDropdown.value;
  fetchSchedule(selectedDay, selectedSemester);
});

// Event listener to toggle day menu
dayButton.addEventListener('click', () => {
  dayMenu.style.display = dayMenu.style.display === 'none' ? 'block' : 'none';
});

// Initialize schedule and update date-time
updateDateTime();
fetchSchedule();
setInterval(updateDateTime, 60000); // Update every minute
