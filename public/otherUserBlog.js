let showCommentsBtns = document.querySelectorAll("#show-comments");

let shown = false;

showCommentsBtns.forEach(btn => {
    btn.addEventListener("click", event => {
        btn.parentElement.querySelector("#comments").classList.toggle("hidden");
        shown = !shown;
        if(shown) btn.textContent = "Hide Comments";
        else btn.textContent = "Show comments";
    });
});