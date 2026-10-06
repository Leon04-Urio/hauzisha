(function () {
    // ---------- CONFIG ----------
    const BASE_API = window.BASE_API || "http://localhost/hauzisha/api/index.php";
    const tableSelector = "#storeTable"; 
    const reportContainerSelector = "#reportContent";
    const downloadReportBtnId = "downloadStoreReport";
  
    // ---------- UTIL ----------
    function safeFetch(url, opts = {}) {
      return fetch(url, opts).then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        return res.json();
      });
    }
  
    // ---------- DATATABLE SETUP ----------
    function initDataTable(tableEl) {
      if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.dataTable) {
        console.warn("DataTables not available.");
        return false;
      }
  
      const $table = $(tableEl);
  
      const dt = $table.DataTable({
        ajax: {
          url: `${BASE_API}/deleted-stores`,
          type: "GET",
          dataSrc: function (json) {
            if (!json) return [];
            if (Array.isArray(json.data)) return json.data;
            if (Array.isArray(json)) return json;
            return [];
          }
        },
        columns: [
          {
            data: "logo_image",
            render: function (data) {
              let image;
              if (!data) {
                image = "../images/male_cv.jpg"; // fallback
              } else if (data.startsWith("http")) {
                image = data;
              } else {
                data = data.replace(/^\/+/, "");
                let parts = data.split("/");
                let fileName = encodeURIComponent(parts.pop());
                let filePath = parts.join("/");
                image = `http://localhost/hauzisha/${filePath}/${fileName}`;
              }
              return `<img src="${image}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" alt="Store">`;
            }
          },                       
          { data: "id" },
          { data: "name" },
          { data: "website" },
          { data: "contact_email" },
          { data: "contact_phone" },
          {
            data: "is_deleted",
            render: s => s == 1
              ? '<span class="badge" style="background:red ;color:#fff;">Deleted</span>'
              : '<span class="badge" style="background:#ffd700;color:#000;">Active</span>'
          },
          {
            data: null,
            orderable: false,
            searchable: false,
            render: function (row) {
              const id = row.id;
              return `
                <button class="btn btn-sm btn-outline-dark me-1 view-btn" data-id="${id}" title="View/Edit">
                  <i class="fas fa-eye" style="color:cyan;"></i>
                </button>
                <button class="btn btn-sm btn-outline-dark delete-btn" data-id="${id}" title="Delete">
                  <i class="fas fa-trash" style="color:red;"></i>
                </button>`;
            }
          }
        ],
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
        responsive: true,
        processing: true,
        pageLength: 6
      });
  
      // View/Edit
      $table.on('click', '.view-btn', function () {
        const id = $(this).data('id');
        fetch(`${BASE_API}/store/${id}`)
        .then(res => res.json())
        .then(res => {
          if (!res.success) {
            alert("Failed to fetch store: " + (res.message || "Unknown error"));
            return;
          }
          const store = res.data;
  
          const form = document.getElementById("editStoreForm");
          if (!form) return;
  
          form.dataset.id = id;
          const idInput = form.querySelector('input[name="id"]');
          if (idInput) {
              idInput.value = id;
          }
  
          // populate rest
          form.querySelector('input[name="name"]').value = store.name || "";
          form.querySelector('input[name="website"]').value = store.website || "";
          form.querySelector('input[name="contact_email"]').value = store.contact_email || "";
          form.querySelector('input[name="contact_phone"]').value = store.contact_phone || "";
  
          $("#editStoreModal").modal("show");
        })
        .catch(err => {
          console.error("Error fetching store:", err);
          alert("Error fetching store.");
        });
      });
  
      // Delete
      $table.on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (!confirm("Delete this store?")) return;
        fetch(`${BASE_API}/delete-store/${id}`, { method: "POST" })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert("Store deleted.");
            dt.ajax.reload(null, false);
          } else {
            alert("Delete failed: " + res.message);
          }
        })
        .catch(err => console.error("Delete failed:", err));
      });
  
      return dt;
    }
  
    // ---------- CHARTS & REPORTS ----------
    function fetchStoreDataAndRender() {
      safeFetch(`${BASE_API}/deleted-stores`)
        .then(json => {
          const items = Array.isArray(json.data) ? json.data : [];
          renderReports(items);
        })
        .catch(err => {
          console.error("Failed to fetch stores for charts:", err);
        });
    }
  
    function renderReports(items) {
        const total = items.length;
      
        if (document.getElementById('totalStores')) {
          document.getElementById('totalStores').textContent = total;
        }
      
        // Count by date (for line chart)
        const byDate = {};
        items.forEach(row => {
          const date = (row.created_at || "").split(' ')[0];
          if (!date) return;
          byDate[date] = (byDate[date] || 0) + 1;
        });
      
        // Count active vs deleted (for bar chart)
        const statusCounts = { Active: 0, Deleted: 0 };
        items.forEach(row => {
          if (row.is_deleted == 0) statusCounts.Active++;
          else if (row.is_deleted == 1) statusCounts.Deleted++;
        });
      
        if (window.Chart) {
          try {
            // Line chart: stores over time
            const ctx = document.getElementById('storesOverTimeChart');
            if (ctx) {
              const labels = Object.keys(byDate).sort();
              const data = labels.map(l => byDate[l]);
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels,
                  datasets: [{
                    label: 'Stores added',
                    data,
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255,215,0,0.15)',
                    fill: true
                  }]
                },
                options: { responsive: true, maintainAspectRatio: false }
              });
            }
      
            // Bar chart: active vs deleted
            const ctx2 = document.getElementById('storesStatusChart');
            if (ctx2) {
              new Chart(ctx2, {
                type: 'bar',
                data: {
                  labels: Object.keys(statusCounts),
                  datasets: [{
                    label: 'Store Status',
                    data: Object.values(statusCounts),
                    backgroundColor: ['#282828', 'red']
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true }
                  }
                }
              });
            }
      
          } catch (err) {
            console.error('Chart rendering error', err);
          }
        }
    } 
  
    // ---------- PDF REPORT ----------
    function setupPdfButton() {
      const btn = document.getElementById(downloadReportBtnId);
      if (!btn) return;
  
      btn.addEventListener('click', () => {
        const report = document.querySelector(reportContainerSelector);
        if (!report) return alert("Report section not found.");
  
        if (!window.html2canvas || !window.jspdf) {
          alert("PDF export requires html2canvas and jsPDF.");
          return;
        }
  
        html2canvas(report, { scale: 2, useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgProps = pdf.getImageProperties(imgData);
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('stores-report.pdf');
        });
      });
    }
  
    // ---------- INIT ----------
    function init() {
      const tableEl = document.querySelector(tableSelector) || document.querySelector('table.table');
      if (tableEl) {
        const dt = initDataTable(tableEl);
        if (!dt) console.warn("Stores DataTable failed to init.");
      }
  
      fetchStoreDataAndRender();
  
      fetch(`${BASE_API}/store-kpis`)
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            const d = res.data;
            $("#kpiTotalStores").text(d.total);
            $("#kpiActiveStores").text(d.active);
            $("#kpiDeletedStores").text(d.deleted);
            
            $("#kpiNewStoresThisMonth").text(d.newThisMonth);
            $("#kpiNewStoresThisMonth2").text(d.newThisMonth);
      
            $("#kpiActiveStoresPercent").text(d.activePercent + "%");
            $("#kpiNewStoresPercent").text(d.newPercent + "%");
          }
        })
        .catch(err => console.error("Failed to fetch store KPIs:", err));
  
      setupPdfButton();
    }
  
    $(document).ready(function () {
      // Add Store
      $("#addStoreForm").on("submit", function (e) {
        e.preventDefault();
        let formData = new FormData(this);
  
        fetch(`${BASE_API}/create-store`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert("Store added successfully!");
            $("#addStoreModal").modal("hide");
            if ($.fn.DataTable.isDataTable('#storeTable')) {
              $("#storeTable").DataTable().ajax.reload();
            }
          } else {
            alert("Failed: " + (res.message || "Unknown error"));
          }
        })
        .catch(err => {
          console.error("Add store error", err);
          alert("Error adding store.");
        });
      });
  
      // Edit Store
      $("#editStoreForm").on("submit", function (e) {
        e.preventDefault();
        const id = this.dataset.id;
        if (!id) {
          alert("No store ID.");
          return;
        }
        let formData = new FormData(this);
  
        fetch(`${BASE_API}/store-update/${id}`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert("Store updated successfully!");
            $("#editStoreModal").modal("hide");
            if ($.fn.DataTable.isDataTable('#storeTable')) {
              $("#storeTable").DataTable().ajax.reload(null, false);
            }
          } else {
            alert("Update failed: " + (res.message || "Unknown error"));
          }
        })
        .catch(err => {
          console.error("Update error:", err);
          alert("Error updating store.");
        });
      });
    });
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();  