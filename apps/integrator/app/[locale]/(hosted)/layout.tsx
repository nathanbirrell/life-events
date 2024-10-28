import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Banner from "../../components/Banner";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const t = await getTranslations("FeedbackBanner");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, locale);

  return (
    <>
      <Header locale={locale} />
      <div className="govie-width-container" style={{ width: "100%" }}>
        {isPublicServant && (
          <Banner
            tag={t("tag")}
            text={t.rich("bannerText", {
              mail: (chunks) => (
                <a className="govie-link" href={links.feedbackLink.href}>
                  {chunks}
                </a>
              ),
            })}
          />
        )}
        <div className="page-container">{children}</div>
      </div>
      <Footer />
    </>
  );
}
