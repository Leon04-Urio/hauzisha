document.addEventListener('DOMContentLoaded', () => {
    // Store chart instances to properly destroy them
    window.dashboardCharts = {};
    
    // Fetch all dashboard data
    fetchDashboardData();
    fetchPopularProperties();
    fetchPopularModels();

    async function fetchDashboardData() {
        try {
            const response = await fetch('/hauzisha/api/index.php/admin/dashboard-stats');
            const result = await response.json();
            
            if (result.success) {
                updateKPICards(result.data);
                updateCharts(result.data);
                updateRecentActivities(result.data.activities);
            } else {
                console.error('Failed to fetch dashboard data:', result.message);
                if (typeof showToast === 'function') {
                    showToast('Failed to load dashboard data', 'error');
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (typeof showToast === 'function') {
                showToast('Error loading dashboard', 'error');
            }
        }
    }

    async function fetchPopularProperties() {
        try {
            const response = await fetch('/hauzisha/api/index.php/admin/popular-properties');
            const result = await response.json();
            
            if (result.success) {
                updatePopularProperties(result.data);
            }
        } catch (error) {
            console.error('Error fetching popular properties:', error);
        }
    }

    async function fetchPopularModels() {
        try {
            const response = await fetch('/hauzisha/api/index.php/admin/popular-models');
            const result = await response.json();
            
            if (result.success) {
                updatePopularModels(result.data);
            }
        } catch (error) {
            console.error('Error fetching popular models:', error);
        }
    }

    function updateKPICards(data) {
        // Update Properties card
        const propertiesCard = document.getElementById('properties-card');
        if (propertiesCard) {
            propertiesCard.querySelector('h2').textContent = data.properties.total || 0;
            propertiesCard.querySelector('small').textContent = `Inactive: ${data.properties.inactive || 0}`;
        }

        // Update Users card
        const usersCard = document.getElementById('users-card');
        if (usersCard) {
            usersCard.querySelector('h2').textContent = data.users.total || 0;
            usersCard.querySelector('small').textContent = `Inactive: ${data.users.inactive || 0}`;
        }

        // Update Agents card
        const agentsCard = document.getElementById('agents-card');
        if (agentsCard) {
            agentsCard.querySelector('h2').textContent = data.agents.total || 0;
            agentsCard.querySelector('small').textContent = `Inactive: ${data.agents.deleted || 0}`;
        }

        // Update Revenue card with real data
        const revenueCard = document.getElementById('revenue-card');
        if (revenueCard) {
            const totalRevenue = data.bookings.total_revenue || 0;
            const monthlyRevenue = data.bookings.monthly_revenue || 0;
            revenueCard.querySelector('h2').textContent = `$${totalRevenue.toLocaleString()}`;
            revenueCard.querySelector('small').textContent = `This Month: $${monthlyRevenue.toLocaleString()}`;
        }
    }

    function updatePopularProperties(properties) {
        const popularList = document.getElementById('popular-properties');
        if (popularList && properties.length > 0) {
            popularList.innerHTML = '';
            
            properties.slice(0, 3).forEach(property => {
                let imageUrl = '../images/gallery-1.jpg'; // fallback
                
                if (property.hero_image) {
                    imageUrl = `${property.hero_image}`;
                } else if (property.gallery && property.gallery.length > 0) {
                    imageUrl = `${property.gallery[0]}`;
                }
                
                const item = document.createElement('div');
                item.className = 'popular-item';
                item.innerHTML = `
                    <img src="${imageUrl}" alt="Property">
                    <div class="popular-info">
                        <h6>${property.name}</h6>
                        <p>${property.views || 0} views this week</p>
                    </div>
                `;
                popularList.appendChild(item);
            });
        } else if (popularList) {
            popularList.innerHTML = `
                <div class="popular-item">
                    <img src="../images/work-7.jpg" alt="Property">
                    <div class="popular-info">
                        <h6>No Properties</h6>
                        <p>No data available</p>
                    </div>
                </div>
            `;
        }
    }

    function updatePopularModels(models) {
        const modelsList = document.getElementById('popular-models');
        if (modelsList && models.length > 0) {
            modelsList.innerHTML = '';
            
            models.slice(0, 3).forEach(model => {
                let imageUrl = '../images/sofa1.jpeg'; // fallback
                
                if (model.hero_image) {
                    imageUrl = `${model.hero_image}`;
                }
                
                const item = document.createElement('div');
                item.className = 'popular-item';
                item.innerHTML = `
                    <img src="${imageUrl}" alt="Model">
                    <div class="popular-info">
                        <h6>${model.name}</h6>
                        <p>Used in ${model.usage_count || 0} tours</p>
                    </div>
                `;
                modelsList.appendChild(item);
            });
        } else if (modelsList) {
            modelsList.innerHTML = `
                <div class="popular-item">
                    <img src="../images/sofa2.jpeg" alt="Model">
                    <div class="popular-info">
                        <h6>No Models</h6>
                        <p>No data available</p>
                    </div>
                </div>
            `;
        }
    }

    function updateRecentActivities(activities) {
        const activitiesList = document.getElementById('activities-list');
        if (activitiesList && activities.length > 0) {
            activitiesList.innerHTML = '';
            
            activities.forEach(activity => {
                const timeAgo = getTimeAgo(activity.created_at);
                const li = document.createElement('li');
                li.className = 'list-group-item bg-transparent d-flex';
                li.innerHTML = `
                    <div>
                        <div>${activity.action}</div>
                        <small class="text-warning">${timeAgo}</small>
                    </div>
                `;
                activitiesList.appendChild(li);
            });
        } else if (activitiesList) {
            activitiesList.innerHTML = `
                <li class="list-group-item bg-transparent d-flex">
                    <div>
                        <div>No recent activities found</div>
                        <small class="text-warning">Check back later</small>
                    </div>
                </li>
            `;
        }
    }

    function getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    }

    function updateCharts(data) {
        // Destroy all existing charts first
        destroyAllCharts();
        
        // Update all charts with real data
        if (data.propertyTypes && data.propertyTypes.length > 0) {
            updatePropertyTypesChart(data.propertyTypes);
        }
        
        if (data.userGrowth && data.userGrowth.length > 0) {
            updateUserGrowthChart(data.userGrowth);
        }
        
        if (data.monthlyBookings) {
            updateBookingsChart(data.monthlyBookings);
        }
        
        if (data.quarterlyRevenue) {
            updateRevenueChart(data.quarterlyRevenue);
        }
    }

    function destroyAllCharts() {
        const chartIds = ['propertyChart', 'usersChart', 'bookingsChart', 'revenueChart'];
        chartIds.forEach(chartId => {
            destroyChart(chartId);
        });
    }

    function destroyChart(canvasId) {
        // First try to get chart from our storage
        if (window.dashboardCharts[canvasId]) {
            window.dashboardCharts[canvasId].destroy();
            delete window.dashboardCharts[canvasId];
        }
        
        // Also check Chart.js registry for any existing charts on this canvas
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }
    }

    function updatePropertyTypesChart(propertyTypes) {
        const propertyCanvas = document.getElementById('propertyChart');
        if (propertyCanvas) {
            // Destroy existing chart if it exists
            destroyChart('propertyChart');
            
            const propertyCtx = propertyCanvas.getContext('2d');
            const labels = propertyTypes.map(pt => pt.type.charAt(0).toUpperCase() + pt.type.slice(1));
            const data = propertyTypes.map(pt => pt.count);
            
            window.dashboardCharts['propertyChart'] = new Chart(propertyCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Property Types',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 215, 0, 1)',
                            'rgba(255, 152, 0, 0.9)',
                            'rgba(76, 175, 239, 0.9)',
                            'rgba(139, 195, 74, 0.9)',
                            'rgba(233, 30, 99, 0.9)'
                        ],
                        borderWidth: 2,
                        borderColor: '#121212',
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#ccc', padding: 20, font: { size: 14 } } },
                        tooltip: { backgroundColor: '#000', titleColor: '#ffd700', bodyColor: '#fff' }
                    }
                }
            });
        }
    }

    function updateUserGrowthChart(userGrowth) {
        const usersCanvas = document.getElementById('usersChart');
        if (usersCanvas) {
            // Destroy existing chart if it exists
            destroyChart('usersChart');
            
            const usersCtx = usersCanvas.getContext('2d');
            const labels = userGrowth.map(ug => {
                const date = new Date(ug.month + '-01');
                return date.toLocaleDateString('en-US', { month: 'short' });
            });
            const data = userGrowth.map(ug => ug.count);
            
            const usersGradient = usersCtx.createLinearGradient(0, 0, 0, 300);
            usersGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            usersGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            window.dashboardCharts['usersChart'] = new Chart(usersCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Users',
                        data: data,
                        borderColor: '#ffd700',
                        backgroundColor: usersGradient,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ffd700',
                        pointBorderColor: '#000',
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { labels: { color: '#ccc' } },
                        tooltip: { backgroundColor: '#000', titleColor: '#ffd700', bodyColor: '#fff' } 
                    },
                    scales: {
                        y: { ticks: { color: '#ccc' } },
                        x: { ticks: { color: '#ccc' } }
                    }
                }
            });
        }
    }

    function updateBookingsChart(monthlyBookings) {
        const bookingsCanvas = document.getElementById('bookingsChart');
        if (bookingsCanvas) {
            // Destroy existing chart if it exists
            destroyChart('bookingsChart');
            
            const bookingsCtx = bookingsCanvas.getContext('2d');
            const labels = monthlyBookings.map(mb => {
                const date = new Date(mb.month + '-01');
                return date.toLocaleDateString('en-US', { month: 'short' });
            });
            const data = monthlyBookings.map(mb => mb.count);
            
            const goldFade = bookingsCtx.createLinearGradient(0, 0, 0, 300);
            goldFade.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
            goldFade.addColorStop(1, 'rgba(255, 215, 0, 0)');

            window.dashboardCharts['bookingsChart'] = new Chart(bookingsCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Bookings',
                        data: data,
                        borderColor: '#ffd700',
                        backgroundColor: goldFade,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ffd700',
                        pointBorderColor: '#000',
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#ccc' } },
                        tooltip: { backgroundColor: '#000', titleColor: '#ffd700', bodyColor: '#fff' }
                    },
                    scales: {
                        y: { ticks: { color: '#ccc' } },
                        x: { ticks: { color: '#ccc' } }
                    }
                }
            });
        }
    }

    function updateRevenueChart(quarterlyRevenue) {
        const revenueCanvas = document.getElementById('revenueChart');
        if (revenueCanvas) {
            // Destroy existing chart if it exists
            destroyChart('revenueChart');
            
            const revenueCtx = revenueCanvas.getContext('2d');
            const labels = quarterlyRevenue.map(qr => `Q${qr.quarter}`);
            const data = quarterlyRevenue.map(qr => qr.revenue);

            window.dashboardCharts['revenueChart'] = new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue ($)',
                        data: data,
                        backgroundColor: '#282828',
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { labels: { color: '#ccc' } },
                        tooltip: { backgroundColor: '#000', titleColor: '#ffd700', bodyColor: '#fff' } 
                    },
                    scales: {
                        y: { ticks: { color: '#ccc' } },
                        x: { ticks: { color: '#ccc' } }
                    }
                }
            });
        }
    }

});
