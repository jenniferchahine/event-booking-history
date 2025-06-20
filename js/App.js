

let events = [];
fetch("data/events.json")
  .then(res => res.json())
  .then(data => {
    events = data;
    initApp();
  })
  .catch(err => {
    console.error("Error loading events", err);
    document.getElementById("eventContainer").innerHTML =
      `<p class="text-red-500">Failed to load events.</p>`;
  });


  

function initApp() {
  const tabs = {
    events: document.getElementById("tab-events"),
    users: document.getElementById("tab-users"),
    history: document.getElementById("tab-history")
  };
  const sections = {
    events: document.getElementById("eventsSection"),
    users: document.getElementById("bookedUsersSection"),
    history: document.getElementById("historySection")
  };
  const controls = document.getElementById("eventControls");
  const filterDate = document.getElementById("filterDate");
  const filterCategory = document.getElementById("filterCategory");
  const searchInput = document.getElementById("searchInput");
  const toggleViewBtn = document.getElementById("toggleViewBtn");
  const container = document.getElementById("eventContainer");
  let currentView = "card";

  function showSection(name) {
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));

    Object.values(tabs).forEach(btn => btn.classList.remove("bg-blue-200"));
    tabs[name].classList.add("bg-blue-200");
    sections[name].classList.remove("hidden");
    controls.style.display = (name === "events") ? "" : "none";
    if (name === "users") loadBookedUsers();
    if (name === "history") loadHistory();
  }

  tabs.events.addEventListener("click", () => showSection("events"));
  tabs.users.addEventListener("click", () => showSection("users"));
  tabs.history.addEventListener("click", () => showSection("history"));

  filterDate.addEventListener("change", renderEvents);
  filterCategory.addEventListener("change", renderEvents);
  searchInput.addEventListener("input", renderEvents);

toggleViewBtn.addEventListener("click", () => {
  const eventsSection = document.getElementById("eventsSection");
  const calendarSection = document.getElementById("calendarSection");

  if (currentView === "card") {
    currentView = "calendar";
    eventsSection.classList.add("hidden");
    calendarSection.classList.remove("hidden");
    toggleViewBtn.textContent = "Switch to Card View";
    renderCalendar();
  } 
  else if (currentView === "calendar") {
    currentView = "card";
    calendarSection.classList.add("hidden");
    eventsSection.classList.remove("hidden");
    toggleViewBtn.textContent = "Switch to Calendar View";
    renderEvents();
  }
});


 
  showSection("events");
  renderEvents();

  function renderEvents() {
    container.innerHTML = "";
    const query = searchInput.value.trim().toLowerCase();
    const filtered = events.filter(e => {
      return (!filterDate.value || e.date === filterDate.value) &&
             (!filterCategory.value || e.category === filterCategory.value) &&
             (!query || e.name.toLowerCase().includes(query) || e.description.toLowerCase().includes(query));
    });

    if (!filtered.length) {
      container.innerHTML = `<p class="text-gray-500">No events found.</p>`;
      return;
    }

    if (currentView === "card") {
      container.className = "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4";
      filtered.forEach(e => {
        const card = document.createElement("div");
        card.className = "bg-white dark:bg-gray-800 rounded-lg overflow-hidden event-card shadow flex flex-col";
        card.innerHTML = `
          <img src="${e.Image}" alt="${e.name}" class="w-full h-48 object-cover" />
          <div class="p-4 flex flex-col flex-grow">
            <h2 class="text-xl font-semibold mb-1">${e.name}</h2>
            <p class="text-sm text-gray-500">${e.date} • ${e.location}</p>
            <p class="text-sm text-blue-600">${e.category}</p>
            <p class="text-sm flex-grow">${e.description}</p>
            <button class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded book-btn" data-id="${e.id}">Book Now</button>
          </div>`;
        container.appendChild(card);
      });
    } else {
      container.className = "space-y-4 p-4";
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(e => {
        const row = document.createElement("div");
        row.className = "bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-start";
        row.innerHTML = `
          <div>
            <h3 class="text-lg font-bold">${e.name}</h3>
            <p>${e.date} • ${e.category} • ${e.location}</p>
          </div>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded book-btn" data-id="${e.id}">Book</button>`;
        container.appendChild(row);
      });
    }

    document.querySelectorAll(".book-btn").forEach(btn => {
      btn.addEventListener("click", () => openBookingModal(+btn.dataset.id));
    });
  }

  // Modal and booking
  window.openBookingModal = function(eventId) {
    const e = events.find(ev => ev.id === eventId);
    const modal = document.getElementById("modalContainer");
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-white-800 p-6 rounded-lg w-11/12 max-w-md">
          <h2 class="text-xl font-bold mb-4">Book now: ${e.name}</h2>
          <input id="name" type="text" placeholder="Your Name" class="w-full p-2 mb-3 border rounded" />
          <input id="email" type="email" placeholder="Your Email" class="w-full p-2 mb-4 border rounded" />
          <div class="flex justify-end gap-3">
            <button onclick="closeModal()" class="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
            <button onclick="submitBooking(${e.id})" class="bg-green-600 text-white px-4 py-2 rounded">Confirm</button>
          </div>
        </div>
      </div>`;
  };

  window.closeModal = function() {
    document.getElementById("modalContainer").innerHTML = "";
  };

  window.submitBooking = function(eventId) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
     if (!name || !email) return alert("Fill in all fields");
    if (!email.includes("@")) return alert("Enter a valid email address");
    if (name.length < 3) return alert("Name must be at least 3 characters");
    if (email.length < 5) return alert("Email must be at least 5 characters");
   

    const e = events.find(ev => ev.id === eventId);
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push({ id: Date.now(), name, email, eventName: e.name, date: e.date });
    localStorage.setItem("bookings", JSON.stringify(bookings));
    alert("Booking Confirmed!");
    closeModal();
  };

  window.approveBooking = function(index) {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const entry = bookings.splice(index, 1)[0];
    localStorage.setItem("bookings", JSON.stringify(bookings));

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(entry);
    localStorage.setItem("history", JSON.stringify(history));

    loadBookedUsers();
  };

  function loadBookedUsers() {
    const list = document.getElementById("bookedUserList");
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    list.innerHTML = bookings.length
      ? ""
      : `<p class="text-gray-500">No bookings found.</p>`;
    bookings.forEach((b, i) => {
      const div = document.createElement("div");
      div.className = "p-3 bg-gray-100 event-card dark:bg-gray-700 rounded flex justify-between items-center";
      div.innerHTML = `
        <div><strong>${b.name}</strong> (${b.email})<br /><span class="text-sm">${b.eventName} — ${b.date}</span></div>
        <button class="bg-green-600 text-white px-3 py-1 rounded" onclick="approveBooking(${i})">Approve</button>`;
      list.appendChild(div);
    });
  }

  function loadHistory() {
    const list = document.getElementById("historyList");
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    list.innerHTML = history.length
      ? ""
      : `<p class="text-gray-500">No history found.</p>`;
    history.forEach(b => {
      const div = document.createElement("div");
      div.className = "p-2 bg-white dark:bg-gray-800 event-card rounded shadow";
      div.textContent = `${b.name} — ${b.eventName} @ ${b.date}`;
      list.appendChild(div);
    });
  }

  document.getElementById("exportHistoryBtn").addEventListener("click", () => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    if (!history.length) return alert("No history to export.");

    const csv = [
      `"Name","Email","Event","Date"`,
      ...history.map(b =>
        `"${b.name}","${b.email}","${b.eventName}","${b.date}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booking_history.csv";
    a.click();
  });
}

