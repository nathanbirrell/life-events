import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { PaymentRequest } from "../../../../types/common";
import { errorHandler, validateCustomAmount } from "../../../utils";

async function getAmountFromToken(token: string) {
  "use server";
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: payload, error } = await paymentsApi.decodeToken({ token });

  if (error || !validateCustomAmount(payload?.data.amount)) errorHandler(error);

  return payload!.data.amount;
}

export async function getAmount({
  customAmount,
  token,
  prDetails,
}: {
  customAmount?: string;
  token?: string;
  prDetails: PaymentRequest;
}) {
  // We will always get the token coming from the integrator, but amount is optional
  // TODO: Allow amountFromToken to be an optional field within the token, if undefined, fallback to amount from the Payment Request
  if (token && prDetails.allowAmountOverride) return getAmountFromToken(token);

  return prDetails.allowCustomAmount && customAmount
    ? parseFloat(customAmount)
    : prDetails.amount;
}
