import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin";

export async function POST(req: NextRequest) {
  try {
    // Determine how the client sent the password: via an HTML form or as JSON.
    const contentType = req.headers.get("content-type") || "";
    //check if the request is from an HTML form or a JSON client
    const isFormData = contentType.includes("application/x-www-form-urlencoded");
    let password = "";
    let method = "POST";

    if (isFormData) {
      const formData = await req.formData();
      password = formData.get("password") as string;
      method = (formData.get("_method") as string) || "POST";
    } else {
      const body = await req.json();
      password = body.password;
    }

    // Handle logout if the method is DELETE
    if (method === "DELETE") {
      return handleLogout(req);
    }

    // Check if the password is correct
    if (password === "123") {
      // Generate JWT token
      const secret = env.JWT_SECRET;
      const token = jwt.sign({ user: "admin" }, secret, { expiresIn: "24h" });

      // When logging in via Playwright's request context (JSON), avoid redirects.
       const response = contentType.includes("application/json")
         ? NextResponse.json({ success: true })
         : NextResponse.redirect(new URL("/", req.url));

      response.cookies.set("auth_token", token, {
        // prevent client side javascript from accessing the token to mitigate xss attack
        httpOnly: true,
        // make the token available on all paths of the site
        path: "/",
      });

      // return respond to client
      return response;
    }

    // if password is incorrect
    return contentType.includes("application/json")
      ? NextResponse.json({ success: false }, { status: 401 })
      : NextResponse.redirect(new URL("/?error=1", req.url));
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// handle logout by deleting the auth_token cookie and redirecting to the login page
export async function DELETE(req: NextRequest) {
  return handleLogout(req);
}

function handleLogout(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const response = contentType.includes("application/json")
    ? NextResponse.json({ success: true })
    : NextResponse.redirect(new URL("/", req.url));

  //remove cookie so subsequent requests are treated as logged out.
  response.cookies.delete("auth_token");
  return response;
}
