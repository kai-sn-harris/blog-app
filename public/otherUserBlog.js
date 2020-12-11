let showCommentsBtn = document.querySelector("#show-comments"),
commentsDiv = document.querySelector("#comments");

let shown = false;

showCommentsBtn.addEventListener("click", () => {
    commentsDiv.classList.toggle("hidden");
    shown = !shown;
    if(shown) showCommentsBtn.textContent = "Hide Comments";
    else showCommentsBtn.textContent = "Show comments";
});