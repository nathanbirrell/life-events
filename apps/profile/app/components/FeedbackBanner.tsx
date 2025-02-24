import { useTranslations } from "next-intl";

export default () => {
  const t = useTranslations("FeedbackBanner");
  return (
    <div className="govie-phase-banner">
      <p className="govie-phase-banner__content">
        <strong className="govie-tag govie-phase-banner__content__tag">
          {t("tag")}
        </strong>
        <span className="govie-phase-banner__text">
          {t.rich("bannerText", {
            mail: (chunks) => (
              <a
                className="govie-link"
                href="mailto:tiago.ramos@nearform.com?subject=Feedback"
              >
                {chunks}
              </a>
            ),
          })}
        </span>
      </p>
    </div>
  );
};
