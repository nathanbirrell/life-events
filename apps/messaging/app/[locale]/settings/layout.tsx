import { getTranslations } from "next-intl/server";
import { messages, routes } from "../../utils";
import Footer from "../Footer";
import Header from "../Header";
import SideMenu from "../SideMenu";
import { getLinks } from "../../utils/messaging";
import { AuthenticationFactory } from "../../utils/authentication-factory";

export default async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const t = await getTranslations("AlphaBanner");
  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, params.locale);
  const authenticationContext = await AuthenticationFactory.getInstance();
  return (
    <>
      <Header locale={params.locale} />
      {/* All designs are made for 1440 px  */}
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <div className="govie-phase-banner">
          <p className="govie-phase-banner__content">
            <strong className="govie-tag govie-phase-banner__content__tag">
              {t("tag")}
            </strong>
            <span className="govie-phase-banner__text">
              {t.rich("bannerText", {
                anchor: (chunks) => (
                  <a className="govie-link" href={links.feedbackLink.href}>
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </p>
        </div>
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          <div style={{ display: "flex", gap: "30px" }}>
            <SideMenu
              locale={params.locale}
              options={await messages.sideMenuOptions(
                await authenticationContext.isPublicServant(),
              )}
              selected={routes.usersSettingsRoutes.slug}
              userName={(await authenticationContext.getUser()).name ?? ""}
            />
            <div style={{ width: "100%" }}>{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
