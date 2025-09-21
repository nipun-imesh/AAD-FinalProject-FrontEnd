let editingTourId = null;

// Upload image to Cloudinary
function uploadImage() {
  $('#fileInput').click();
}

$('#fileInput').on('change', function () {
  const file = this.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");

  $.ajax({
    url: "https://api.cloudinary.com/v1_1/ddtaax8zb/image/upload",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      $('#image').val(res.secure_url);
      alert("Image uploaded successfully!");
    },
    error: function () {
      alert("Image upload failed.");
    }
  });
});

// Handle form submission
$("#tourForm").on("submit", function(e) {
  e.preventDefault();

  const tour = {
    country: $("#country").val().trim(),
    city: $("#city").val().trim(),
    date: $("#date").val().trim(),
    duration: $("#duration").val().trim(),
    price: parseInt($("#price").val()) || 0,
    description: $("#description").val().trim(),
    image: $("#image").val().trim(),
    status: $("#status").val().trim()
  };

  if (!tour.country || !tour.city || !tour.date || !tour.duration || !tour.price || !tour.image) {
    return alert("Please fill all required fields.");
  }

  if (editingTourId) {
    updateTour(editingTourId, tour);
  } else {
    saveTour(tour);
  }
});

// Save new tour
function saveTour(tour) {
  $.ajax({
    url: "http://localhost:8080/api/v1/customerTour/addTour",
    type: "POST",
    contentType: "application/json",
    // headers: { "Authorization": "Bearer " + token },
    data: JSON.stringify(tour),
    success: function(res) {
      alert("Tour saved successfully!");
      $("#tourForm")[0].reset();
      editingTourId = null;
      fetchTours();
    },
    error: function(err) {
      console.error("Error saving tour:", err);
      alert("Something went wrong while saving the tour.");
    }
  });
}

// Fetch all tours
function fetchTours() {
  $.ajax({
    url: "http://localhost:8080/api/v1/customerTour/AllgetTours",
    type: "GET",
    success: function(res) {
      if (res && res.data) renderTours(res.data);
    },
    error: function(err) {
      console.error("Failed to fetch tours", err);
    }
  });
}

// Render tours in the page
function renderTours(tours) {
  const $list = $("#tourList");
  $list.empty();

  tours.forEach(tour => {
    const $div = $(`
      <div class="panel tour-card">
        <img src="${tour.image}" alt="${tour.city}">
        <h3>${tour.city}, ${tour.country}</h3>
        <p><b>Date:</b> ${tour.date} | <b>Duration:</b> ${tour.duration}</p>
        <p><b>Price:</b> $${tour.price}</p>
        <p><b>Status:</b> ${tour.status}</p>
        <p>${tour.description}</p>
        <button class="btn small" onclick="editTour('${tour.id}')">Edit</button>
        <button class="btn secondary small" onclick="deleteTour('${tour.id}')">Delete</button>
      </div>
    `);
    $list.append($div);
  });
}

// Edit tour
function editTour(id) {
  $.ajax({
    url: "http://localhost:8080/api/v1/customerTour/AllgetTours",
    type: "GET",
    success: function(res) {
      const tour = res.data.find(t => t.id === id);
      if (!tour) return alert("Tour not found");

      $('#country').val(tour.country);
      $('#city').val(tour.city);
      $('#date').val(tour.date);
      $('#duration').val(tour.duration);
      $('#price').val(tour.price);
      $('#description').val(tour.description);
      $('#status').val(tour.status);
      $('#image').val(tour.image);
      editingTourId = tour.id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    error: function(err) {
      console.error("Failed to fetch tour for edit", err);
    }
  });
}

// Update tour
function updateTour(id, tour) {
  tour.id = id;
  $.ajax({
    url: "http://localhost:8080/api/v1/customerTour/updateTour",
    type: "PATCH",
    contentType: "application/json",
    data: JSON.stringify(tour),
    success: function(res) {
      alert("Tour updated successfully!");
      $("#tourForm")[0].reset();
      editingTourId = null;
      fetchTours();
    },
    error: function(err) {
      console.error("Error updating tour:", err);
      alert("Something went wrong while updating the tour.");
    }
  });
}

// Delete tour
function deleteTour(id) {
  if (!confirm("Delete this tour?")) return;
  $.ajax({
    url: `http://localhost:8080/api/v1/customerTour/deleteTour/${id}`,
    type: "DELETE",
    success: function() {
      fetchTours();
    },
    error: function(err) {
      console.error(err);
      alert("Error deleting tour.");
    }
  });
}

// Initial load
fetchTours();
