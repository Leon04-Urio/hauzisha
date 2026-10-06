document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.querySelector('.map-container');
    const ourLocation = "Kilimani, Nairobi";

    fetch(`./api/map.php?location=${encodeURIComponent(ourLocation)}`)
        .then(res => res.json())
        .then(data => {
            if (mapContainer && data.url) {
                mapContainer.innerHTML = `
                    <iframe
                        src="${data.url}"
                        style="border:0; width:100%; height:100%;"
                        allowfullscreen=""
                        loading="lazy">
                    </iframe>
                `;
            }
        })
        .catch(err => console.error("Map fetch error:", err));
});
