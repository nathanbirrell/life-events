import { test } from "../../fixtures/pageFixtures";
import { test as testWithProvider } from "../../fixtures/providersFixtures";
import {
  mockRealexMerchantId,
  mockRealexSharedSecret,
} from "../../utils/mocks";
import { paymentSetupUrl } from "../../utils/constants";
import { ProvidersPage } from "../../objects/providers/ProvidersPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { AddRealexProviderPage } from "../../objects/providers/AddRealexProviderPage";
import { EditRealexProviderPage } from "../../objects/providers/EditRealexProviderPage";

test.describe("Realex provider creation", () => {
  let providerName: string;

  test.beforeEach(async () => {
    providerName = `Test realex ${Date.now()}`;
  });

  test("should add a realex provider @smoke @critical", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of a new realex provider.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.CRITICAL);
    await publicServantPage.goto(paymentSetupUrl);

    const providersMenuLink = await publicServantPage.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(publicServantPage);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should show error creating realex provider if name is missing @regression @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that a validation error is shown when creating a new realex provider if name is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await publicServantPage.goto(paymentSetupUrl);

    const providersMenuLink = await publicServantPage.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(publicServantPage);
    await addRealexProviderPage.providerForm.enterName("");
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.providerForm.expectValidationError(
      "nameRequired",
    );
  });

  test("should not add a realex provider if merchant id is missing @regression @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that a new realex provider is not created if merchant id is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await publicServantPage.goto(paymentSetupUrl);

    const providersMenuLink = await publicServantPage.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(publicServantPage);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId("");
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.providerForm.expectValidationError(
      "merchantIdRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a realex provider if shared secret is missing @regression @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that a new realex provider is not created if shared secret is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await publicServantPage.goto(paymentSetupUrl);

    const providersMenuLink = await publicServantPage.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(publicServantPage);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret("");
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.providerForm.expectValidationError(
      "sharedSecretRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});

testWithProvider.describe("Realex provider editing", () => {
  const merchantId = process.env.REALEX_MERCHANT_ID ?? mockRealexMerchantId;
  const sharedSecret =
    process.env.REALEX_SHARED_SECRET ?? mockRealexSharedSecret;

  testWithProvider(
    "should edit a realex provider @regression @normal",
    async ({ realexProvider, publicServantPage }) => {
      await description(
        "This test checks the successful editing of a realex provider.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      const newProviderName = `${realexProvider} edited`;
      const newMerchantId = "new_mock_realex_id";
      const newSharedSecret = "new_mock_realex_secret";

      await publicServantPage.goto(paymentSetupUrl);

      const providersMenuLink = await publicServantPage.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(publicServantPage);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(publicServantPage);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(realexProvider);
      await editProviderPage.providerForm.enterName(newProviderName);
      await editProviderPage.providerForm.checkMerchantId(merchantId);
      await editProviderPage.providerForm.enterMerchantId(newMerchantId);
      await editProviderPage.providerForm.checkSharedSecret(sharedSecret);
      await editProviderPage.providerForm.enterSharedSecret(newSharedSecret);
      await editProviderPage.saveChanges();

      await providersPage.checkProviderVisible(newProviderName);
      await providersPage.editProvider(newProviderName);
      await editProviderPage.providerForm.checkName(newProviderName);
      await editProviderPage.providerForm.checkMerchantId(newMerchantId);
      await editProviderPage.providerForm.checkSharedSecret(newSharedSecret);
    },
  );

  testWithProvider(
    "should disable and enable a realex provider @regression @normal",
    async ({ realexProvider, publicServantPage }) => {
      await description(
        "This test checks that a realex provider is successfully disabled and enabled.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await publicServantPage.goto(paymentSetupUrl);

      const providersMenuLink = await publicServantPage.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(publicServantPage);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(publicServantPage);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.disableProvider();
      await providersPage.checkProviderIsDisabled(realexProvider);

      await providersPage.editProvider(realexProvider);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.enableProvider();
      await providersPage.checkProviderIsEnabled(realexProvider);
    },
  );

  testWithProvider(
    "should not edit a realex provider if name is missing @regression @normal",
    async ({ realexProvider, publicServantPage }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if name is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await publicServantPage.goto(paymentSetupUrl);

      const providersMenuLink = await publicServantPage.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(publicServantPage);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(publicServantPage);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(realexProvider);
      await editProviderPage.providerForm.enterName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("nameRequired");
    },
  );

  testWithProvider(
    "should not edit a realex provider if merchant id is missing @regression @normal",
    async ({ realexProvider, publicServantPage }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if merchant id is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await publicServantPage.goto(paymentSetupUrl);

      const providersMenuLink = await publicServantPage.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(publicServantPage);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(publicServantPage);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkMerchantId(merchantId);
      await editProviderPage.providerForm.enterMerchantId("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "merchantIdRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(realexProvider);
      await editProviderPage.providerForm.checkMerchantId(merchantId);
    },
  );

  testWithProvider(
    "should not edit a realex provider if shared secret is missing @regression @normal",
    async ({ realexProvider, publicServantPage }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if shared secret is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await publicServantPage.goto(paymentSetupUrl);

      const providersMenuLink = await publicServantPage.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(publicServantPage);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(publicServantPage);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkSharedSecret(sharedSecret);
      await editProviderPage.providerForm.enterSharedSecret("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "sharedSecretRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(realexProvider);
      await editProviderPage.providerForm.checkSharedSecret(sharedSecret);
    },
  );
});
