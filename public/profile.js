const editBtn = document.querySelector(".edit-btn"),
display = document.querySelector(".display"),
edit = document.querySelector(".edit");

editBtn.addEventListener("click", event => {
    display.classList.toggle("hidden");
    edit.classList.toggle("hidden");
    editBtn.textContent === "Edit" ? editBtn.textContent = "Display" : editBtn.textContent = "Edit";
});