$(document).ready(function () {
    var token = localStorage.getItem('token');

    if (token) {
        // User is logged in → show profile & logout, hide login & signup
        $("#profile").show();
        $("#logoutbutton").show();
        $("#loginButton").hide();
        $("#signupButton").hide();
    } else {
        // User is not logged in → hide profile & logout, show login & signup
        $("#profile").hide();
        $("#logoutbutton").hide();
        $("#loginButton").show();
        $("#signupButton").show();
    }

    // Optional: handle logout
    $("#logoutbutton").click(function() {
        localStorage.removeItem('token');
        location.reload(); // refresh page to update menu
    });

    // ✅ Ajax call
    let ajaxOptions = {
        url: "http://localhost:8080/api/v1/tourDestination/AllgetTourDestination",
        type: "GET",
        success: function (response) {
            console.log("Full response:", response);
    
            if (response.code === 200 || response.code === 201) {
                let container = $("#destinationsContainer");
                container.empty();
    
                let firstThree = response.data.slice(0, 3);
    
                firstThree.forEach(dest => {
                    let card = `
                        <a class="tile" href="#" aria-label="Explore ${dest.city}">
                            <!-- Top side: Country -->
                            <div class="card-country">${dest.country}</div>
    
                            <!-- Image -->
                            <img src="${dest.destinationimage}" alt="${dest.city} in ${dest.country}" />
    
                            <!-- Bottom side: City -->
                            <span class="badge">${dest.city}</span>
                        </a>
                    `;
                    container.append(card);
                });
            } else {
                console.warn("No destinations found:", response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching destinations:", error);
        }
    };
    

    // 🛡️ Only add token header if valid
    if (token && token.trim() !== "") {
        ajaxOptions.headers = {
            "Authorization": "Bearer " + token
        };
    }

    $.ajax(ajaxOptions);
});

    
    $("#logoutbutton").click(function () {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("role");
            style = document.getElementById("profile").style.display = "none";
            alert("You have been logged out!");
            window.location.href = "index.html";
        } catch (err) {
            console.error("Logout error:", err);
            alert("You have been logged out!");
            window.location.href = "index.html";
        }
    });


function toggleMenu() {
    const menu = document.getElementById('menuDropdown');
    const arrow = document.getElementById('menu-arrow');
    menu.classList.toggle('show');
    arrow.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
  }

