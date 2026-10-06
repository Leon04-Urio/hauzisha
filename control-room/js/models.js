(function () {
  // ---------- CONFIG ----------
  const BASE_API = window.BASE_API || "http://localhost/hauzisha/api/index.php";
  const tableSelector = "#modelTable";

  // ---------- UTIL ----------
  function safeFetch(url, opts = {}) {
    return fetch(url, opts).then(res => {
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      return res.json();
    });
  }

  // ---------- DATATABLE SETUP ----------
  function initModelsDataTable(tableEl) {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.dataTable) {
      console.warn("DataTables not available.");
      return false;
    }

    const $table = $(tableEl);

    const dt = $table.DataTable({
      ajax: {
        url: `${BASE_API}/deleted-models`,
        type: "GET",
        dataSrc: json => {
          if (!json) return [];
          if (Array.isArray(json)) return json;
          if (Array.isArray(json.data)) return json.data;
          if (Array.isArray(json.items)) return json.items;
          return [];
        }
      },
      columns: [
        {
          data: "image",
          render: data => {
            if (!data) return '<span class="text-muted">No Image</span>';
            return `<img src="/hauzisha/${data}" alt="Thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">`;
          },
          orderable: false,
          searchable: false
        },        
        { data: "id" },
        { data: "name" },
        { data: "category" },
        { data: "material" },
        { data: "size" },
        { data: "units" },
        { data: "store_name" },
        { data: "price", render: d => (d ? "$" + Number(d).toLocaleString() : "-") },
        { data: "is_deleted", render: d => d == 1
          ? '<span class="badge" style="background: red; color: #fff;">Deleted</span>'
          : '<span class="badge" style="background: #ffd700; color: #000;">Active</span>'
        },
        { data: null, orderable: false, searchable: false,
          render: row => {
            const id = row.id;
            return `
              <button class="btn btn-sm btn-outline-dark me-1 view-btn" data-id="${id}" title="View/Edit">
                <i class="fas fa-eye text-info"></i>
              </button>
              <button class="btn btn-sm btn-outline-dark delete-btn" data-id="${id}" title="Delete">
                <i class="fas fa-trash" style="color: red;"></i>
              </button>
            `;
          }
        }
      ],
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      responsive: true,
      processing: true,
      pageLength: 6,
      createdRow: (row, data) => { row.dataset.modelId = data.id; }
    });

    // View/Edit
    $table.on("click", ".view-btn", function () {
      const id = $(this).data("id");
      safeFetch(`${BASE_API}/model/${id}`)
        .then(res => {
          if (!res.success) return alert("Failed to fetch model details.");
          const model = res.data;
          const form = document.getElementById("editModelForm");
          if (!form) return;
          form.dataset.id = id;
          form.name.value = model.name || "";
          form.description.value = model.description || "";
          form.size.value = model.size || "";
          form.material.value = model.material || "";
          form.units.value = model.units || "";
          form.seater.value = model.seater || "";
          form.price.value = model.price || "";
          form.purchase_link.value = model.purchase_link || "";
          form.category.value = model.category || "";
          form.cloud_link.value = model.cloud_link || "";
          form.store_id.value = model.store_id || "";
          form.in_stock.value = model.in_stock || "In Stock";

          const imgPreview = document.getElementById("currentImagePreview");
          if (imgPreview) imgPreview.src = model.image ? `/hauzisha/${model.image}` : "";

          $("#editModelModal").modal("show");
        }).catch(err => { console.error(err); alert("Error fetching model."); });
    });

    // Delete
    $table.on("click", ".delete-btn", function () {
      const id = $(this).data("id");
      if (!confirm("Delete this model?")) return;
      safeFetch(`${BASE_API}/delete-model/${id}`, { method: "POST" })
        .then(res => {
          if (res.success) {
            alert("Deleted!");
            dt.ajax.reload(null, false);
            fetchDataAndRender(); // refresh charts & KPIs
          } else alert("Delete failed: " + res.message);
        }).catch(err => console.error(err));
    });

    return dt;
  }

  // ---------- FORM SUBMISSIONS ----------
  function bindFormSubmissions() {
    $("#addModelForm").on("submit", function (e) {
      e.preventDefault();
      fetch(`${BASE_API}/create-model`, { method: "POST", body: new FormData(this) })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert("Model added successfully!");
            $("#addModelModal").modal("hide");
            if ($.fn.DataTable.isDataTable("#modelTable")) $("#modelTable").DataTable().ajax.reload();
            fetchDataAndRender();
          } else alert("Failed: " + (res.message || "Unknown error"));
        }).catch(err => { console.error(err); alert("Something went wrong."); });
    });

    $("#editModelForm").on("submit", function (e) {
      e.preventDefault();
      const id = this.dataset.id;
      if (!id) return alert("No model ID.");
      fetch(`${BASE_API}/model-update/${id}`, { method: "POST", body: new FormData(this) })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert("Model updated successfully!");
            $("#editModelModal").modal("hide");
            if ($.fn.DataTable.isDataTable("#modelTable")) $("#modelTable").DataTable().ajax.reload();
            fetchDataAndRender();
          } else alert("Update failed: " + (res.message || "Unknown error"));
        }).catch(err => { console.error(err); alert("Something went wrong."); });
    });
  }

  // ---------- CHARTS & KPIs ----------
  function fetchDataAndRender() {
    Promise.all([
      safeFetch(`${BASE_API}/models`),
      safeFetch(`${BASE_API}/model-kpis`)
    ]).then(([modelsJson, kpisJson]) => {
      const items = Array.isArray(modelsJson.data) ? modelsJson.data : [];
      const kpis = kpisJson.success ? kpisJson.data : {};
      renderReports(items, kpis);
    }).catch(err => console.error("Fetch error:", err));
  }

  function renderReports(items, kpis = {}) {
    // KPI cards
    document.getElementById('kpiTotal').textContent = kpis.total ?? 0;
    document.getElementById('kpiNewThisMonth').textContent = kpis.newThisMonth ?? 0;
    document.getElementById('kpiActive').textContent = kpis.inactive ?? 0;
    document.getElementById('kpiActivePercent').textContent = kpis.activePercent ?? 0;
    document.getElementById('kpiInactive').textContent = kpis.totalStores ?? 0;
    document.getElementById('kpiPending').textContent = kpis.pending ?? 0;
    document.getElementById('kpiNewThisMonth2').textContent = kpis.newThisMonth ?? 0;
    document.getElementById('kpiNewPercent').textContent = kpis.newPercent ?? 0;
    // Models Over Time Chart
    const byDate = {};
    items.forEach(row => {
      const date = (row.created_at || "").split(' ')[0];
      if (date) byDate[date] = (byDate[date] || 0) + 1;
    });

    if (window.Chart) {
      const motCtx = document.getElementById('modelsOverTimeChart');
      if (motCtx) {
        new Chart(motCtx, {
          type: 'line',
          data: {
            labels: Object.keys(byDate).sort(),
            datasets: [{
              label: 'Models Added',
              data: Object.keys(byDate).sort().map(d => byDate[d]),
              borderColor: '#ffd700',
              backgroundColor: 'rgba(255,215,0,0.15)',
              fill: true,
              tension: 0
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // Model Types Chart
      const typeCounts = {};
      items.forEach(i => typeCounts[i.category || 'Unknown'] = (typeCounts[i.category] || 0) + 1);
      const mtCtx = document.getElementById('modelTypeChart');
      if (mtCtx) {
        new Chart(mtCtx, {
          type: 'bar',
          data: {
            labels: Object.keys(typeCounts),
            datasets: [{
              label: 'Model Types',
              data: Object.values(typeCounts),
              backgroundColor: ['#282828']
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
    if (tableEl) initModelsDataTable(tableEl);
    bindFormSubmissions();
    fetchDataAndRender();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
