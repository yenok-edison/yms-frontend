const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

const signinTab = document.querySelectorAll(".tab")[0];
const signupTab = document.querySelectorAll(".tab")[1];

function showSignup() {

    signinForm.style.display = "none";
    signupForm.style.display = "block";

    signinTab.classList.remove("active");
    signupTab.classList.add("active");
}

function showSignin() {

    signinForm.style.display = "block";
    signupForm.style.display = "none";

    signupTab.classList.remove("active");
    signinTab.classList.add("active");
}

function showToastPage(message,type){

    const toast = document.getElementById("toast");

    toast.className = "";

    toast.classList.add("show");
    toast.classList.add(type);

    toast.innerText = message;

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);

}


document
  .getElementById("signupFormElement")
  .addEventListener("submit", async function(e) {

    e.preventDefault();

    const school_name =
      document.getElementById("signupFirstName").value;

    const email =
      document.getElementById("signupEmail").value;

    const phone =
      document.getElementById("signupPhone").value;

    const password =
      document.getElementById("signupPassword").value;

    const confirmPassword =
      document.getElementById("signupConfirmPassword").value;

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/api/signup/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          school_name,
          email,
          phone,
          password
        })
      }
    );

    const data = await response.json();

    // if(data.status === "success"){

    //   alert("Account Created Successfully");

    //   // Redirect to signin
    //   showSignin();

    // } else {

    //   alert(data.message);

    // }
    if (data.status === "success") {

      showToastPage(
          "Account created successfully 🎉",
          "success"
      );

      // small delay so user can see toast
      setTimeout(() => {

          showSignin(); // switch to login form

          // optional: reset signup form
          document.getElementById("signupFormElement").reset();

      }, 1200);

    } else {

        showToastPage(
            data.message || "Signup failed",
            "error"
        );

    }

});



function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.className = "";

    toast.classList.add("show");
    toast.classList.add(type);

    toast.innerText = message;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


document
  .getElementById("loginFormElement")
  .addEventListener("submit", async function(e){

    e.preventDefault();

    const email =
      document.getElementById("loginEmail").value;

    const password =
      document.getElementById("loginPassword").value;

    try{

        const response = await fetch(
          `${CONFIG.API_BASE_URL}/api/signin/`,
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              email,
              password
            })
          }
        );

        const data = await response.json();

        if(data.status === "success"){

            showToast("Login Successful", "success");
            sessionStorage.setItem("loggedIn", "true");
            setTimeout(() => {
                window.location.href = "page.html";
            }, 1500);

        }
        else{

            showToast(data.message, "error");

        }

    }
    catch(error){

        showToast("Server Error", "error");

    }

});

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("ri-eye-off-line");
        icon.classList.add("ri-eye-line");       // ✅ Show eye open
    } else {
        input.type = "password";
        icon.classList.remove("ri-eye-line");
        icon.classList.add("ri-eye-off-line");   // ✅ Show eye closed
    }
}