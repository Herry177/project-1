(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
});

//tax btn logic for both index and nzv

let taxSwitches = document.querySelectorAll(".taxbtns");
for (taxSwitch of taxSwitches){
  taxSwitch.addEventListener("click", () => {
    let taxInfos = document.querySelectorAll(".tax-info");
    for (info of taxInfos) {
      if (info.style.display != "inline") {
        info.style.display = "inline";
      } else {
        info.style.display = "none";
      }
    }
  });
}

//loading 

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.getElementById("skeleton-container").style.display = "none";
      document.getElementById("listing-container").style.display = "block";
    }, 1000); 

    setTimeout(() => {
      document.getElementById("skeleton-container2").style.display = "none";
      document.getElementById("main-container").style.display = "block";
    }, 1000);

    setTimeout(() => {
      document.getElementById("form-skeleton-container").style.display = "none";
      document.getElementById("form-main-container2").style.display = "block";
    }, 1000);

    setTimeout(() => {
      document.getElementById("skeleton-review-edit").style.display = "none";
      document.getElementById("main-review-edit").style.display = "block";
    }, 1000);

    setTimeout(() => {
      document.getElementById("skeleton-login").style.display = "none";
      document.getElementById("login-contains").style.display = "block";
    }, 1000);
    setTimeout(() => {
      document.getElementById("skeleton-signup").style.display = "none";
      document.getElementById("signup-contains").style.display = "block";
    }, 1000);
  });

let Explore_title = document.querySelector(".Explore");
let Startus_title = document.querySelector(".Startus");
let Explore_opt = document.querySelector("#Explore");
let Startus_opt = document.querySelector("#Startus");

// Show Explore and hide Startus
Explore_title.addEventListener("click", () => {
  Startus_opt.classList.add("Startus-opt");
  Startus_opt.classList.remove("margin-fix");
  Explore_opt.classList.toggle("margin-fix");
  
});

// Show Startus and hide Explore
 Startus_title.addEventListener("click", () => {
  Explore_opt.classList.add("Explore-opt");
  Explore_opt.classList.remove("margin-fix");
  Startus_opt.classList.toggle("margin-fix");
});
