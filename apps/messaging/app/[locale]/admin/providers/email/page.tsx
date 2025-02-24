import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import { temporaryMockUtils } from "messages";
import { redirect } from "next/navigation";
import { providerRoutes } from "../../../../utils/routes";
import { revalidatePath } from "next/cache";
import { FormElement } from "../../FormElement";
import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

const defaultErrorStateId = "email_provider_form";

type FormErrors = Parameters<typeof temporaryMockUtils.createErrors>[0];

export default async (props: {
  params: { locale: string };
  searchParams?: { id: string };
}) => {
  const [t, tError, tCommons] = await Promise.all([
    getTranslations("settings.EmailProvider"),
    getTranslations("formErrors"),
    getTranslations("Commons"),
  ]);
  async function submitAction(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString();
    const host = formData.get("host")?.toString();
    const port = Number(formData.get("port")?.toString());
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const fromAddress = formData.get("fromAddress")?.toString();
    const throttle = Number(formData.get("throttle")?.toString()) || undefined;
    const ssl = Boolean(formData.get("ssl"));
    const isPrimary = Boolean(formData.get("isPrimary"));

    const id = formData.get("id")?.toString();

    const formErrors: FormErrors = [];

    const required = { name, host, port, username, password, fromAddress };
    for (const field of Object.keys(required)) {
      if (!required[field]) {
        formErrors.push({
          errorValue: "",
          field,
          messageKey: "empty",
        });
      }
    }

    const { user: submitUser } =
      await AuthenticationFactory.getInstance().getContext();
    if (formErrors.length) {
      await temporaryMockUtils.createErrors(
        formErrors,
        submitUser.id,
        defaultErrorStateId,
      );
      return revalidatePath("/");
    }

    // Just for ts type assertions, at this point this is always false.
    if (!name || !host || !username || !password || !port || !fromAddress) {
      return;
    }

    const messagesClient = await AuthenticationFactory.getMessagingClient();

    let serverError:
      | Awaited<ReturnType<typeof messagesClient.createEmailProvider>>["error"]
      | undefined;

    if (!id) {
      const { error } = await messagesClient.createEmailProvider({
        providerName: name,
        smtpHost: host,
        username,
        password,
        smtpPort: port,
        fromAddress,
        throttle,
        ssl,
        isPrimary,
      });

      if (error) {
        serverError = error;
      }
    } else {
      const { error } = await messagesClient.updateEmailProvider({
        id,
        smtpHost: host,
        smtpPort: port,
        providerName: name,
        password,
        username,
        fromAddress,
        throttle,
        ssl,
        isPrimary,
      });

      if (error) {
        serverError = error;
      }
    }

    if (serverError) {
      if (serverError.validation) {
        formErrors.push(
          ...serverError.validation.map((v) => ({
            errorValue: fromAddress,
            field: v.fieldName,
            messageKey: v.message,
          })),
        );
      } else {
        formErrors.push({
          errorValue: "",
          field: "general",
          messageKey: "generalServerError",
        });
      }

      await temporaryMockUtils.createErrors(
        formErrors,
        submitUser.id,
        defaultErrorStateId,
      );

      return revalidatePath("/");
    }

    const url = new URL(
      `${props.params.locale}/${providerRoutes.url}`,
      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
    );
    url.searchParams.append("provider", "email");
    redirect(url.href);
  }

  const { user } = await AuthenticationFactory.getInstance().getContext();
  const client = await AuthenticationFactory.getMessagingClient();

  let data:
    | Awaited<ReturnType<typeof client.getEmailProvider>>["data"]
    | undefined;

  if (props.searchParams?.id) {
    const res = await client.getEmailProvider(props.searchParams.id);
    if (res.data) {
      data = res.data;
    }
  }

  const errors = await temporaryMockUtils.getErrors(
    user.id,
    defaultErrorStateId,
  );

  const nameError = errors.find((error) => error.field === "name");
  const hostError = errors.find((error) => error.field === "host");
  const portError = errors.find((error) => error.field === "port");
  const usernameError = errors.find((error) => error.field === "username");
  const passwordError = errors.find((error) => error.field === "password");
  const throttleError = errors.find((error) => error.field === "throttle");
  const fromAddressError = errors.find(
    (error) => error.field === "fromAddress",
  );

  return (
    <FlexMenuWrapper>
      <h1>
        <span className="govie-heading-l">
          {data?.id ? t("titleUpdate") : t("titleAdd")}
        </span>
      </h1>
      <form action={submitAction}>
        <input name="id" value={props.searchParams?.id} type="hidden" />
        <FormElement
          id="name"
          label={t("nameLabel")}
          error={
            nameError &&
            tError(nameError.messageKey, {
              field: tError(`fields.${nameError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="name"
            type="text"
            name="name"
            className="govie-input"
            defaultValue={data?.providerName}
          />
        </FormElement>

        <FormElement
          id="fromAddress"
          label={t("fromAddressLabel")}
          error={
            fromAddressError &&
            tError(fromAddressError.messageKey, {
              field: tError(`fields.${fromAddressError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="fromAddress"
            type="text"
            name="fromAddress"
            className="govie-input"
            defaultValue={data?.fromAddress}
          />
        </FormElement>

        <FormElement
          id="host"
          label={t("hostLabel")}
          error={
            hostError &&
            tError(hostError.messageKey, {
              field: tError(`fields.${hostError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="host"
            type="text"
            name="host"
            className="govie-input"
            defaultValue={data?.smtpHost}
          />
        </FormElement>

        <FormElement
          id="port"
          label={t("portLabel")}
          error={
            portError &&
            tError(portError.messageKey, {
              field: tError(`fields.${portError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="port"
            type="text"
            name="port"
            className="govie-input"
            defaultValue={data?.smtpPort}
          />
        </FormElement>

        <FormElement id="ssl">
          <fieldset className="govie-fieldset">
            <div className="govie-checkboxes govie-checkboxes--medium">
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="ssl"
                  name="ssl"
                  type="checkbox"
                  value="ssl"
                  defaultChecked={data?.ssl}
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="ssl"
                >
                  {t("ssl")}
                </label>
              </div>
            </div>
          </fieldset>
        </FormElement>

        <FormElement id="isPrimary">
          <fieldset className="govie-fieldset">
            <div className="govie-checkboxes govie-checkboxes--medium">
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="isPrimary"
                  name="isPrimary"
                  type="checkbox"
                  value="isPrimary"
                  defaultChecked={data?.isPrimary}
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="isPrimary"
                >
                  {t("isPrimary")}
                </label>
              </div>
            </div>
          </fieldset>
        </FormElement>

        <FormElement
          id="username"
          label={t("usernameLabel")}
          error={
            usernameError &&
            tError(usernameError.messageKey, {
              field: tError(`fields.${usernameError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="username"
            type="text"
            name="username"
            className="govie-input"
            defaultValue={data?.username}
          />
        </FormElement>

        <FormElement
          id="password"
          label={t("passwordLabel")}
          error={
            passwordError &&
            tError(passwordError.messageKey, {
              field: tError(`fields.${passwordError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="password"
            type="password"
            name="password"
            className="govie-input"
            defaultValue={data?.password}
          />
        </FormElement>

        <FormElement
          id="throttle"
          label={t("throttleLabel")}
          hint={t("throttleHint")}
          error={
            throttleError &&
            tError(throttleError.messageKey, {
              field: tError(`fields.${throttleError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="throttle"
            type="text"
            name="throttle"
            className="govie-input"
            defaultValue={data?.throttle}
          />
        </FormElement>

        <button className="govie-button" type="submit">
          {props.searchParams?.id ? t("updateButton") : t("createButton")}
        </button>
      </form>
      <a
        className="govie-back-link"
        href={
          new URL(
            `${props.params.locale}/${providerRoutes.url}?provider=email`,
            process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
          ).href
        }
      >
        {tCommons("backLink")}
      </a>
    </FlexMenuWrapper>
  );
};