// Theme toggle
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const root = document.documentElement;

  // Set default theme to light if nothing saved
  const storedTheme = localStorage.getItem("theme") || "light";
  if (storedTheme === "dark") {
    root.classList.add("dark");
    themeIcon.textContent = "Light Mode";
  } else {
    root.classList.remove("dark");
    themeIcon.textContent = "Dark Mode";
  }

  // Toggle on click
  themeToggle.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeIcon.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
});



themeToggle.addEventListener("click", () => {
  const isDark = !document.documentElement.classList.contains("dark");
  setTheme(isDark);
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const preferslight = savedTheme === "light" || (!savedTheme && window.matchMedia("(prefers-color-scheme: light)").matches);
  setTheme(preferslight);
});
const sidebar = document.getElementById("sidebar");
const peekToggle = document.getElementById("peekToggle");
const sidebarToggle = document.getElementById("sidebarToggle");



peekToggle.addEventListener("click", () => {
  sidebar.classList.remove("hidden");
  sidebar.classList.remove("-translate-x-full");
  sidebar.classList.add("translate-x-0");
  document.body.classList.add("no-scroll");
  peekToggle.classList.add("hidden");
});




sidebarToggle?.addEventListener("click", () => {
  sidebar.classList.remove("translate-x-0");
  sidebar.classList.add("-translate-x-full");
  document.body.classList.remove("no-scroll");

 
  setTimeout(() => {
    sidebar.classList.add("hidden");
    peekToggle.classList.remove("hidden"); 
  }, 0); 
});




