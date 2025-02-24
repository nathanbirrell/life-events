import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "../../styles/globals.scss";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { headers } from "next/headers";
import FeedbackBanner from "../../components/FeedbackBanner";
import styles from "./layout.module.scss";
import AnalyticsTracker from "analytics/components/AnalyticsTracker";
import favicon from "../../../public/favicon.ico";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import hasCitizenPermissions from "./utils/hasCitizenPermissions";
import { hasPermissions } from "auth/check-permissions";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Life events",
  icons: [
    {
      rel: "icon",
      url: favicon.src,
    },
  ],
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = await getTranslations();
  const authFactory = AuthenticationFactory.getInstance();
  await authFactory.getContext();

  //TODO: IMPLEMENT ACTUAL VERIFICATION LEVEL FROM PROFILE API
  const verificationLevel = 2;

  return (
    <html lang={locale}>
      <head>
        <title>{t("title")}</title>
      </head>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <AnalyticsTracker
          userId={userId}
          customDimensions={{ dimension1: verificationLevel }}
        /> */}

        <Header showHamburgerButton={false} locale={locale} />
        {/* All designs are made for 1440 px  */}
        <main className={styles.mainContainer}>
          <FeedbackBanner locale={locale} />
          <div style={{ margin: "0 auto", paddingTop: "20px" }}>{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
