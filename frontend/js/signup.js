// ✅ Register / Login form submit handler
$("#loginForm").on("submit", function(e){
    e.preventDefault();

    // ---- Get values ----
    let firstName = $("#firstName").val().trim();
    let lastName = $("#lastName").val().trim();
    let country = $("#country").val().trim();
    let email = $("#email").val().trim();
    let password = $("#password").val();
    let role = "USER";

    // ---- Simple validation ----
    if(firstName === "" || lastName === "" || email === "" || password === "" || country === ""){
        alert("⚠️ All fields are required!");
        return;
    }

    // ---- Disable button + show loading ----
    $("#submitBtn").prop("disabled", true);
    $("#btnText").hide();
    $("#loadingSpinner").show();

    // ---- AJAX request ----
    $.ajax({
        url: "http://localhost:8080/api/v1/user/register",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            fustname: firstName,   // ⚠️ backend DTO typo එකට match කරලා දාලා
            lastname: lastName,
            country: country,
            email: email,
            password: password,
            role: role
        }),
        success: function(response){
            console.log("API Response:", response);

            if(response.statusCode === 201 || response.statusCode === "Created"){ 
                // ✅ Save token
                localStorage.setItem("authToken", response.data.token);
                localStorage.setItem("email", response.data.email);

                $("#successMessage").show();
                $("#loginForm")[0].reset();

                setTimeout(function(){
                    $("#successMessage").hide();
                    window.location.href = "/dashboard.html";
                }, 2000);

            } else {
                Swal.fire({
                    title: "✅ Registration Success",
                    icon: "success",
                    draggable: true
                  });
                // alert(" ✅ Registration Success: " + (response.message || "Unknown error"));
            }
        },
        error: function(xhr, status, error){
            console.error("Error:", error);
            alert("Server error occurred!");
        },
        complete: function(){
            // ---- Reset button ----
            $("#submitBtn").prop("disabled", false);
            $("#btnText").show();
            $("#loadingSpinner").hide();
        }
    });

});
