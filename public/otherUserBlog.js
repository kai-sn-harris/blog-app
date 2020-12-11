let showCommentsBtns = document.querySelectorAll("#show-comments");

showCommentsBtns.forEach(btn => {
    let shown = false;
    btn.addEventListener("click", () => {
        btn.parentElement.querySelector("#comments").classList.toggle("hidden");
        shown = !shown;
        if(shown) btn.textContent = "Hide Comments";
        else btn.textContent = "Show comments";
    });
});