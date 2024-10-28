import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";
import { MessagingStepDataDO } from "../../../plugins/entities/journeySteps/types";

export class CompletePlugin implements IIntegratorPlugin {
  public async execute(
    stepData: MessagingStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const url = new URL(
      `/journey/${props.journeyId}/complete/${props.runId}`,
      process.env.INTEGRATOR_URL,
    );

    return {
      url: url.href,
    };
  }

  public processResultData(data: any) {
    return data;
  }
}
