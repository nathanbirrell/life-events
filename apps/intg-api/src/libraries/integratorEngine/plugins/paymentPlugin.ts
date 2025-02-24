import { PaymentStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { keyAlias } from "../../../utils/kms";
import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";
import { createSignedJWT } from "api-auth";

export class PaymentPlugin implements IIntegratorPlugin {
  public async execute(
    stepData: PaymentStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const url = new URL(stepData.url);
    //TODO: Don't pass these info in the URL params, but just take them from the Token
    url.searchParams.set("journeyId", props.journeyId);
    url.searchParams.set("runId", props.runId);

    const redirectUrl = new URL(
      `/journey/${props.journeyId}/callback`,
      props.host,
    );
    redirectUrl.searchParams.set("runId", props.runId);

    //TODO: take this dinamically, for now is just to test that it work
    const amount = 25000;

    const jwt = await createSignedJWT(
      {
        runId: props.runId,
        journeyId: props.journeyId,
        amount,
        redirectUrl: redirectUrl.href,
      },
      keyAlias,
      {
        audience: "payments-api",
        issuer: "integrator-api",
      },
    );

    url.searchParams.set("token", jwt);

    return { url: url.href };
  }

  //TODO: Add schema validation for the data
  public processResultData(data: any) {
    return data;
  }

  //TODO: Add here the Payment Backend URL
  public getJwksUrl() {
    return "/.well-known/jwks.json";
  }
}
