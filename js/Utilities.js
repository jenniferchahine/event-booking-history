// Filter events by date and/or category
function filterEvents(events, date, category) {
  return events.filter(event => {
    const matchesDate = date ? event.date === date : true;
    const matchesCategory = category ? event.category === category : true;
    return matchesDate && matchesCategory;
  });
}

// Save booking to localStorage
function saveBookingToStorage(booking) {
  const history = JSON.parse(localStorage.getItem('bookings') || '[]');
  history.push(booking);
  localStorage.setItem('bookings', JSON.stringify(history));
}

// Retrieve booking history from localStorage
function getBookingHistory() {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Export bookings as CSV file
function exportBookingsAsCSV() {
  const bookings = getBookingHistory();

  if (!bookings.length) {
    alert("No bookings to export.");
    return;
  }

  const header = "Name,Email,Event,Date\n";

  // ✅ FIXED: Use backticks `...` for template literals inside map()
  const rows = bookings.map(b => `${b.name},${b.email},${b.eventName},${b.date}`).join("\n");
  const csv = header + rows;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "booking-history.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Format date into readable string
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