function renderCalendar() {
  const container = document.getElementById("calendarGrid");
  if (!container) return;
  container.innerHTML = "";

  const startHour = 8, endHour = 20, hours = endHour - startHour;


  for (let row = 0; row < hours; row++) {
    const hourLabel = document.createElement("div");
    hourLabel.className = "calendar-cell text-xs p-1";
    hourLabel.textContent = `${startHour + row}:00`;
    container.appendChild(hourLabel);

    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      container.appendChild(cell);
    }
  }

  if (!Array.isArray(events)) return;

  events.forEach(ev => {
    const date = new Date(ev.date);
    const day = date.getDay(); 

    const hr = date.getHours();
    if (hr < startHour || hr >= endHour) return;

    const gridRow = hr - startHour;
    const index = (gridRow * 8) + day + 1;
    const eventCell = container.children[index];

    const titleEv = document.createElement("div");
    titleEv.className = "calendar-event";
    titleEv.textContent = ev.name;
    titleEv.addEventListener("click", () => {
      const modal = document.getElementById("modalContainer");
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 max-w-md">
            <h2 class="text-xl font-bold mb-4">${ev.name}</h2>
            <p class="mb-4">${ev.description}</p>
            <div class="flex justify-end gap-3">
              <button onclick="closeModal()" class="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      `;
      modal.classList.remove("hidden");

    });
    eventCell.appendChild(titleEv);
  });
}


document.getElementById("toggleViewBtn").addEventListener("click", () => {
  const eventsSection = document.getElementById("eventsSection");
  const calendarSection = document.getElementById("calendarSection");
  const toggleViewBtn = document.getElementById("toggleViewBtn");
 if (eventsSection.classList.contains("hidden")) {
    eventsSection.classList.remove("hidden");
    calendarSection.classList.add("hidden");
    toggleViewBtn.textContent = "Switch to Calendar View";
  } else {

    eventsSection.classList.add("hidden");
    calendarSection.classList.remove("hidden");
   toggleViewBtn.textContent = "Switch to Calendar View";

    renderMonthView();


  }

 
  const tabUsers = document.getElementById("tab-users");
  const tabHistory = document.getElementById("tab-history");
  const tabEvents = document.getElementById("tab-events");
  
  tabUsers.addEventListener("click", () => {
    eventsSection.classList.add("hidden");
    calendarSection.classList.add("hidden");

  });
  tabHistory.addEventListener("click", () => {
    eventsSection.classList.add("hidden");
    calendarSection.classList.add("hidden");

  });
  tabEvents.addEventListener("click", () => {
    if (calendarSection.classList.contains("hidden")) {
      toggleViewBtn.textContent = "Switch to Calendar View";
    }
    calendarSection.classList.remove("hidden");
    eventsSection.classList.remove("hidden");
    calendarSection.classList.add("hidden");
  });
  
});



const monthGrid = document.getElementById("monthGrid");
const monthLabel = document.getElementById("monthLabel");
let currentDate = new Date(); 

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMonthView();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderMonthView();
};

function renderMonthView() {
  monthGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay(); 

  monthLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${year}`;

  const totalCells = startDay + lastDate;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "border min-h-[80px] p-2 relative bg-black dark:bg-gray-900";

    if (i >= startDay) {
      const dayNum = i - startDay + 1;
      cell.innerHTML = `<div class="text-sm font-bold mb-1">${dayNum}</div>`;
      cell.dataset.date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    }

    monthGrid.appendChild(cell);
  }

  loadEventsIntoMonth();
}

 function loadEventsIntoMonth() {
  fetch("data/events.json")
    .then(res => res.json())
    .then(events => {
      for (const event of events) {
        const dateStr = event.date;
        const cell = [...monthGrid.children].find(div => div.dataset.date === dateStr);
        if (cell) {
          const eventDiv = document.createElement("div");
          
          eventDiv.className = "calendar-event bg-blue-500 text-white text-xs rounded mt-1 p-1 truncate";
          eventDiv.setAttribute("data-id", event.id);
          eventDiv.setAttribute("data-tippy-content", `${event.name}\n${event.description}`);
        eventDiv.textContent = event.name; 
eventDiv.setAttribute("data-full-name", event.name); 
eventDiv.title = event.name; 

          cell.appendChild(eventDiv);
        }
      }

        tippy('[data-tippy-content]', {
        arrow: false,
        animation: 'fade',
        duration: 200,
        delay: [200, 0],
        theme: 'light-border',
        placement: 'auto',
        interactive: true,
        appendTo: () => document.body,
        content(reference) {
          const eventName = reference.getAttribute('data-full-name');
          const eventDesc = reference.getAttribute('data-tippy-content').split('\n')[1];
          return `<div class="text-sm">${eventName}<br/><span class="text-xs text-gray-600 ">${eventDesc}</span></div>`;
        },
      });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  
  renderMonthView();
});


document.addEventListener("click", ({ target }) => {
  if (target.classList.contains("calendar-event")) {
    const eventId = target.dataset.id;
    openBookingModal(+eventId);

  }
});


