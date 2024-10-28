import { getTranslations } from "next-intl/server";

import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    token: string;
  };
};

const continueToCallback = async (redirectUrl: string) => {
  "use server";
  redirect(redirectUrl);
};

export default async (props: Props) => {
  const { token } = props.searchParams;
  const payload = jwtDecode(token) as { redirectUrl: string };

  const continueWithRedirect = continueToCallback.bind(
    this,
    payload.redirectUrl,
  );

  const t = await getTranslations();

  return (
    <div className="govie-width-container" style={{ width: "100%" }}>
      <b>This is a mock of FormsIE to use only during development </b>
      <p>Token:</p>
      {JSON.stringify(payload, null, 2)}
      <form action={continueWithRedirect}>
        <button type="submit" className="govie-button">
          Continue
        </button>
      </form>
    </div>
  );
};
