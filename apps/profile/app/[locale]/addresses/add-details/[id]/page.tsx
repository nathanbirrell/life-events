import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { NextPageProps } from "../../../../../types";
import ds from "design-system";
import { form, routes } from "../../../../utils";
import { revalidatePath } from "next/cache";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

const AddressLine = ({ value }: { value: string }) => (
  <p className="govie-body" style={{ marginBottom: "5px" }}>
    {value}
  </p>
);

export default async (props: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const { id: addressId, locale } = props.params;

  if (!addressId) {
    throw notFound();
  }

  const { user } = await AuthenticationFactory.getInstance().getContext();
  const profileClient = await AuthenticationFactory.getProfileClient();

  const { data: address, error } = await profileClient.getAddress(addressId);

  if (!address || error) {
    //handle other errors
    throw notFound();
  }
  const errors = await form.getErrorsQuery(
    user.id,
    routes.addresses.addDetails.slug,
  );

  const isOwnerError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.isOwner,
  );

  const isPrimaryAddressError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.isPrimaryAddress,
  );

  async function saveAddressDetails(formData: FormData) {
    "use server";

    if (!addressId) {
      throw notFound();
    }

    const errors: form.Error[] = [];
    const isOwner = formData.get("isOwner")?.toString();
    const isPrimaryAddress = formData.get("isPrimaryAddress")?.toString();

    if (isOwner === undefined) {
      errors.push({
        messageKey: form.errorTranslationKeys.emptySelection,
        errorValue: "",
        field: form.fieldTranslationKeys.isOwner,
      });
    }

    if (isPrimaryAddress === undefined) {
      errors.push({
        messageKey: form.errorTranslationKeys.emptySelection,
        errorValue: "",
        field: form.fieldTranslationKeys.isPrimaryAddress,
      });
    }
    const { user: saveDetailsUser } =
      await AuthenticationFactory.getInstance().getContext();

    if (errors.length) {
      await form.insertErrors(
        errors,
        saveDetailsUser.id,
        routes.addresses.addDetails.slug,
      );
      return revalidatePath("/");
    }

    const saveDetailsProfile = await AuthenticationFactory.getProfileClient();

    if (isOwner !== undefined && isPrimaryAddress !== undefined) {
      const result = await saveDetailsProfile.patchAddress(addressId, {
        ownershipStatus: isOwner === "true" ? "owner" : "renting",
        isPrimary: isPrimaryAddress === "true" ? true : false,
      });
      if (result?.error) {
        //handle error
      }
    }

    redirect(`/${locale}`);
  }

  async function cancelAction() {
    "use server";

    if (!addressId) {
      throw notFound();
    }
    const cancelProfile = await AuthenticationFactory.getProfileClient();
    const { error } = await cancelProfile.deleteAddress(addressId);

    if (error) {
      //handle error
    }
    redirect(`/${locale}`);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <div
          style={{
            border: `1px solid ${ds.colours.ogcio.midGrey}`,
            padding: "40px",
            marginBottom: "30px",
          }}
        >
          <AddressLine value={address.addressLine1} />
          {address.addressLine2 && <AddressLine value={address.addressLine2} />}
          <AddressLine value={address.town} />
          <AddressLine value={address.county} />
          <AddressLine value={address.eirecode} />
        </div>
        <form action={saveAddressDetails}>
          <h2 className="govie-heading-m">{t("ownerOrRenting")}</h2>
          <div
            className={`govie-form-group ${
              isOwnerError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {isOwnerError && (
              <p className="govie-error-message">
                <span className="govie-visually-hidden">{t("error")}:</span>
                {errorT(isOwnerError.messageKey)}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large govie-radios--inline"
            >
              <div
                className="govie-radios__item"
                style={{ marginBottom: "30px", paddingLeft: 0 }}
              >
                <div className="govie-radios__item">
                  <input
                    id="isOwner-yes"
                    name="isOwner"
                    type="radio"
                    value="true"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isOwner-yes"
                  >
                    {t("owner")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="isOwner-no"
                    name="isOwner"
                    type="radio"
                    value="false"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isOwner-no"
                  >
                    {t("renting")}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <h2 className="govie-heading-m">{t("isPrimaryResidence")}</h2>
          <div
            className={`govie-form-group ${
              isPrimaryAddressError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {isPrimaryAddressError && (
              <p className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(isPrimaryAddressError.messageKey)}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large govie-radios--inline"
            >
              <div
                className="govie-radios__item"
                style={{ marginBottom: "30px", paddingLeft: 0 }}
              >
                <div className="govie-radios__item">
                  <input
                    id="isPrimaryAddress-yes"
                    name="isPrimaryAddress"
                    type="radio"
                    value="true"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isPrimaryAddress-yes"
                  >
                    {t("yes")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="isPrimaryAddress-no"
                    name="isPrimaryAddress"
                    type="radio"
                    value="false"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isPrimaryAddress-no"
                  >
                    {t("no")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <button
              type="submit"
              data-module="govie-button"
              className="govie-button"
              style={{ marginBottom: 0 }}
            >
              {t("save")}
            </button>
            <button
              data-module="govie-button"
              className="govie-button govie-button--secondary"
              style={{ marginBottom: 0 }}
              formAction={cancelAction}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
