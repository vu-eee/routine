


const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv'; // Replace with your actual Google Sheet URL

const dayButton = document.getElementById('filterDayButton');
const semesterButton = document.getElementById('filterSemesterButton');
const dayMenu = document.getElementById('dayMenu');
const semesterMenu = document.getElementById('semesterMenu');
const scheduleDiv = document.getElementById('schedule');

let selectedDay = 'Today'; // Default filter
let selectedSemester = 'All'; // Default filter

// Fetch and display schedule
function fetchSchedule(day = selectedDay, semester = selectedSemester) {
  fetch(sheetUrl)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
      return response.text();
    })
    .then((data) => {
      const rows = data.split('\n');
      scheduleDiv.innerHTML = ''; // Clear previous schedule

      let isDark = true;

      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const cols = row.split('\t');
        if (cols.length < 8) return;

        const semesterMatch =
          semester === 'All' || cols[0].trim() === semester;
        const dayMatch =
          day === 'Today'
            ? cols[1].trim() ===
              new Date().toLocaleString('en-US', { weekday: 'long' })
            : cols[1].trim() === day;

        if (semesterMatch && dayMatch) {
          const scheduleContainer = document.createElement('div');
          scheduleContainer.classList.add(
            'schedule-container',
            isDark ? 'dark' : 'yellow'
          );
          scheduleContainer.innerHTML = `
            <h3>Time: ${cols[2]}</h3>
            <p>Course: ${cols[3]}</p>
            <p>Teacher: ${cols[4]}</p>
            <p>Room: ${cols[5]}</p>
            ${
              cols[6].trim()
                ? `<p>Special Note: ${cols[6]}</p>`
                : ''
            }
            ${
              cols[7].trim()
                ? `<p><strong>Important Link:</strong> <a href="${
                    cols[7].trim()
                  }" target="_blank">${cols[7].trim().slice(0, 30)}...</a></p>`
                : ''
            }
          `;
          scheduleDiv.appendChild(scheduleContainer);
          isDark = !isDark; // Alternate between dark and yellow
        }
      });
    })
    .catch((error) => console.error('Error fetching or processing data:', error));
}

// Select Day
function selectDay(day) {
  selectedDay = day;
  dayButton.innerText = `Filter Day: ${day}`;
  dayMenu.style.display = 'none';
  fetchSchedule(selectedDay, selectedSemester);
}

// Select Semester
function selectSemester(semester) {
  selectedSemester = semester;
  semesterButton.innerText = `Filter Semester: ${semester}`;
  semesterMenu.style.display = 'none';
  fetchSchedule(selectedDay, selectedSemester);
}

// Generate Semester Menu
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

// Update date and time
function updateDateTime() {
  const now = new Date();
  document.getElementById('dateTime').innerText = now.toLocaleString();
}

// Example Semester List
const semesters = ['All', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'];
generateSemesterMenu(semesters);

// Event Listeners
dayButton.addEventListener('click', () => {
  dayMenu.style.display =
    dayMenu.style.display === 'none' || dayMenu.style.display === ''
      ? 'block'
      : 'none';
});

semesterButton.addEventListener('click', () => {
  semesterMenu.style.display =
    semesterMenu.style.display === 'none' || semesterMenu.style.display === ''
      ? 'block'
      : 'none';
});

// Initialize
updateDateTime();
fetchSchedule();
setInterval(updateDateTime, 60000);
