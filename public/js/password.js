// pass show hide feature

let passfield = document.querySelector(".passfield");
let opt = document.querySelector(".opt");
opt.addEventListener("click", () => {
  if (passfield.type === "password") {
    passfield.type = "text";
    opt.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passfield.type = "password";
    opt.classList.replace("fa-eye-slash", "fa-eye");
  }
});

//type writing effect login

let app = document.getElementById("app");
let typewriter = new Typewriter(app, {
  loop: true,
  delay: 75,
});

typewriter
  .pauseFor(1000)
  .typeString("Wanderlust!")
  .pauseFor(1500)
  .deleteAll(50)
  .typeString(" & explore the world!")
  .pauseFor(2000)
  .deleteAll(50)
  .start();

//type writing effect sign up

let app1 = document.getElementById("app1");

let typewriter1 = new Typewriter(app1, {
  loop: true,
  delay: 75,
});

typewriter1
  .pauseFor(1000)
  .typeString("Wanderlust Awaits!")
  .pauseFor(1500)
  .deleteAll(50)
  .typeString("Join us & explore the world!")
  .pauseFor(2000)
  .deleteAll(50)
  .start();


//genrate pass feature


let random = document.querySelector(".random");
let passfield2 = document.querySelector(".random-pass");

random.addEventListener("click", () => {
    let num = Math.floor(Math.random() * 9000) + 1000;
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let char1 = letters.charAt(Math.floor(Math.random() * letters.length));
    let char2 = letters.charAt(Math.floor(Math.random() * letters.length));
    let char3 = letters.charAt(Math.floor(Math.random() * letters.length));
    let char4 = letters.charAt(Math.floor(Math.random() * letters.length));
    let specialChars = "!@#$%^&*()_-+={}|;:<,>.?"
    let char5 = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    let char6 = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    passfield2.value = num.toString()+char1+char2+char3+char4+char5+char6+num.toString()
    
});