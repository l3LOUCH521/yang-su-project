"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  // extract the value of  input box from the form data
  const password = formData.get("password");
  
  // authenticate the current client using a hard-coded password
  if (password === "123") {
    // retrieve cookie store from next.js request headers 
    const cookieStore = await cookies();

    // set a cookie named auth_token with value signed-in to indicate the user is logged in
    cookieStore.set("auth_token", "signed-in", {
      // prevent client-side javascript from accessing the cookie to mitigate XSS attack
      httpOnly: true,

      // make the cookie effective for entire website path not just the current page
      path: "/",
    });
  }

  // redirect to the home page after login no matter the password is correct or not
  redirect("/");
}

export async function logout() {
  // retrieve cookie store from next.js request headers 
  const cookieStore = await cookies();
  
  // delete auth_token cookie to log out
  cookieStore.delete("auth_token");
  
  // redirect to the login page after logout
  redirect("/");
}
