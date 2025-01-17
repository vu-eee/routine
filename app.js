
  
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLX2Q6ueX38WbATebZ2r8j2AuIgS2TOxcnGkk5WWwnGq5CITy09fDou81Bw9LB6yq9HxUDKqNj5vXT/pub?output=tsv'; // Replace with your actual Google Sheet URL

const dayButton = document.getElementById('filterDayButton');
const semesterButton = document.getElementById('filterSemesterButton');
const dayMenu = document.getElementById('dayMenu');
const scheduleDiv = document.querySelector('.main-content');

let selectedDay = 'Today'; // Default filter
let selectedSemester = 'All'; // Default filter
let semesters = []; // To dynamically generate semester options

// Fetch and display schedule
function fetchSchedule(day = selectedDay, semester = selectedSemester) {
  fetch(sheetUrl)
    .then((response) => response.text())
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

      // Populate semester options dynamically
      if (semesters.length === 0) {
        const uniqueSemesters = [...new Set(rows.slice(1).map(row => row.split('\t')[0].trim()))];
        uniqueSemesters.sort((a, b) => {
          // Sort by numerical order (1st, 2nd, 3rd, etc.)
          const orderA = parseInt(a) || 0;
          const orderB = parseInt(b) || 0;
          return orderA - orderB;
        });
        uniqueSemesters.unshift('All'); // Add 'All' option at the beginning
        semesters = uniqueSemesters;
        generateSemesterMenu();
      }
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
  closeSemesterMenu();
  fetchSchedule(selectedDay, selectedSemester);
}

// Generate Semester Menu
function generateSemesterMenu() {
  const semesterMenu = document.createElement('div');
  semesterMenu.id = 'semesterMenu';
  semesterMenu.style.display = 'none';
  semesterMenu.style.position = 'absolute';
  semesterMenu.style.backgroundColor = '#444';
  semesterMenu.style.color = '#fff';
  semesterMenu.style.borderRadius = '10px';
  semesterMenu.style.padding = '10px';
  semesterMenu.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.5)';
  semesterMenu.style.width = '30%';
  semesterMenu.style.zIndex = '10';

  semesters.forEach((semester) => {
    const btn = document.createElement('button');
    btn.textContent = semester;
    btn.style.display = 'block';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.color = '#fff';
    btn.style.padding = '5px 10px';
    btn.style.cursor = 'pointer';
    btn.style.width = '100%';
    btn.addEventListener('click', () => selectSemester(semester));
    semesterMenu.appendChild(btn);
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#fff';
  closeBtn.style.padding = '5px 10px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.width = '100%';
  closeBtn.addEventListener('click', closeSemesterMenu);
  semesterMenu.appendChild(closeBtn);

  document.body.appendChild(semesterMenu);

  semesterButton.addEventListener('click', () => {
    semesterMenu.style.display =
      semesterMenu.style.display === 'none' || semesterMenu.style.display === ''
        ? 'block'
        : 'none';
  });
}

// Close Semester Menu
function closeSemesterMenu() {
  const semesterMenu = document.getElementById('semesterMenu');
  if (semesterMenu) {
    semesterMenu.style.display = 'none';
  }
}

// Initialize
fetchSchedule();
setInterval(() => {
  const now = new Date();
  document.querySelector('.header p').innerText = now.toLocaleString();
}, 60000);
