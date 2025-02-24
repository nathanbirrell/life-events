import Link from "next/link";
import { useTranslations } from "next-intl";
import ProviderStatusTag from "./ProviderStatusTag";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import { errorHandler } from "../../../../utils";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";

export default async () => {
  const t = useTranslations("PaymentSetup.Providers");
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();

  const { data: providers, error } = await paymentsApi.getProviders();

  if (error) {
    errorHandler(error);
  }

  if (!providers || providers.length === 0) {
    return (
      <EmptyStatus
        title={t("empty.title")}
        description={t("empty.description")}
      />
    );
  }

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("table.provider")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("table.status")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("table.account")}
          </th>
          <th
            scope="col"
            className="govie-table__header govie-table__header--numeric"
          >
            {t("table.actions")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {providers.map((provider) => (
          <tr key={provider.id} className="govie-table__row">
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {provider.type}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <ProviderStatusTag status={provider.status}></ProviderStatusTag>
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {provider.name}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s govie-table__header--numeric">
              <Link href={`providers/${provider.id}`}>{t("table.edit")}</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
