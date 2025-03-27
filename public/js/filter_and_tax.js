
  let filters = document.querySelector(".filters");
  let scrollLeft = document.querySelector(".fa-caret-left");
  let scrollRight = document.querySelector(".fa-caret-right");

  scrollLeft.addEventListener("click", () => {
    filters.scrollBy({ left: -200, behavior: "smooth" });
  });

  scrollRight.addEventListener("click", () => {
    filters.scrollBy({ left: 200, behavior: "smooth" });
  });

