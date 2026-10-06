(function () {
  // ---------- CONFIG ----------
  // Change this to your API root if needed (no trailing slash)
  const BASE_API = window.BASE_API || "http://localhost/hauzisha/api/index.php";

  const tableSelector = "#propertyTable"; // selector to find table
  const reportContainerSelector = "#reportContent";
  const downloadReportBtnId = "downloadReport";

  // Global variables for image management
  window.currentPropertyIdForImages = null;
  window.currentImageMode = null; // 'add' or 'edit'

  // ---------- UTIL ----------
  function safeFetch(url, opts = {}) {
    return fetch(url, opts).then(res => {
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      // assume JSON responses from your API
      return res.json();
    });
  }

  function createElementFromHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  // ---------- SUSPEND MODAL (created dynamically) ----------
  function ensureSuspendModalExists() {
    if (document.getElementById("suspendModal")) return;

    const modalHtml = `
      <div class="modal fade" id="suspendModal" tabindex="-1" aria-labelledby="suspendModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content bg-white text-dark">
            <div class="modal-header">
              <h5 class="modal-title" id="suspendModalLabel">Suspend Property</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="suspendForm">
                <div class="mb-3">
                  <label for="suspendReason" class="form-label">Reason for Suspension</label>
                  <textarea class="form-control" id="suspendReason" name="reason" rows="3" required></textarea>
                </div>
                <input type="hidden" id="suspendPropertyId" name="propertyId" />
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" id="submitSuspend" class="btn btn-primary">Suspend Property</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(createElementFromHTML(modalHtml));
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
        url: `${BASE_API}/deleted-properties`,
        type: "GET",
        dataSrc: function (json) {
          if (!json) return [];
          // normalize different possible payload formats
          if (Array.isArray(json)) return json;
          if (Array.isArray(json.data)) return json.data;
          if (Array.isArray(json.items)) return json.items;
          return [];
        }
      },
      columns: [
        {
          data: "gallery",
          render: function (data) {
              let imgUrl = "../images/bg_4.jpg"; // fallback
      
              try {
                  // If it's a string, parse JSON
                  if (typeof data === "string") {
                      data = JSON.parse(data);
                  }
      
                  if (Array.isArray(data) && data.length > 0) {
                      let firstImage = data[0];
      
                      if (firstImage.startsWith("http")) {
                          imgUrl = firstImage;
                      } else {
                          // Remove leading slashes and backslashes
                          firstImage = firstImage.replace(/^\/+/, "").replace(/\\/g, "");
      
                          // Split into folder + filename
                          let parts = firstImage.split("/");
                          let fileName = encodeURIComponent(parts.pop());
                          let filePath = parts.join("/");
      
                          imgUrl = `http://localhost/hauzisha/${filePath}/${fileName}`;
                      }
                  }
              } catch (e) {
                  // ignore, fallback to placeholder
              }
      
              return `<img src="${imgUrl}" style="width:60px;height:40px;object-fit:cover; border-radius: 2px;" alt="Property">`;
          }
        },                                
        { data: "id"},
        { data: "name" },
        { data: "agent_id" },
        { data: "type" },
        { data: "location" },
        {
          data: "price",
          render: function (data) {
            if (data === null || data === undefined || data === "") return "-";
            return typeof data === "number" ? "$" + Number(data).toLocaleString() : "$" + Number(data).toLocaleString();
          }
        },
        {
          data: null, // we need the whole row
          render: function(row) {
              let badgeText = "Active";
              let badgeColor = "#ffd700";
      
              if (row.is_deleted == 1) {
                  badgeText = "Deleted";
                  badgeColor = "red";
              } else if (row.is_suspended == 1) {
                  badgeText = "Suspended";
                  badgeColor = "cyan";
              }
      
              return `<span class="badge" style="background: ${badgeColor}; color: #000;">${badgeText}</span>`;
          }
        },        
        {
          data: null,
          orderable: false,
          searchable: false,
          render: function (row) {
            const id = row.id;
        
            // eye → view/edit
            let viewBtn = `
              <button class="btn btn-sm btn-outline-dark me-1 view-btn" data-id="${id}" title="View/Edit">
                <i class="fas fa-eye" style="color:cyan";></i>
              </button>`;
        
            // suspend / activate toggle
            let suspendBtn = "";
            if (row.is_suspended == 1) {
              suspendBtn = `
                <button class="btn btn-sm btn-outline-dark me-1 activate-btn" data-id="${id}" title="Activate">
                  <i class="fas fa-check" style="color:#ffd700;"></i>
                </button>`;
            } else {
              suspendBtn = `
                <button class="btn btn-sm btn-outline-dark me-1 suspend-btn" data-id="${id}" title="Suspend">
                  <i class="fas fa-ban" style="color:#ffd700;"></i>
                </button>`;
            }
        
            // delete
            let deleteBtn = `
              <button class="btn btn-sm btn-outline-dark delete-btn" data-id="${id}" title="Delete">
                <i class="fas fa-trash" style="color:red;"></i>
              </button>`;
        
            return viewBtn + suspendBtn + deleteBtn;
          }
        }          
      ],
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
      responsive: true,
      processing: true,
      pageLength: 6,
      createdRow: function (row, data) {
        row.dataset.propertyId = data.id;
      }
    });

    // View/Edit
      $table.on('click', '.view-btn', function () {
          const id = $(this).data('id');
          console.log("View/Edit clicked for property:", id);

          // Fetch property details
          fetch(`${BASE_API}/property/${id}`)
          .then(res => res.json())
          .then(res => {
              if (!res.success) {
                  if (typeof showToast === 'function') {
                      showToast("Failed to fetch property details: " + (res.message || "Unknown error"), 'error');
                  }
                  return;
              }

              const property = res.data;

              // populate form
              const form = document.getElementById("editPropertyForm");
              if (!form) return;

              form.dataset.id = id; // store id for submit later
              form.name.value = property.name || "";
              form.type.value = property.type || "";
              form.beds.value = property.beds || "";
              form.baths.value = property.baths || "";
              form.size.value = property.size || "";
              form.description.value = property.description || "";
              form.agent_id.value = property.agent_id || "";
              form.location.value = property.location || "";
              form.address.value = property.address || "";
              form.price.value = property.price || "";
              form.rating.value = property.rating || "";
              form.tags.value = property.tags || "";
              form.tour_link.value = property.tour_link || "";
              form.featured.value = property.featured || "0";

              // check facilities
              if (property.facilities) {
                  const facilities = Array.isArray(property.facilities) 
                      ? property.facilities 
                      : JSON.parse(property.facilities);
                  form.querySelectorAll("input[name='facilities[]']").forEach(cb => {
                      cb.checked = facilities.includes(cb.value);
                  });
              }

              // Load property images using new system
              loadPropertyImages(id);
              
              // Load units data if available
              if (property.units) {
                  const unitsData = typeof property.units === 'string' 
                      ? JSON.parse(property.units) 
                      : property.units;
                  loadUnitsData(unitsData, 'editUnitsContainer');
              } else {
                  // Clear units container if no units data
                  const container = document.getElementById('editUnitsContainer');
                  container.querySelectorAll('.unit-row').forEach(row => row.remove());
              }

              // Show modal
              $("#editPropertyModal").modal("show");
          })
          .catch(err => {
              console.error("Error fetching property:", err);
              if (typeof showToast === 'function') {
                  showToast("Error fetching property", 'error');
              }
          });
      });
      
      // Suspend
      $table.on('click', '.suspend-btn', function () {
          const id = $(this).data('id');
          openSuspendModal(id, () => dt.ajax.reload(null, false));
      });
      
      // Activate
      $table.on('click', '.activate-btn', function () {
          const id = $(this).data('id');
          if (!confirm("Are you sure you want to activate this property?")) return;
          activateProperty(id)
          .then(() => dt.ajax.reload(null, false))
          .catch(err => {
              if (typeof showToast === 'function') {
                  showToast(err.message || "Activation failed", 'error');
              }
          });
      });
      
      // Delete
      $table.on('click', '.delete-btn', function () {
          const id = $(this).data('id');
          if (!confirm("Delete this property?")) return;
          fetch(`${BASE_API}/p-delete-property/${id}`, { method: "POST" })
          .then(res => res.json())
          .then(res => {
              if (res.success) {
                  if (typeof showToast === 'function') {
                      showToast("Property deleted successfully!", 'success');
                  }
                  dt.ajax.reload(null, false);
              } else {
                  if (typeof showToast === 'function') {
                      showToast("Delete failed: " + res.message, 'error');
                  }
              }
          })
          .catch(err => console.error("Delete failed:", err));
      });


    return dt;
  }

  // ---------- FALLBACK TABLE RENDER (no DataTables) ----------
  function initFallbackTable(tableEl) {
    // tableEl is a <table> element
    function renderRows(items) {
      const tbody = tableEl.querySelector('tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      items.forEach(row => {
        let imgUrl = "/images/placeholder.png";
        try {
          if (row.gallery) {
            if (typeof row.gallery === "string" && row.gallery.startsWith("[")) {
              const arr = JSON.parse(row.gallery);
              if (arr.length) imgUrl = arr[0];
            } else if (typeof row.gallery === "string" && row.gallery.indexOf(",") !== -1) {
              imgUrl = row.gallery.split(",")[0];
            } else if (typeof row.gallery === "string") {
              imgUrl = row.gallery;
            }
          }
        } catch (e) {}
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img src="${imgUrl}" style="width:60px; height:40px; object-fit:cover;" alt="Property"></td>
          <td>${row.name || ''}</td>
          <td>${row.type || ''}</td>
          <td>${row.location || ''}</td>
          <td>${row.price !== undefined ? ('$' + Number(row.price).toLocaleString() + (row.status === 'For Rent' ? '/mo' : '')) : '-'}</td>
          <td>${row.is_suspended==1 ? '<span class="badge bg-danger">Suspended</span>' : '<span class="badge" style="background: #ffd700; color: #000;">Active</span>'}</td>
          <td>${row.is_suspended==1 ? `<button class="btn btn-sm p-activate-btn" data-id="${row.id}">Activate</button>` : `<button class="btn btn-sm suspend-btn" data-id="${row.id}">Suspend</button>`}</td>
        `;
        tbody.appendChild(tr);
      });

      // wire up fallback events
      tbody.querySelectorAll('.suspend-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.dataset.id;
          openSuspendModal(id, () => loadAndRenderFallback());
        });
      });
      tbody.querySelectorAll('.p-activate-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.dataset.id;
          if (!confirm('Activate this property?')) return;
          activateProperty(id, () => loadAndRenderFallback());
        });
      });
    }

    function loadAndRenderFallback() {
      safeFetch(`${BASE_API}/properties`)
        .then(json => {
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.items || []));
          renderRows(items);
        })
        .catch(err => {
          console.error('Failed to load properties for fallback table:', err);
        });
    }

    loadAndRenderFallback();
    return true;
  }

  // ---------- SUSPEND / ACTIVATE API CALLS ----------
  function openSuspendModal(propertyId, onSuccess) {
    ensureSuspendModalExists();
    const modalEl = document.getElementById("suspendModal");
    if (!modalEl) return;
    document.getElementById("suspendPropertyId").value = propertyId;
    document.getElementById("suspendReason").value = "";
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    // remove any old listener
    const submitBtn = document.getElementById("submitSuspend");
    if (!submitBtn) return;
    const handler = function () {
      const reason = document.getElementById("suspendReason").value.trim();
      if (!reason) {
        if (typeof showToast === 'function') {
            showToast("Please enter a reason for suspension", 'warning');
        }
        return;
      }
      submitBtn.disabled = true;
      suspendProperty(propertyId, reason)
        .then(() => {
          bsModal.hide();
          submitBtn.disabled = false;
          if (typeof onSuccess === "function") onSuccess();
        })
        .catch(err => {
          if (typeof showToast === 'function') {
              showToast("Failed to suspend property: " + (err.message || err), 'error');
          }
        })
        .finally(() => { submitBtn.disabled = false; });
    };

    // avoid double-binding
    if (submitBtn._suspendHandler) {
      submitBtn.removeEventListener('click', submitBtn._suspendHandler);
    }
    submitBtn.addEventListener('click', handler);
    submitBtn._suspendHandler = handler;
  }

  function suspendProperty(id, reason) {
    return fetch(`${BASE_API}/suspend-property/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ sus_reason: reason })
    })
    .then(async res => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Suspend API error: ${res.status}`);
      }
      return json;
    });
  }

  function activateProperty(id) {
    return fetch(`${BASE_API}/activate-property/${id}`, { 
      method: "POST",
      headers: { "Accept": "application/json" }
    })
    .then(async res => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Activate API error: ${res.status}`);
      }
      return json;
    });
  }

  // ---------- CHARTS & REPORTS ----------
  function fetchPropertyDataAndRender() {
    const endpoint = `${BASE_API}/deleted-properties`;
    safeFetch(endpoint)
      .then(json => {
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.items || []));
        renderReports(items);
      })
      .catch(err => {
        console.error("Failed to fetch property data for charts:", err);
      });
  }

  function renderReports(items) {
    const total = items.length;
    const suspended = items.filter(i => i.is_suspended == 1 || i.is_deleted == 1).length;

    if (document.getElementById('totalProperties')) {
      document.getElementById('totalProperties').textContent = total;
    }
    if (document.getElementById('textTotalProperties')) {
      document.getElementById('textTotalProperties').textContent = total;
    }

    // group by date
    const byDate = {};
    items.forEach(row => {
      const date = (row.created_at || row.posted_at || "").split(' ')[0] || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : "");
      if (!date) return;
      byDate[date] = (byDate[date] || 0) + 1;
    });

    if (window.Chart) {
      try {
        // Properties Over Time (line)
        const potCtx = document.getElementById('propertiesOverTimeChart');
        if (potCtx) {
          if (window.potChart) window.potChart.destroy(); // destroy previous chart if exists
          const labels = Object.keys(byDate).sort();
          const data = labels.map(l => byDate[l]);
          window.potChart = new Chart(potCtx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Properties added', data, borderColor: '#ffd700', backgroundColor: 'rgba(255,215,0,0.15)', fill: true }] },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
    
        // Property Types (bar)
        const typeCounts = {};
        items.forEach(i => { typeCounts[i.type || 'Unknown'] = (typeCounts[i.type || 'Unknown'] || 0) + 1; });
        const ptCtx = document.getElementById('propertyTypeChart');
        if (ptCtx) {
          if (window.ptChart) window.ptChart.destroy();
          const labels = Object.keys(typeCounts);
          const data = labels.map(l => typeCounts[l]);
          window.ptChart = new Chart(ptCtx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Count', data, backgroundColor: '#282828' }] },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      } catch (err) {
        console.error('Chart rendering error', err);
      }
    }    

    if (document.getElementById('totalSignups')) document.getElementById('totalSignups').textContent = total;
    if (document.getElementById('avgSignups')) {
      const days = Object.keys(byDate).length || 1;
      document.getElementById('avgSignups').textContent = (total / days).toFixed(2);
    }
    if (document.getElementById('maxSignups')) {
      let max = 0, maxDay = 'N/A';
      for (const d in byDate) if (byDate[d] > max) { max = byDate[d]; maxDay = d; }
      document.getElementById('maxSignups').textContent = max;
      document.getElementById('maxSignupsDay').textContent = maxDay;
    }
  }

  // ---------- PDF REPORT ----------
  function setupPdfButton() {
    const btn = document.getElementById(downloadReportBtnId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const report = document.querySelector(reportContainerSelector);
      if (!report) {
          if (typeof showToast === 'function') {
              showToast("Report section not found", 'error');
          }
          return;
      }

      if (!window.html2canvas || !window.jspdf) {
        if (typeof showToast === 'function') {
            showToast("PDF export libraries not loaded", 'error');
        }
        return;
      }

      const clone = report.cloneNode(true);

      // copy canvas contents
      const origCanvases = report.querySelectorAll('canvas');
      const cloneCanvases = clone.querySelectorAll('canvas');
      origCanvases.forEach((c, i) => {
        if (cloneCanvases[i]) {
          const ctx = cloneCanvases[i].getContext('2d');
          try { ctx.drawImage(c, 0, 0); } catch (e) {}
        }
      });

      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.innerHTML = `<h2>LOFT STUDIO - Property Report</h2><p>${new Date().toLocaleDateString()}</p>`;
      clone.insertBefore(header, clone.firstChild);

      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      html2canvas(clone, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('loft-properties-report.pdf');
        document.body.removeChild(clone);
      }).catch(err => {
        console.error('PDF generation failed:', err);
        if (typeof showToast === 'function') {
            showToast('Failed to generate PDF', 'error');
        }
      });
    });
  }

  // ---------- INIT ----------
  function init() {
          ensureSuspendModalExists();
      
          const tableEl = document.querySelector(tableSelector) || document.querySelector('table.table');
          if (!tableEl) {
            console.warn("Property table not found on page.");
          } else {
            // try DataTables first
            const dt = initDataTable(tableEl);
            if (!dt) {
              initFallbackTable(tableEl);
            }
          }
      
          // charts & summaries
          fetchPropertyDataAndRender();
      
          // KPI fetch
          fetch(`${BASE_API}/property-kpis`)
            .then(res => res.json())
            .then(res => {
              if (res.success) {
                const d = res.data;
                $("#kpiTotal").text(d.total);
                $("#kpiActive").text(d.active);
                $("#kpiInactive").text(d.inactive);
                $("#kpiPending").text(d.pending);
                $("#kpiNewThisMonth").text(d.newThisMonth);
                $("#kpiNewThisMonth2").text(d.newThisMonth);
                $("#kpiActivePercent").text(d.activePercent + "%");
                $("#kpiNewPercent").text(d.newPercent + "%");
              }
            })
            .catch(err => console.error("Failed to fetch KPIs:", err));
      
          // PDF export button
          setupPdfButton();
  }

  $(document).ready(function () {
          $("#addPropertyForm").on("submit", function (e) {
            e.preventDefault();
        
            let formData = new FormData(this);
            
            // Add units data if configured
            const unitsData = collectUnitsData('unitsContainer');
            if (unitsData) {
                formData.append('units', JSON.stringify(unitsData));
            }
        
            fetch(`${BASE_API}/create-property`, {
              method: "POST",
              body: formData
            })
            .then(res => res.json())
            .then(res => {
              console.log(res); // DEBUG: see exactly what backend sent
              if (res.success) {
                const newPropertyId = res.data?.id || res.property_id;
                
                // Check if there are images to upload
                const imagePreview = document.getElementById('addPropertyImagePreview');
                const hasImages = imagePreview && imagePreview.children.length > 0 && 
                                 !imagePreview.querySelector('.text-muted');
                
                if (hasImages && newPropertyId) {
                  // Property created, now we can associate images
                  if (typeof showToast === 'function') {
                      showToast("Property added successfully! Images have been associated.", 'success');
                  }
                } else {
                  if (typeof showToast === 'function') {
                      showToast("Property added successfully!", 'success');
                  }
                }
                
                $("#addPropertyModal").modal("hide");
                
                // Clear the image preview for next time
                if (imagePreview) {
                  imagePreview.innerHTML = `
                    <div class="col-12 text-center text-muted py-4">
                      <i class="fa fa-images fa-3x mb-2"></i>
                      <p>No images uploaded yet. Click "Add Images" to start.</p>
                    </div>
                  `;
                }
                
                if ($.fn.DataTable.isDataTable('#propertyTable')) {
                  $("#propertyTable").DataTable().ajax.reload();
                }
              } else {
                if (typeof showToast === 'function') {
                    showToast("Failed: " + (res.message || "Unknown error"), 'error');
                }
              }
            })
            .catch(err => {
              console.error("Something went wrong", err);
              if (typeof showToast === 'function') {
                  showToast("Something went wrong. Please try again.", 'error');
              }
            });
          });
  });

  $(document).ready(function () {
          $("#editPropertyForm").on("submit", function (e) {
              e.preventDefault();
      
              const id = this.dataset.id;
              if (!id) {
                  if (typeof showToast === 'function') {
                      showToast("No property ID found", 'error');
                  }
                  return;
              }
      
              let formData = new FormData(this);
              
              // Add units data if configured
              const unitsData = collectUnitsData('editUnitsContainer');
              if (unitsData) {
                  formData.append('units', JSON.stringify(unitsData));
              }
      
              fetch(`${BASE_API}/p-update-property/${id}`, {
                  method: "POST", // 🔹 use POST for multipart (since PUT can’t handle files easily in PHP)
                  body: formData
              })
              .then(res => res.json())
              .then(res => {
                  if (res.success) {
                      if (typeof showToast === 'function') {
                          showToast("Property updated successfully!", 'success');
                      }
                      $("#editPropertyModal").modal("hide");
                      if ($.fn.DataTable.isDataTable('#propertyTable')) {
                          $("#propertyTable").DataTable().ajax.reload(null, false);
                      }
                  } else {
                      if (typeof showToast === 'function') {
                          showToast("Update failed: " + (res.message || "Unknown error"), 'error');
                      }
                  }
              })
              .catch(err => {
                  console.error("Update error:", err);
                  if (typeof showToast === 'function') {
                      showToast("Something went wrong. Please try again.", 'error');
                  }
              });
          });
  }); 
        
  // ---------- Remove Gallery Image ----------
  document.addEventListener("click", function (e) {
          if (e.target.classList.contains("remove-gallery")) {
              let imgUrl = e.target.dataset.url;
              let propertyId = document.getElementById("editPropertyForm").dataset.id;

              // Call backend to remove from DB/storage
              fetch(`${BASE_API}/remove-image`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ property_id: propertyId, url: imgUrl })
              })
              .then(res => res.json())
              .then(res => {
                  if (res.success) {
                      e.target.parentElement.remove();
                  } else {
                      if (typeof showToast === 'function') {
                          showToast("Failed to remove image: " + res.message, 'error');
                      }
                  }
              })
              .catch(err => {
                  console.error("Remove image error:", err);
                  if (typeof showToast === 'function') {
                      showToast("Error removing image", 'error');
                  }
              });
          }
  });
        
  // ---------- IMAGE MANAGEMENT FUNCTIONS ----------
  window.openImageUploadForAdd = function() {
    // For add mode, inform user to save property first
    if (typeof showToast === 'function') {
        showToast('Please save the property first, then you can add images by editing the property.', 'info');
    }
    return;
    
    /* Alternative: Allow image staging for new properties
    window.currentImageMode = 'add';
    window.currentPropertyIdForImages = null;
    
    const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
    modal.show();
    */
  };

  window.openImageUploadForEdit = function() {
    const form = document.getElementById("editPropertyForm");
    const propertyId = form ? form.dataset.id : null;
    
    console.log('openImageUploadForEdit called');
    console.log('Form:', form);
    console.log('Property ID:', propertyId);
    
    if (!propertyId) {
      if (typeof showToast === 'function') {
          showToast("No property selected. Please close and reopen the edit modal.", 'warning');
      }
      return;
    }
    
    window.currentImageMode = 'edit';
    window.currentPropertyIdForImages = propertyId;
    
    // Set the property ID in the upload form
    const uploadIdField = document.getElementById('uploadPropertyId');
    if (uploadIdField) {
      uploadIdField.value = propertyId;
      console.log('Set uploadPropertyId to:', propertyId);
    } else {
      console.error('uploadPropertyId field not found!');
    }
    
    // Open the image upload modal
    if (typeof openImageUploadModal === 'function') {
      openImageUploadModal(propertyId);
    } else {
      const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
      modal.show();
    }
  };

  // Listen for image upload completion
  window.addEventListener('imagesUploaded', function(e) {
    const { propertyId, images } = e.detail;
    
    if (window.currentImageMode === 'add') {
      // Update preview in add modal
      updateAddModalImagePreview(images);
    } else if (window.currentImageMode === 'edit') {
      // Reload images in edit modal
      loadPropertyImages(propertyId);
    }
  });

  function updateAddModalImagePreview(images) {
    const container = document.getElementById('addPropertyImagePreview');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!images || images.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          <i class="fa fa-images fa-3x mb-2"></i>
          <p>No images uploaded yet. Click "Add Images" to start.</p>
        </div>
      `;
      return;
    }
    
    images.forEach(img => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card bg-secondary">
          <img src="${img.thumbnail_url}" class="card-img-top" style="height: 150px; object-fit: cover;">
          <div class="card-body p-2">
            <small class="badge bg-${img.category === 'hero' ? 'warning' : img.category === 'interior' ? 'info' : 'success'} w-100">
              ${img.category}
            </small>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  function loadPropertyImages(propertyId) {
    fetch(`${BASE_API}/property-images/${propertyId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          updateEditModalImagePreview(res.data, propertyId);
        }
      })
      .catch(err => console.error('Failed to load property images:', err));
  }

  function updateEditModalImagePreview(images, propertyId) {
    const container = document.getElementById('editPropertyImagePreview');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!images || images.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          <i class="fa fa-images fa-3x mb-2"></i>
          <p>No images uploaded yet. Click "Add More Images" to start.</p>
        </div>
      `;
      return;
    }
    
    images.forEach(img => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      
      // Handle both old and new API response formats
      const thumbnailUrl = img.thumbnail_url || img.urls?.thumb || img.urls?.md || '';
      const category = img.category || 'other';
      const isHero = img.is_hero || (category === 'hero');
      
      col.innerHTML = `
        <div class="card bg-secondary position-relative">
          <img src="${thumbnailUrl}" class="card-img-top" style="height: 150px; object-fit: cover;" onerror="this.onerror=null; this.src='/hauzisha/images/work-8.jpg';">
          <div class="card-body p-2">
            <small class="badge bg-${isHero ? 'warning' : 'info'} w-100 mb-1">
              ${isHero ? 'Hero' : category}
            </small>
            <button class="btn btn-sm btn-danger w-100" onclick="deletePropertyImage(${img.id}, ${propertyId})">
              <i class="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  window.deletePropertyImage = function(imageId, propertyId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    fetch(`${BASE_API}/property-images/${imageId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        if (typeof showToast === 'function') {
            showToast('Image deleted successfully', 'success');
        }
        loadPropertyImages(propertyId);
      } else {
        if (typeof showToast === 'function') {
            showToast('Failed to delete image: ' + (res.message || res.error), 'error');
        }
      }
    })
    .catch(err => {
      console.error('Delete error:', err);
      if (typeof showToast === 'function') {
          showToast('Error deleting image: ' + err.message, 'error');
      }
    });
  };

  // Run on DOM ready
  if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }      
  
})();