import { Static } from "@sinclair/typebox";
import {
  CreateTransactionBody,
  FullTransaction,
  Transaction,
  TransactionData,
  TransactionDetails,
  TransactionStatuses,
  UpdateTransactionBody,
} from "../../../routes/schemas";

export type TransactionStatuses = Static<typeof TransactionStatuses>;
export type FullTransactionDO = Static<typeof FullTransaction>;
export type TransactionDO = Static<typeof Transaction>;
export type TransactionDetailsDO = Static<typeof TransactionDetails>;
export type UpdateTransactionBodyDO = Static<typeof UpdateTransactionBody>;
export type CreateTransactionBodyDO = Static<typeof CreateTransactionBody>;

export type TransactionEntry = {
  transactionId: number;
  paymentRequestId: string;
  extPaymentId: string;
  status: string;
  integrationReference: string;
  createdAt;
  updatedAt;
  amount: number;
  paymentProviderId: string;
  metadata: {
    name: string;
    email: string;
    journeyId?: string;
    runId?: string;
    journeyTitle?: string;
  };
  userId: string;
};

export type TransactionDataDO = Static<typeof TransactionData>;
