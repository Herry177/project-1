let slides = document.querySelectorAll(".slide");
let previouss = document.querySelectorAll(".previous");
let nexts = document.querySelectorAll(".next");

let counter = 0;

slides.forEach((slide, index) => {
  slide.style.left = `${index * 100}%`;
});

for (next of nexts) {
  next.addEventListener("click", () => {
    counter++;
    if (counter > slides.length - 1) {
      counter = slides.length - 1;
    }
    
    slideImges();
  });
}

for (previous of previouss) {
  previous.addEventListener("click", () => {
    counter--;
    if (counter < 0) {
      counter = 0;
    }
    slideImges();
  });
}

const slideImges = () => {
  slides.forEach((slide) => {
    slide.style.transform = `translateX(-${counter * 100}%)`;
  });
};
