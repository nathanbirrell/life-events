import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { PaymentRequest } from "../../../../types/common";
import { errorHandler, validateCustomAmount } from "../../../utils";

export async function getAmount({
  customAmount,
  token,
  prDetails,
}: {
  customAmount?: string;
  token?: string;
  prDetails: PaymentRequest;
}) {
  "use server";
  if (token && prDetails.allowAmountOverride) {
    const paymentsApi = await AuthenticationFactory.getPaymentsClient();
    const { data: payload, error } = await paymentsApi.decodeToken({ token });

    if (error || !validateCustomAmount(payload?.data.amount)) {
      errorHandler(error);
    }

    if (payload?.data.amount) return payload!.data.amount;
  }

  return prDetails.allowCustomAmount && customAmount
    ? parseFloat(customAmount)
    : prDetails.amount;
}
