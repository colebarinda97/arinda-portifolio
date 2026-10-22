(async function protectAdmin() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      window.location.replace("login.html");
      return;
    }

    const { data: isAdmin, error: roleError } =
      await supabaseClient.rpc("is_portfolio_admin");

    if (roleError || isAdmin !== true) {
      await supabaseClient.auth.signOut();
      window.location.replace("login.html");
      return;
    }

    console.log("Administrator verified.");

    // Load the editor only after authorization succeeds.
    const script = document.createElement("script");
    script.src = "admin.js";

    script.onload = () => {
      document.documentElement.classList.add("admin-authorized");

      console.log("Admin dashboard initialized.");
    };

    script.onerror = () => {
      console.error("Failed to load admin.js");
    };

    document.body.appendChild(script);
  } catch (error) {
    console.error("Authorization failed:", error);
    window.location.replace("login.html");
  }
})();
