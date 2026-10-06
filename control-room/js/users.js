(function () {
    const BASE_API = window.BASE_API || "http://localhost/hauzisha/api/index.php";
    const tableSelector = "#userTable";
  
    function safeFetch(url, opts = {}) {
      return fetch(url, opts).then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        return res.json();
      });
    }
  
    // ---------- MODAL ----------
    function ensureSuspendModalExists() {
      if (document.getElementById("suspendModal")) return;
      const modalHtml = `
        <div class="modal fade" id="suspendModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content bg-white text-dark">
              <div class="modal-header">
                <h5 class="modal-title">Suspend User</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="suspendForm">
                  <div class="mb-3">
                    <label for="suspendReason" class="form-label">Reason</label>
                    <textarea id="suspendReason" class="form-control" required></textarea>
                  </div>
                  <input type="hidden" id="suspendUserId" />
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button id="submitSuspend" class="btn btn-primary">Suspend</button>
              </div>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML("beforeend", modalHtml);
    }
  
// ---------- DATATABLE ----------
function initDataTable(tableEl) {
    if (!window.jQuery || !$.fn.dataTable) return false;

    const $table = $(tableEl);
    const dt = $table.DataTable({
      ajax: {
        url: `${BASE_API}/users`,
        type: "GET",
        dataSrc: json => Array.isArray(json.data) ? json.data : json
      },
      columns: [
        {
          data: "image",
          render: d => `<img src="${d || '../images/male_cv.jpg'}" style="width:40px;height:40px;border-radius:50%;">`
        },
        { data: "id" },
        { data: "firstname" },
        { data: "lastname" },
        { data: "email" },
        { data: "role" },
        {
          data: "is_suspended",
          render: s => s == 1
            ? '<span class="badge" style="background:red; color:#fff;">Suspended</span>'
            : '<span class="badge" style="background:#ffd700;color:#000;">Active</span>'
        },
        {
          data: null,
          orderable: false,
          searchable: false,
          render: row => {
            const id = row.id;

            let toggleBtn = row.is_suspended == 1
              ? `<button class="btn btn-sm btn-outline-dark me-1 activate-btn" data-id="${id}" title="Activate">
                   <i class="fas fa-check" style="color:#ffd700;"></i>
                 </button>`
              : `<button class="btn btn-sm btn-outline-dark me-1 suspend-btn" data-id="${id}" title="Suspend">
                   <i class="fas fa-ban" style="color:red;"></i>
                 </button>`;

            // let deleteBtn = `
            //   <button class="btn btn-sm btn-outline-dark delete-btn" data-id="${id}" title="Delete">
            //     <i class="fas fa-trash" style="color:red;"></i>
            //   </button>`;

            return toggleBtn;
          }
        }
      ],
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
      responsive: true,
      processing: true,
      pageLength: 10,
      createdRow: function (row, data) {
        row.dataset.userId = data.id;
      }
    });
  
      // Event Handlers
      $table.on("click", ".suspend-btn", function () {
        openSuspendModal($(this).data("id"), () => {
          dt.ajax.reload(null, false);
          fetchDataAndRender();
        });
      });
  
      $table.on("click", ".activate-btn", function () {
        const id = $(this).data("id");
        if (!confirm("Activate this user?")) return;
        activateUser(id).then(() => {
          dt.ajax.reload(null, false);
          fetchDataAndRender();
        });
      });
  
    //   $table.on("click", ".delete-btn", function () {
    //     const id = $(this).data("id");
    //     if (!confirm("Delete this user?")) return;
    //     fetch(`${BASE_API}/delete-account/${id}`, { method: "POST" })
    //       .then(res => res.json())
    //       .then(r => {
    //         if (r.success) {
    //           alert("Deleted!");
    //           dt.ajax.reload(null, false);
    //           fetchDataAndRender();
    //         } else {
    //           alert("Delete failed: " + r.message);
    //         }
    //       });
    //   });
  
      return dt;
    }
  
    // ---------- KPI + CHARTS ----------
    function fetchDataAndRender() {
      Promise.all([
        safeFetch(`${BASE_API}/users`),
        safeFetch(`${BASE_API}/user-kpis`)
      ]).then(([usersJson, kpisJson]) => {
        const items = Array.isArray(usersJson.data) ? usersJson.data : [];
        const kpis = kpisJson.success ? kpisJson.data : {};
        renderReports(items, kpis);
      }).catch(err => console.error("Fetch error:", err));
    }
  
    function renderReports(items, kpis = {}) {
      // KPI cards
      document.getElementById("kpiTotal").textContent = kpis.total ?? 0;
      document.getElementById("kpiActive").textContent = kpis.active ?? 0;
      document.getElementById("kpiActivePercent").textContent = kpis.activePercent ?? 0;
      document.getElementById("kpiSuspended").textContent = kpis.suspended ?? 0;
      document.getElementById("kpiNewThisMonth").textContent = kpis.newThisMonth ?? 0;
      document.getElementById("kpiNewThisMonth2").textContent = kpis.newThisMonth ?? 0;
      document.getElementById("kpiNewPercent").textContent = kpis.newPercent ?? 0;
  
      if (window.Chart) {
        // Users Over Time
        const byDate = {};
        items.forEach(u => {
          const date = (u.created_at || "").split(" ")[0];
          if (date) byDate[date] = (byDate[date] || 0) + 1;
        });
        const uotCtx = document.getElementById("usersOverTimeChart");
        if (uotCtx) {
          new Chart(uotCtx, {
            type: "line",
            data: {
              labels: Object.keys(byDate).sort(),
              datasets: [{
                label: "Users Joined",
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
  
        // Users by Role
        const roleCounts = {};
        items.forEach(u => roleCounts[u.role || "Unknown"] = (roleCounts[u.role] || 0) + 1);
        const roleCtx = document.getElementById("userRoleChart");
        if (roleCtx) {
          new Chart(roleCtx, {
            type: "bar",
            data: {
              labels: Object.keys(roleCounts),
              datasets: [{
                data: Object.values(roleCounts),
                backgroundColor: ["#282828"],
                borderRadius: 8
              }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      }
    }
  
    // ---------- MODAL ACTIONS ----------
    function openSuspendModal(userId, onSuccess) {
      ensureSuspendModalExists();
      document.getElementById("suspendUserId").value = userId;
      document.getElementById("suspendReason").value = "";
      const modal = new bootstrap.Modal(document.getElementById("suspendModal"));
      modal.show();
  
      const btn = document.getElementById("submitSuspend");
      if (btn._handler) btn.removeEventListener("click", btn._handler);
      btn._handler = function () {
        const sus_reason = document.getElementById("suspendReason").value.trim();
        if (!sus_reason) return alert("Enter reason.");
        suspendUser(userId, sus_reason)
          .then(() => { modal.hide(); onSuccess?.(); })
          .catch(e => alert(e.message || "Failed to suspend."));
      };
      btn.addEventListener("click", btn._handler);
    }
  
    function suspendUser(id, sus_reason) {
      return safeFetch(`${BASE_API}/suspend/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sus_reason })
      });
    }
  
    function activateUser(id) {
      return safeFetch(`${BASE_API}/activate/${id}`, { method: "POST" });
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
  