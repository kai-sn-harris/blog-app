const forms = document.querySelectorAll(".del-form"),
yesBtn = document.querySelector("#yes-btn"),
noBtn = document.querySelector("#no-btn");

function openModal() {
    let modal = document.querySelector("#modal");
    modal.style.display === "none" ? modal.style.display = "flex" : modal.style.display = "none";
    modal.style.marginTop = `${window.scrollY}px`;
}

let toSubmit;

forms.forEach(form => {
    form.addEventListener("submit", event => {
        toSubmit = form;
        event.preventDefault();
        // remove scroll bar from body (also prevents scrolling)
        document.querySelector("body").style.overflowY = "hidden";
        openModal();
    });
});

yesBtn.addEventListener("click", () => {
    toSubmit.submit();
});

noBtn.addEventListener("click", () => {
    modal.style.display = "none";
    // Add scroll back
    document.querySelector("body").style.overflowY = "scroll";
    toSubmit = null;
});