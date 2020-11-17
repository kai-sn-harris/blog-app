const editBtn = document.querySelector(".edit-btn"),
display       = document.querySelector(".display"),
edit          = document.querySelector(".edit");

let displayMode = true;

const changeTab = () => {
    display.classList.toggle("hidden");
    edit.classList.toggle("hidden");
    displayMode = !displayMode;
    // We are in edit mode (says display because if we click the button we go to display mode)
    if(!displayMode) {
        document.querySelector("input#username").value = username;
        document.querySelector("textarea#bio").value = bio;
        document.querySelector("input#private").checked = private;
    }
    displayMode ? editBtn.textContent = "Edit" : editBtn.textContent = "Back";
}

editBtn.addEventListener("click", changeTab);
if(tab === "edit") changeTab();