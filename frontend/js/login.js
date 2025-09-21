
// login 

$("#loginForm").submit(function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();

    if (!email || !password) {
        alert("⚠️ Please enter both email and password");
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/v1/user/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email: email, password: password }),
        success: function (response, textStatus, xhr) {
            console.log("Full response:", response);
            console.log("HTTP status code:", xhr.status);

            if (xhr.status === 201) { // StatusList.Created
                alert("✅ " + response.message);

                // Save login info in localStorage
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("email", response.data.email);
                localStorage.setItem("role", response.data.role);

                // Check role and redirect accordingly
                if (response.data.role === "admin") {
                    window.location.href = "addDestination.html"; // admin page
                } else if (response.data.role === "USER") {
                    window.location.href = "index.html"; // user page
                } 
            } else {
                alert("❌ " + response.message);
            }
        },
        error: function (xhr) {
            console.error("AJAX error response:", xhr.responseText);
            if (xhr.status === 401) {
                alert("⚠️ Invalid password");
            } else if (xhr.status === 406) {
                alert("⚠️ Email not found");
            } else {
                alert("⚠️ Server error, please try again later.");
            }
        }
    });
});



// register

$("#signupForm").submit(function (e) {
    e.preventDefault();

    let firstName = $("#firstName").val().trim();
    let lastName  = $("#lastName").val().trim();
    let email     = $("#email").val().trim();
    let password  = $("#password").val().trim();
    let country   = $("#country").val();

    $.ajax({
        url: "http://localhost:8080/api/v1/user/register",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            firstname: firstName,
            lastname: lastName,
            email: email,
            password: password,
            country: country,
            role: "USER"
        }),success: function (response, textStatus, jqXHR) {
            console.log("Full response:", response);
            console.log("HTTP status:", jqXHR.status); // <- HTTP status code
        
            if (jqXHR.status === 201) { 
                alert("✅ " + response.message);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("email", response.data.email);
                window.location.href = "index.html";
            } else {
                alert("❌ " + response.message);
            }
        },
        error: function (xhr) {
            console.error("AJAX error response:", xhr.responseText); // 🔍 print error
            if (xhr.status === 406) {
                alert("⚠️ Email already exists");
            } else {
                alert("⚠️ Server error: " + xhr.responseText);
            }
        }
    });
});

