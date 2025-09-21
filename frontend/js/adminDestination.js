function toggleMenu() {
  const dropdown = document.getElementById("menuDropdown");
  const arrow = document.getElementById("menu-arrow");
  dropdown.classList.toggle("show");
  arrow.style.transform = dropdown.classList.contains("show")
    ? "rotate(180deg)"
    : "rotate(0deg)";
}

window.addEventListener("click", function (e) {
  const menu = document.querySelector(".menu-container");
  if (!menu.contains(e.target)) {
    document.getElementById("menuDropdown").classList.remove("show");
    document.getElementById("menu-arrow").style.transform = "rotate(0deg)";
  }
});

$(document).ready(function () {
  var token = localStorage.getItem("token");

  if (token) {
    $("#profile").show();
    $("#logoutbutton").show();
    $("#loginButton").hide();
    $("#signupButton").hide();
  } else {
    $("#profile").hide();
    $("#logoutbutton").hide();
    $("#loginButton").show();
    $("#signupButton").show();
  }

  $("#logoutbutton").click(function () {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      document.getElementById("profile").style.display = "none";
      alert("You have been logged out!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Logout error:", err);
      alert("You have been logged out!");
      window.location.href = "index.html";
    }
  });

  const cardsContainer = $("#cardsContainer");
  const form = $("#destinationForm");
  const fileInput = $("#fileInput");
  const preview = $("#preview");
  const destinationImageField = $("#destinationimage");
  const editIdField = $("#editId");
  const submitBtn = $("#submitBtn");
  const searchInput = $("#searchInput");
  let destinations = [];
  const descLimit = 60;

  function showAlert(message, type) {
    if (!$("#alertMessage").length)
      $("<div id='alertMessage'></div>").insertBefore(".container");
    $("#alertMessage")
      .text(message)
      .removeClass("alert-success alert-error")
      .addClass(`alert-${type}`)
      .show();
    setTimeout(() => $("#alertMessage").hide(), 3000);
  }

  function truncate(text, limit) {
    return text.length <= limit ? text : text.substring(0, limit) + "...";
  }

  function renderCards(list) {
    cardsContainer.empty();
    if (list.length === 0) {
      cardsContainer.html("<p>No destinations found.</p>");
      return;
    }

    list.forEach((dest) => {
      let isTruncated = dest.description.length > descLimit;
      let shortDesc = truncate(dest.description, descLimit);

      const imageUrl = dest.destinationimage
        ? dest.destinationimage
        : "assets/default-placeholder.png";

      const card = $(`
        <div class="card">
          <h2 style="display:none;">${dest.id}</h2>
          <img src="${imageUrl}" alt="Destination Image">
          <h3>${dest.country}, ${dest.city}</h3>
          <p class="desc-text">${isTruncated ? shortDesc : dest.description}</p>
          ${isTruncated ? `<span class="see-more">See more</span>` : ""}
          <p class="${
            dest.status === "Active" ? "status-active" : "status-inactive"
          }">${dest.status}</p>
          <div class="card-actions">
            <button class="edit-btn">✏ Edit</button>
            <button class="delete-btn">🗑 Delete</button>
          </div>
        </div>
      `);

      // See more toggle
      card.find(".see-more").click(function () {
        const descEl = card.find(".desc-text");
        if ($(this).text() === "See more") {
          descEl.text(dest.description);
          $(this).text("See less");
        } else {
          descEl.text(shortDesc);
          $(this).text("See more");
        }
      });

      // Buttons
      card.find(".edit-btn").click(() => editDestination(dest.id));
      card.find(".delete-btn").click(() => deleteDestination(dest.id));

      cardsContainer.append(card);
    });
  }

  function resetForm() {
    form[0].reset();
    editIdField.val("");
    preview.hide();
    submitBtn.text("Add Destination");
    destinationImageField.val(""); // Clear the image field on reset
  }

  function editDestination(id) {
    const dest = destinations.find((d) => d.id === id);
    if (!dest) return;
    $("#country").val(dest.country);
    $("#city").val(dest.city);
    $("#description").val(dest.description);
    $("#status").val(dest.status);
    $("#longitude").val(dest.longitude);
    $("#latitude").val(dest.latitude);
    editIdField.val(dest.id);
    
    // Show the image preview if it exists
    if (dest.destinationimage) {
      preview.show().attr("src", dest.destinationimage);
      destinationImageField.val(dest.destinationimage);
    } else {
      preview.hide();
    }
    
    submitBtn.text("Update Destination");
  }

  // ================== AJAX CRUD FUNCTIONS ==================

  function saveOrUpdateDestination(destination) {
    const id = destination.id;

    if (id) {
      // UPDATE
      $.ajax({
        url: `http://localhost:8080/api/v1/tourDestination/updateTourDestination/${id}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(destination),
        success: function (response) {
          if (response.code === 200) {
            showAlert("Destination updated successfully!", "success");
            loadDestinations();
            resetForm();
          } else {
            showAlert("Failed to update destination", "error");
          }
        },
        error: function (xhr) {
          console.error("Update error:", xhr.responseText);
          showAlert("Error updating destination", "error");
        },
      });
    } else {
      // SAVE
      $.ajax({
        url: "http://localhost:8080/api/v1/tourDestination/saveTourDestination",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(destination),
        success: function (response) {
          if (response.code === 201) {
            showAlert("Destination saved successfully!", "success");
            loadDestinations();
            resetForm();
          } else {
            showAlert("Failed to save destination", "error");
          }
        },
        error: function (xhr) {
          console.error("Save error:", xhr.responseText);
          showAlert("Error saving destination", "error");
        },
      });
    }
  }

  function deleteDestination(id) {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    $.ajax({
      url: `http://localhost:8080/api/v1/tourDestination/deleteTourDestination/${id}`,
      method: "DELETE",
      success: function (response) {
        if (response.code === 201) {
          showAlert("Destination deleted successfully!", "success");
          loadDestinations();
        } else {
          showAlert("Failed to delete destination", "error");
        }
      },
      error: function (xhr) {
        console.error("Delete error:", xhr.responseText);
        showAlert("Error deleting destination", "error");
      },
    });
  }

  function loadDestinations() {
    $.ajax({
      url: "http://localhost:8080/api/v1/tourDestination/AllgetTourDestination",
      method: "GET",
      success: function (response) {
        if (response.code === 200 && response.data) {
          destinations = response.data;
          renderCards(destinations);
        } else {
          showAlert("No destinations found", "error");
          renderCards([]);
        }
      },
      error: function (xhr) {
        console.error("Load error:", xhr.responseText);
        showAlert("Failed to load destinations", "error");
      },
    });
  }

  // ================== FORM HANDLING ==================
  form.submit(function (e) {
    e.preventDefault();

    const id = editIdField.val();
    const newDest = {
      id: id || null,
      country: $("#country").val(),
      city: $("#city").val(),
      destinationimage: destinationImageField.val(), // Use the value from the field
      description: $("#description").val(),
      status: $("#status").val(),
      longitude: $("#longitude").val(),
      latitude: $("#latitude").val(),
    };

    saveOrUpdateDestination(newDest);
  });

  $("#resetBtn").click(resetForm);

  // Cloudinary image upload handler
  fileInput.change(function () {
    const file = this.files[0];
    if (!file) return;

    // Show preview before upload
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.attr("src", e.target.result).show();
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const cloudName = "ddtaax8zb"; // Your cloud name
    const uploadPreset = "ml_default"; // Your upload preset

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    $.ajax({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        console.log("Cloudinary upload success:", response);
        // Set the returned URL into the destination image field
        destinationImageField.val(response.secure_url);
        showAlert("Image uploaded successfully!", "success");
      },
      error: function (xhr) {
        console.error("Cloudinary upload error:", xhr.responseText);
        showAlert("Image upload failed!", "error");
        // Clear the file input on error
        fileInput.val('');
        preview.hide();
      },
    });
  });

  searchInput.on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    const filtered = destinations.filter(
      (d) =>
        d.country.toLowerCase().includes(searchTerm) ||
        d.city.toLowerCase().includes(searchTerm) ||
        d.status.toLowerCase().includes(searchTerm)
    );
    renderCards(filtered);
  });

  // Initial load
  loadDestinations();
});