import { AuthSession } from "auth/auth-session";
import logtoConfig from "../../../libraries/logtoConfig";
import { redirect, RedirectType } from "next/navigation";

export async function GET() {
  if (String(process.env.ALLOW_LOGIN) !== "true") {
    redirect("/", RedirectType.replace);
  }

  await AuthSession.login(logtoConfig);
}
