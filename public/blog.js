const form = document.querySelector("#del-form"),
yesBtn = document.querySelector("#yes-btn"),
noBtn = document.querySelector("#no-btn");

function disableScroll() { 
    // Get the current page scroll position 
    scrollTop = window.pageYOffset || document.documentElement.scrollTop; 
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, 
  
    // if any scroll is attempted, set this to the previous value 
    window.onscroll = function() { 
        window.scrollTo(scrollLeft, scrollTop); 
    }; 
} 
  
function enableScroll() { 
    window.onscroll = function() {}; 
} 

function openModal() {
    let modal = document.querySelector("#modal");
    modal.style.display === "none" ? modal.style.display = "flex" : modal.style.display = "none";
}

form.addEventListener("submit", event => {
    event.preventDefault();
    disableScroll();
    openModal();
});

yesBtn.addEventListener("click", () => {
    form.submit();
});

noBtn.addEventListener("click", () => {
    enableScroll();
    modal.style.display = "none";
});