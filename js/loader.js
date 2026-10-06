document.addEventListener("DOMContentLoaded", () => {
    let progress = 0;
    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressText");
  
    if (!bar || !text) {
      console.error("Progress bar elements not found in DOM.");
      return;
    }
  
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
      } else {
        progress++;
        bar.style.width = progress + "%";
        text.textContent = progress + "%";
      }
    }, 50); // lower = faster
  });
  