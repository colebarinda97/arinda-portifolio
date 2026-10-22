const loginForm = document.querySelector("#login-form");
const loginButton = document.querySelector("#login-btn");
const message = document.querySelector("#message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";
  message.textContent = "";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      message.textContent = error.message;
      message.style.color = "#f87171";
      return;
    }

    message.textContent = "Login successful!";
    message.style.color = "#4ade80";

    console.log("Authenticated user ID:", data.user.id);

    // We will add admin authorization and
    // secure redirection in the next lesson.
  } catch (error) {
    console.error("Login error:", error);

    message.textContent = "Something went wrong. Try again.";
    message.style.color = "#f87171";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});
