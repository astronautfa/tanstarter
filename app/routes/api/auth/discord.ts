import { createAPIFileRoute } from "@tanstack/start/api";
import { setCookie, setHeader } from "@tanstack/start/server";
import { generateCodeVerifier, generateState } from "arctic";

import { discord } from "~/lib/server/auth";

export const APIRoute = createAPIFileRoute("/api/auth/discord")({
  GET: async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = discord.createAuthorizationURL(state, codeVerifier, [
      "identify",
      "email",
    ]);

    setCookie("discord_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });
    setCookie("discord_code_verifier", codeVerifier, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    setHeader("Location", url.toString());

    return new Response(null, {
      status: 302,
    });
  },
});
