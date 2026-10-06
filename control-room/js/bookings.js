(function () {
  const BASE_API = window.BASE_API || "http://localhost/hauzisha/api/index.php";
  const tableSelector = "#bookingTable";

  function safeFetch(url, opts = {}) {
    return fetch(url, opts).then(res => {
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      return res.json();
    });
  }

  // ---------- DATATABLE ----------
  function initDataTable(tableEl) {
    if (!window.jQuery || !$.fn.dataTable) return false;

    const $table = $(tableEl);
    const dt = $table.DataTable({
      ajax: {
        url: `${BASE_API}/all-bookings`,
        type: "GET",
        dataSrc: json => Array.isArray(json.data) ? json.data : json
      },
      columns: [
        { data: "id" },
        {
          data: null,
          render: row => `${row.firstname} ${row.lastname}`
        },
        { data: "property_title" },
        { data: "email" },
        { data: "phone" },
        { data: "booking_date" },
        {
          data: "status",
          render: s => {
            if (s === "pending") return '<span class="badge text-dark" style="background: #ffd700;">Pending</span>';
            if (s === "confirmed") return '<span class="badge text-dark" style="background: cyan">Confirmed</span>';
            if (s === "cancelled") return '<span class="badge text-white" style="background: red;">Cancelled</span>';
            return s;
          }
        },
        { data: "created_at" },
        {
          data: null,
          orderable: false,
          searchable: false,
          render: row => {
            let actions = "";
            const id = row.id;
        
            if (row.status === "pending") {
              actions += `<button class="btn btn-sm btn-outline-dark confirm-btn me-1" data-id="${id}" title="Confirm">
                            <i class="fas fa-check" style="color:cyan;"></i>
                          </button>`;
              actions += `<button class="btn btn-sm btn-outline-dark cancel-btn" data-id="${id}" title="Cancel">
                            <i class="fas fa-times" style="color:red;"></i>
                          </button>`;
            } 
            else if (row.status === "confirmed") {
              actions += `<button class="btn btn-sm btn-outline-dark pending-btn me-1" data-id="${id}" title="Revert to Pending">
                            <i class="fas fa-arrow-left" style="color:orange;"></i>
                          </button>`;
              actions += `<button class="btn btn-sm btn-outline-dark cancel-btn" data-id="${id}" title="Cancel">
                            <i class="fas fa-times" style="color:red;"></i>
                          </button>`;
            } 
            else if (row.status === "cancelled") {
              actions += `<button class="btn btn-sm btn-outline-dark confirm-btn me-1" data-id="${id}" title="Confirm">
                            <i class="fas fa-check" style="color:cyan;"></i>
                          </button>`;
              actions += `<button class="btn btn-sm btn-outline-dark pending-btn" data-id="${id}" title="Revert to Pending">
                            <i class="fas fa-arrow-left" style="color:orange;"></i>
                          </button>`;
            }
        
            return actions;
          }      
        }
      ],
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
      responsive: true,
      processing: true,
      pageLength: 10
    });

    // Event Handlers
    $table.on("click", ".pending-btn", function () {
      const id = $(this).data("id");
      if (!confirm("Revert this booking to pending?")) return;
      updateBookingStatus(id, "pending").then(() => dt.ajax.reload(null, false));
    });

    $table.on("click", ".confirm-btn", function () {
      const id = $(this).data("id");
      if (!confirm("Confirm this booking?")) return;
      updateBookingStatus(id, "confirmed").then(() => dt.ajax.reload(null, false));
    });

    $table.on("click", ".cancel-btn", function () {
      const id = $(this).data("id");
      if (!confirm("Cancel this booking?")) return;
      updateBookingStatus(id, "cancelled").then(() => dt.ajax.reload(null, false));
    });

    return dt;
  }

  function updateBookingStatus(id, status) {
    return safeFetch(`${BASE_API}/change-booking-status/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then(r => {
      if (!r.success) throw new Error(r.message || "Failed to update booking.");
      return r;
    });
  }

  // ---------- KPI + CHARTS ----------
  function fetchDataAndRender() {
    Promise.all([
      safeFetch(`${BASE_API}/all-bookings`),
      safeFetch(`${BASE_API}/booking-kpis`)
    ]).then(([bookingsJson, kpisJson]) => {
      const items = Array.isArray(bookingsJson.data) ? bookingsJson.data : [];
      const kpis = kpisJson.success ? kpisJson.data : {};
      renderReports(items, kpis);
    }).catch(err => console.error("Fetch error:", err));
  }

  function renderReports(items, kpis = {}) {
    // KPI cards
    document.getElementById("kpiTotal").textContent = kpis.total ?? 0;
    document.getElementById("kpiNewThisMonth").textContent = kpis.newThisMonth ?? 0;
    document.getElementById("kpiConfirmed").textContent = kpis.confirmed ?? 0;
    document.getElementById("kpiConfirmedPercent").textContent = kpis.confirmedPercent ?? 0;
    document.getElementById("kpiPending").textContent = kpis.pending ?? 0;
    document.getElementById("kpiCancelled").textContent = kpis.cancelled ?? 0;

    if (window.Chart) {
      // Bookings Over Time
      const byDate = {};
      items.forEach(b => {
        const date = (b.created_at || "").split(" ")[0];
        if (date) byDate[date] = (byDate[date] || 0) + 1;
      });
      const boverCtx = document.getElementById("bookingsOverTimeChart");
      if (boverCtx) {
        new Chart(boverCtx, {
          type: "line",
          data: {
            labels: Object.keys(byDate).sort(),
            datasets: [{
              label: "Bookings",
              data: Object.keys(byDate).sort().map(d => byDate[d]),
              borderColor: "#ffd700",
              backgroundColor: "rgba(255,215,0,0.15)",
              fill: true,
              tension: 0.2
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // Bookings by Property
      const propertyCounts = {};
      items.forEach(b => propertyCounts[b.property_title || "Unknown"] = (propertyCounts[b.property_title] || 0) + 1);
      const propertyCtx = document.getElementById("bookingStatusChart");
      if (propertyCtx) {
        new Chart(propertyCtx, {
          type: "bar",
          data: {
            labels: Object.keys(propertyCounts),
            datasets: [{
              data: Object.values(propertyCounts),
              backgroundColor: ["#282828"]
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  }

  // ---------- INIT ----------
  function init() {
    const tableEl = document.querySelector(tableSelector);
    if (tableEl) initDataTable(tableEl);
    fetchDataAndRender();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();  