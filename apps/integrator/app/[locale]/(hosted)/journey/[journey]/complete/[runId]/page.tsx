import { getTranslations } from "next-intl/server";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import Link from "next/link";
import dayjs from "dayjs";

type Props = {
  params: {
    locale: string;
    journey: string;
    runId: string;
  };
};

export default async (props: Props) => {
  const { locale, journey: journeyId, runId } = props.params;

  const t = await getTranslations("JourneyComplete");

  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  const client = await AuthenticationFactory.getIntegratorClient();
  const result = await client.getJourneySummary({
    journeyId,
    runId,
  });

  const summary = result.data?.data;

  return (
    <div className="width-container" style={{ width: "100%" }}>
      <div
        style={{
          marginTop: "32px",
        }}
      >
        <h1 className="govie-heading-l">{t("title")}</h1>
      </div>
      <div
        style={{
          fontSize: "24px",
          marginBottom: "32px",
        }}
      >
        {t("description")}
      </div>

      <dl className="govie-summary-list">
        <div
          className="govie-summary-list__row"
          style={{ borderBottom: "none" }}
        >
          <dt className="govie-summary-list__key">{t("applicationFor")}</dt>
          <dt className="govie-summary-list__value">{summary?.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("submissionID")}</dt>
          <dt className="govie-summary-list__value">{summary?.runId}</dt>
        </div>
        <div className="govie-summary-list__row" style={{ borderWidth: "2px" }}>
          <dt className="govie-summary-list__key">{t("dateOfRequest")}</dt>
          <dt className="govie-summary-list__value">
            {dayjs(summary?.createdAt).format("DD/MM/YYYY")}
          </dt>
        </div>
      </dl>

      {summary?.returnUrl && (
        <Link href={summary.returnUrl}>
          <button
            id="button"
            data-module="govie-button"
            className="govie-button"
          >
            {summary?.actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
};
