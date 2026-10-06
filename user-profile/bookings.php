<?php
require_once '../api/helpers/security.php';

// Require authentication and prevent caching
Security::requireAuth();
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>HAUZISHA - My Bookings</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <link rel="icon" type="image/svg+xml" href="images/logo.png">
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="stylesheet" href="../css/font-awesome.min.css">
  <link rel="stylesheet" href="../css/ionicons.min.css">
  <link rel="stylesheet" href="../css/animate.css">
  <link rel="stylesheet" href="../css/flaticon.css">
  <link rel="stylesheet" href="../css/tiny-slider.css">
  <link rel="stylesheet" href="../css/glightbox.min.css">
  <link rel="stylesheet" href="../css/aos.css">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../control-room/admin.css">
  <link rel="stylesheet" href="css/footer-fix.css">

  <style>
    h3 {
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
    }

    .booking-card {
      background: rgba(20, 20, 20, 0.9);
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* Gold accent border glow */
    .booking-glow {
      position: absolute;
      inset: 0;
      border-radius: 20px;
      border: 1px solid #121212;
      pointer-events: none;
      box-shadow: 0 0 25px rgba(255, 215, 0, 0.15);
    }

    .text-gold {
      color: #ffd700;
    }

    /* Status pill refined */
    .booking-status {
      font-size: 0.7rem;
      padding: 0.4rem 0.9rem;
      border-radius: 30px;
      font-weight: 600;
      letter-spacing: 0.5px;
      background: rgba(255, 215, 0, 0.1);
      /* border: 1px solid rgba(255, 215, 0, 0.3); */
      color: #ffd700;
      text-transform: uppercase;
    }


    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .75rem;
    }

    .booking-header h5 {
      margin: 0;
      font-weight: 600;
      color: #fff;
    }

    .status-pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-confirmed {
      background: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .status-cancelled {
      background: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }

    .booking-details {
      font-size: 0.85rem;
      /* color: #ccc; */
      line-height: 1.7rem;
    }

    .booking-details i {
      margin-right: .5rem;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 16px;
    }

    .empty-state i {
      font-size: 3rem;
      color: #555;
      margin-bottom: 1rem;
    }

    .empty-state p {
      font-size: 0.9rem;
      color: #555;
    }

    .upcoming-image img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }

    .thumb {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    }

    .booking-table {
      height: 100%;
    }

    .table-responsive {
      height: 100%;
      display: flex;
    }

    .table {
      margin: 0;
      flex: 1;
    }
  </style>
</head>

