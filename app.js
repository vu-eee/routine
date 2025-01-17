const scheduleDiv = document.getElementById('schedule');
const semesterButton = document.getElementById('semesterButton');
const dayButton = document.getElementById('dayButton');
const dayMenu = document.getElementById('dayMenu');
const semesterMenu = document.getElementById('semesterMenu');

let selectedDay = 'Today'; // Default value is 'Today'
let selectedSemester = 'All'; // Default semester filter is 'All'

const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv';

// Update date and time
function updateDateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  const dateTimeString = `${date} - ${time}`;
  document.getElementById('date-time').innerText = dateTimeString;
  document.getElementById('last-synced').innerText = `Last Synced: ${time}`;
}

// Fetch schedule for selected day and semester
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

        // Filter based on both selected semester and day
        const semesterMatch = semester === 'All' || cols[0].trim() === semester;
        const dayMatch = day === 'Today'
          ? cols[1].trim() === new Date().toLocaleString('en-US', { weekday: 'long' })
          : cols[1].trim() === day;

        if (semesterMatch && dayMatch) {
          const scheduleContainer = document.createElement('div');
          scheduleContainer.classList.add('schedule-container', isDark ? 'dark' : 'yellow');
          scheduleContainer.innerHTML = `
            <h3>Time: ${cols[2]}</h3>
            <p>Course: ${cols[3]}</p>
            <p>Teacher: ${cols[4]}</p>
            <p>Room: ${cols[5]}</p>
            ${cols[6].trim() ? `<p>Special Note: ${cols[6]}</p>` : ''}
            ${cols[7].trim() ? `<p><strong>Important Link:</strong> <a href="${cols[7].trim()}" target="_blank">${cols[7].trim().slice(0, 30)}...</a></p>` : ''}
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
  fetchSchedule(day);
}

// Open semester menu
function generateSemesterMenu(semesters) {
  semesterMenu.innerHTML = '';
  semesters.forEach((semester) => {
    const btn = document.createElement('button');
    btn.textContent = semester;
    btn.onclick = () => selectSemester(semester);
    semesterMenu.appendChild(btn);
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => (semesterMenu.style.display = 'none');
  semesterMenu.appendChild(closeBtn);
}

// Select semester
function selectSemester(semester) {
  selectedSemester = semester;
  semesterButton.innerText = `Filter Semester: ${semester}`;
  semesterMenu.style.display = 'none';
  fetchSchedule(selectedDay, selectedSemester);
}

// Example semester list
const semesters = ['All', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];
generateSemesterMenu(semesters);

// Event listener to open semester menu
semesterButton.addEventListener('click', () => {
  semesterMenu.style.display = semesterMenu.style.display === 'none' || semesterMenu.style.display === '' ? 'block' : 'none';
});

// Event listener to open day menu
dayButton.addEventListener('click', () => {
  if (dayMenu.style.display === 'none' || dayMenu.style.display === '') {
    dayMenu.style.display = 'block';
  } else {
    dayMenu.style.display = 'none';
  }
});

// Close the day menu
function closeDayMenu() {
  dayMenu.style.display = 'none';
}

// Initialize schedule and update date-time
updateDateTime();
fetchSchedule();
setInterval(updateDateTime, 60000); // Update every minute
