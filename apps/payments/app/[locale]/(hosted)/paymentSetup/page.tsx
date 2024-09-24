import { getTranslations } from "next-intl/server";
import Link from "next/link";
import dayjs from "dayjs";
import {
  buildPaginationLinks,
  errorHandler,
  formatCurrency,
  mapTransactionStatusColorClassName,
  pageToOffset,
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../../../utils";
import { EmptyStatus } from "../../../components/EmptyStatus";
import Pagination from "../../../components/pagination";
import { routeDefinitions } from "../../../routeDefinitions";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { PageWrapper } from "../PageWrapper";

export default async function ({
  params: { locale },
  searchParams: { page, limit },
}: {
  params: { locale: string };
  searchParams: { page?: string; limit?: string };
}) {
  const t = await getTranslations("PaymentSetup.Payments");
  const tStatus = await getTranslations("PaymentSetup.paymentStatus");
  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
  };

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: transactionsResponse, error } =
    await paymentsApi.getTransactions(pagination);

  const errors = errorHandler(error);

  if (errors?.limit || errors?.offset) {
    return redirect("/error", RedirectType.replace);
  }

  const url = `/${locale}/${routeDefinitions.paymentSetup.path()}`;
  const links = buildPaginationLinks(
    url,
    transactionsResponse?.metadata?.links,
  );

  return (
    <PageWrapper locale={locale}>
      <div className="table-container">
        <h1 className="govie-heading-m">{t("title")}</h1>
        {transactionsResponse?.data.length === 0 ? (
          <EmptyStatus
            title={t("emptyPaymentsList.title")}
            description={t("emptyPaymentsList.description")}
            action={
              <Link href={`/${locale}/paymentSetup/providers`}>
                <button
                  id="button"
                  data-module="govie-button"
                  className="govie-button"
                >
                  {t("emptyPaymentsList.startHere")}
                </button>
              </Link>
            }
          />
        ) : (
          <div>
            <table className="govie-table">
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {t("table.status")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.date")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.title")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.amount")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="govie-table__body">
                {transactionsResponse?.data.map((trx) => (
                  <tr
                    className="govie-table__row"
                    key={trx.transactionId}
                    data-reference-code={trx.extPaymentId}
                  >
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <strong
                        className={`govie-tag ${mapTransactionStatusColorClassName(trx.status)} govie-body-s`}
                        style={{ marginBottom: "0px" }}
                      >
                        {tStatus(trx.status)}
                      </strong>
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {dayjs(trx.updatedAt).format("DD/MM/YYYY - HH:mm")}
                    </td>

                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {trx.title}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {formatCurrency(trx.amount)}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <Link
                        href={`/${locale}/paymentSetup/transaction/${trx.transactionId}`}
                      >
                        {t("table.details")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination links={links} currentPage={currentPage}></Pagination>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