<body class="d-flex flex-column min-vh-100"
  style="background: linear-gradient(to bottom, #000, #121212); height: 100vh;">

  <?php include 'mobile-nav.php'; ?>

  <main class="user-main-content py-4 row justify-content-center flex-fill">
    <div class="" style="width: 90vw;">
      <h6 class="mb-5 mt-3 text-light" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
        <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Bookings</h6>

      <!-- Bookings Container -->
      <div id="bookings-container">
        <!-- Loading state -->
        <div class="text-center text-light py-5">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p class="mt-3">Loading bookings...</p>
        </div>
      </div>


      <!-- <div class="row g-4 justify-content-center align-items-start flex-lg-row flex-md-row flex-sm-column">
        <div class="col-lg-9 col-md-9 col-sm-12">
        <h6 class="mb-3" style="font-weight: bold; color: #fff;">Booking History</h6>
          <div class="table-responsive booking-table w-100">
            <table class="table table-dark table-striped table-borderless align-middle rounded-3 overflow-hidden">
              <thead class="bg-black">
                <tr>
                  <th>Property</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Agent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <img src="../images/bg_4.jpg" class="thumb me-2" alt="Penthouse Suite">
                      Penthouse Suite, LA
                    </div>
                  </td>
                  <td>02 Aug 2025</td>
                  <td>11:00 AM</td>
                  <td>Michael Lee</td>
                  <td><span class="booking-status status-cancelled">Cancelled</span></td>
                </tr>
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <img src="../images/bg_4.jpg" class="thumb me-2" alt="Beachfront Villa">
                      Beachfront Villa, Miami
                    </div>
                  </td>
                  <td>18 Jul 2025</td>
                  <td>4:30 PM</td>
                  <td>Amanda Chen</td>
                  <td><span class="booking-status status-confirmed">Confirmed</span></td>
                </tr>
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <img src="../images/bg_4.jpg" class="thumb me-2" alt="Modern Flat">
                      Modern Flat, London
                    </div>
                  </td>
                  <td>05 Jul 2025</td>
                  <td>2:00 PM</td>
                  <td>James Carter</td>
                  <td><span class="booking-status status-pending">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-3 col-md-3 col-sm-12">
        <h6 class="mb-3" style="font-weight: bold; color: #fff;">Upcoming</h6>
          <div class="booking-card h-100 p-0 position-relative overflow-hidden">
            <div class="booking-glow"></div>

            <div class="upcoming-image">
              <img src="../images/bg_4.jpg" alt="Skyline Loft, Manhattan">
            </div>

            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 text-white fw-bold">Skyline Loft, Manhattan</h5>
                <span class="booking-status status-confirmed">Confirmed</span>
              </div>

              <div class="row g-3 booking-details">
                <div class="col-12 d-flex align-items-center">
                  <i class="fa-solid fa-calendar text-gold me-2" style="color: #fff;"></i>
                  <span>15 Sep 2025</span>
                </div>
                <div class="col-12 d-flex align-items-center">
                  <i class="fa-solid fa-clock text-gold me-2" style="color: #fff;"></i>
                  <span>3:00 PM</span>
                </div>
                <div class="col-12 d-flex align-items-center">
                  <i class="fa-solid fa-user text-gold me-2" style="color: #fff;"></i>
                  <span>Sarah Johnson</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div> -->
    </div>
  </main>

  <?php include 'footer2.php'; ?>

  <script src="../js/logout-handler.js" defer></script>
  <script src="../js/toast.js" defer></script>
  <script src="../js/profile-dropdown.js" defer></script>
  <script src="js/footer2.js"></script>

  <script>
    // Fetch and display user bookings
    async function loadBookings() {
      const container = document.getElementById('bookings-container');

      try {
        const response = await fetch('/hauzisha/api/index.php/my-bookings');
        const data = await response.json();

        if (data.success && data.bookings && data.bookings.length > 0) {
          container.innerHTML = data.bookings.map(booking => {
            const statusClass = `status-${booking.status}`;

            // FIX: Safely decode gallery
            let gallery = [];
            try {
              gallery = booking.gallery ? JSON.parse(booking.gallery.replace(/\\/g, '')) : [];
            } catch (e) {
              gallery = [];
            }

            // Select hero image safely
            const heroImage = booking.hero_image || gallery[0] || '../images/bg_4.jpg';

            const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return `
              <div class="booking-card mb-4">
                <div class="booking-glow"></div>
                <div class="booking-header">
                  <h5>${booking.property_name}</h5>
                  <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                <div class="booking-details text-light">
                  <p><i class="fas fa-calendar"></i> <strong>Viewing Date:</strong> ${bookingDate}</p>
                  <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${booking.location}</p>
                  <p><i class="fas fa-tag"></i> <strong>Price:</strong> <span style="white-space: nowrap;">KES ${parseInt(booking.price).toLocaleString()}${booking.status === 'For Rent' ? '<span style="font-size: 0.9em; margin-left: 2px;">/mo</span>' : ''}</span></p>
                  <p><i class="fas fa-home"></i> <strong>Type:</strong> ${booking.type}</p>
                </div>
                <div class="mt-3">
                  <a href="../property-details.php?id=${booking.property_id}" class="btn btn-sm" style="border: 1px solid #999; color: #999;">
                    <i class="fas fa-eye"></i> View Property
                  </a>
                  ${booking.status === 'pending' ? `
                    <button class="btn btn-sm ms-1" style="background: red; color: #fff;" onclick="cancelBooking(${booking.booking_id})">
                      <i class="fas fa-times"></i> Cancel
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');
        } else {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fa-regular fa-calendar-xmark"></i>
              <p>You currently have no bookings.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load bookings. Please try again later.</p>
          </div>
        `;
      }
    }

    // Cancel booking function
    async function cancelBooking(bookingId) {
      if (!confirm('Are you sure you want to cancel this booking?')) return;

      try {
        const response = await fetch('/hauzisha/api/index.php/cancel-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId })
        });

        const data = await response.json();

        if (data.success) {
          if (typeof showToast === 'function') {
            showToast('Booking cancelled successfully', 'success');
          } else {
            alert('Booking cancelled successfully');
          }
          loadBookings(); // Reload bookings
        } else {
          throw new Error(data.message || 'Failed to cancel booking');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        if (typeof showToast === 'function') {
          showToast(error.message, 'error');
        } else {
          alert(error.message);
        }
      }
    }

    // Load bookings on page load
    document.addEventListener('DOMContentLoaded', loadBookings);
  </script>

</body>

</html>