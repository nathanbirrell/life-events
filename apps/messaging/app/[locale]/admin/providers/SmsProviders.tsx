import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { providerRoutes } from "../../../utils/routes";
import {
  searchKeyDeleteId,
  searchKeyProvider,
  searchValueSms,
} from "../../../utils/messaging";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async () => {
  const t = await getTranslations("settings.Sms");
  const sdk = await AuthenticationFactory.getMessagingClient();

  const { data: providers } = await sdk.getSmsProviders();
  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("nameTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("primaryHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("actionTableHeader")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {providers?.map((provider) => (
          <tr className="govie-table__row" key={provider.id}>
            <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
              {provider.providerName}
            </th>

            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {provider.isPrimary && t("primaryCellValue")}
            </td>

            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `${providerRoutes.url}/sms`,
                      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
                    );
                    url.searchParams.append("id", provider.id);
                    return url.href;
                  })()}
                >
                  {t("editLink")}
                </Link>
                <Link
                  href={(() => {
                    const url = new URL(
                      providerRoutes.url,
                      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
                    );
                    url.searchParams.append(searchKeyDeleteId, provider.id);
                    url.searchParams.append(searchKeyProvider, searchValueSms);
                    return url.href;
                  })()}
                  className="govie-link govie-!-margin-right-3"
                >
                  {t("deleteButton")}
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
