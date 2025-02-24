import { expect } from "@playwright/test";
import { test } from "../../fixtures/paymentRequestsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import {
  mockAccountHolderName,
  mockAmount,
  mockIban,
  mockRedirectUrl,
} from "../../utils/mocks";
import { ManualBankTransferTransactionPage } from "../../objects/payments/ManualBankTransferTransactionPage";
import { PayPage } from "../../objects/payments/PayPage";

test.describe("Transaction with manual bank transfer", () => {
  test("should initiate a payment with a manual bank transfer provider @smoke @blocker", async ({
    publicServantPage,
    paymentRequestWithManualBankTransferProvider,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with a manual bank transfer provider is successfully initiated by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Manual Bank Transfer");
    await severity(Severity.BLOCKER);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithManualBankTransferProvider.name,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
    await payPage.goto(paymentLink);
    await payPage.checkHeader();
    await payPage.checkAmount(mockAmount);
    await payPage.customAmountForm.checkCustomAmountOptionVisible();
    await payPage.paymentMethodForm.checkPaymentMethodHeader();
    await payPage.paymentMethodForm.checkPaymentMethodVisible("banktransfer");
    await payPage.paymentMethodForm.checkButtonEnabled();
    await payPage.paymentMethodForm.choosePaymentMethod("banktransfer");
    await payPage.paymentMethodForm.proceedToPayment();

    const manualBankTransferTransactionPage =
      new ManualBankTransferTransactionPage(citizenPage);
    await manualBankTransferTransactionPage.checkHeader();
    await manualBankTransferTransactionPage.checkTitle(
      paymentRequestWithManualBankTransferProvider.name,
    );
    await manualBankTransferTransactionPage.checkTotal(mockAmount);
    await manualBankTransferTransactionPage.checkAccountName(
      mockAccountHolderName,
    );
    await manualBankTransferTransactionPage.checkIban(mockIban);
    await manualBankTransferTransactionPage.checkReferenceCode();
    const referenceCode =
      await manualBankTransferTransactionPage.getReferenceCode();
    await manualBankTransferTransactionPage.confirmPayment();

    await expect(citizenPage).toHaveURL(mockRedirectUrl);
    await expect(
      citizenPage.getByRole("img", { name: "Google" }),
    ).toBeVisible();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithManualBankTransferProvider.name,
    );

    await detailsPage.checkPaymentsList([
      { amount: mockAmount, status: "pending", referenceCode },
    ]);
  });
});
