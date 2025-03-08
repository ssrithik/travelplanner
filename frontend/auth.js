
document.addEventListener("DOMContentLoaded", function () {
    // Get buttons
    const exploreBtn = document.getElementById("exploreBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Check login status
    function isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true";
    }

    // Handle "Explore Destinations" click
    if (exploreBtn) {
        exploreBtn.addEventListener("click", function (event) {
            if (!isLoggedIn()) {
                event.preventDefault(); // Stop navigation
                window.location.href = "login.html"; // Redirect to login
            } else {
                window.location.href = "explore.html"; // Redirect to explore page
            }
        });
    }

    // Handle Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("username"); 
            localStorage.removeItem("isLoggedIn"); // Clear login state
            window.location.href = "login.html"; // Redirect to login page
        });
    }
});

