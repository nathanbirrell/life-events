import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pgpool } from "../../dbConnection";
import { awsFileBucket, s3ClientConfig } from "../../utils";
import { ListRow } from "../[event]/[...action]/RenewDriversLicence/CheckYourDetails";
import {
  NextPageProps,
  RenewDriversLicenceFlow,
} from "../[event]/[...action]/types";

type Props = NextPageProps & {
  flowData: RenewDriversLicenceFlow;
  hideFormButtons: boolean;
  flow: string;
  userId: string;
};

export default async ({
  userId,
  hideFormButtons,
  flow,
  searchParams,
  flowData,
}: Props) => {
  const t = await getTranslations("Admin.RenewLicenceUserDetails");
  async function approveAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    await pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', now()::DATE::TEXT)
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow]
    );

    redirect("/admin");
  }

  let proofOfAddressDownloadUrl: string | undefined;

  // New link is generated on each render, but expires after 5 minutes. This might not be desirable but there has been no specifications
  if (flowData.proofOfAddressFileId) {
    const s3Client = new S3Client({
      ...s3ClientConfig,
      endpoint: "http://127.0.0.1:4566",
    });

    const command = new GetObjectCommand({
      Bucket: awsFileBucket,
      Key: `${userId}/${flowData.proofOfAddressFileId}`,
    });
    proofOfAddressDownloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 5 * 60,
    });
  }
  const searchParamsWithRejectionOpen = new URLSearchParams(searchParams);
  searchParamsWithRejectionOpen.append("open", "rejection");
  return (
    <>
      <div className="govie-heading-l">
        {t("title", { flow: t(flow).toLowerCase() })}
      </div>
      <div className="govie-heading-m">{flowData.userName}</div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow item={{ key: t("name"), value: flowData.userName }} />
            <ListRow
              item={{
                key: t("birthDay"),
                value: dayjs(
                  `${flowData.yearOfBirth}-${flowData.monthOfBirth}-${flowData.dayOfBirth}`
                ).format("DD/MM/YYYY"),
              }}
            />
            <ListRow item={{ key: t("sex"), value: flowData.sex }} />
            <ListRow
              item={{
                key: t("address"),
                value: flowData.currentAddress,
              }}
            />
            <ListRow
              item={{
                key: t("addressVerified"),
                value: flowData.currentAddressVerified ? t("yes") : t("no"),
              }}
            />
            <ListRow
              item={{
                key: t("proofOfAddress"),
                value: proofOfAddressDownloadUrl ? (
                  <a target="_blank" href={proofOfAddressDownloadUrl}>
                    {t(flowData.proofOfAddressRequest)}
                  </a>
                ) : (
                  t(flowData.proofOfAddressRequest)
                ),
              }}
            />

            <ListRow item={{ key: t("mobile"), value: flowData.mobile }} />
            <ListRow item={{ key: t("email"), value: flowData.email }} />
            <ListRow
              item={{
                key: t("totalPaid"),
                value: flowData.totalFeePaid
                  ? `€${flowData.totalFeePaid}`
                  : "-",
              }}
            />
            <ListRow
              item={{ key: t("payDate"), value: flowData.dateOfPayment }}
            />
          </dl>
        </div>
      </div>
      {hideFormButtons ? null : (
        <form
          action={approveAction}
          style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
        >
          <input type="hidden" name="userId" defaultValue={userId} />
          <input type="hidden" name="flow" defaultValue={flow} />
          <Link
            className="govie-link"
            href={"?" + searchParamsWithRejectionOpen.toString()}
          >
            {t("reject")}
          </Link>
          <button type="submit" className="govie-button govie-button--medium">
            {t("approve")}
          </button>
        </form>
      )}
    </>
  );
};
