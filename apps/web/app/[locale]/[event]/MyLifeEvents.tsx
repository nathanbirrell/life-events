import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import OpenEventStatusImage from "./OpenEventStatusImage";
import {
  renewDriverLicenceRules,
  renewDriversLicenceFlowKey,
} from "./[...action]/RenewDriversLicence/RenewDriversLicence";
import { postgres, routes, workflow } from "../../utils";

async function getEvents() {
  "use server";
  return Promise.resolve([
    {
      flowKey: renewDriversLicenceFlowKey,
    },
  ]);
}

async function getFlows() {
  "use server";

  const { userId } = await PgSessions.get();

  // union the other flow types when we have them and add some type guard to figure out the pre/mid/post states
  const flowsQueryResult = await postgres.pgpool.query<
    { flow: string; data: workflow.RenewDriversLicence },
    string[]
  >(
    `
      SELECT
        flow,
        flow_data as "data"
      FROM user_flow_data
      WHERE user_id = $1
  `,
    [userId]
  );

  if (!flowsQueryResult.rowCount) {
    return [];
  }

  return flowsQueryResult.rows.map((row) => {
    // do some type guarding here, assume that we're dealing with renew drivers licence
    let descriptionKey = row.flow;
    let titleKey = row.flow;

    const step = workflow.getCurrentStep(renewDriverLicenceRules, row.data);

    let successful = false;
    if (row.data.successfulAt) {
      successful = true;
      descriptionKey += ".description.post";
      titleKey += ".title.post";
    } else if (row.data.rejectReason) {
      titleKey += ".title.rejected";
      descriptionKey += ".description.rejected";
    } else if (
      [
        routes.driving.renewLicense.applicationSuccess.slug,
        routes.driving.renewLicense.paymentSuccess.slug,
      ].includes(step)
    ) {
      successful = true;
      descriptionKey += ".description.mid";
      titleKey += ".title.mid";
    } else {
      descriptionKey += ".description.pre";
      titleKey += ".title.pre";
    }

    return {
      successful,
      flowKey: row.flow,
      titleKey,
      descriptionKey: descriptionKey,
      rejectedReaason: row.data.rejectReason,
      slug: routes.driving.renewLicense.path(), // get from some key to slug map or object
    };
  });
}

export default async () => {
  const t = await getTranslations("MyLifeEvents");
  const [flow, events] = await Promise.all([getFlows(), getEvents()]);

  const eventsToRender = events
    .filter((event) => !flow.some((f) => f.flowKey === event.flowKey))
    .map((event) => {
      // do some mapping for flow key
      const flowTitle = event.flowKey + ".title.base";
      const descriptionKey = event.flowKey + ".description.base";
      return {
        flowTitle,
        flowKey: event.flowKey,
        descriptionKey,
        slug: routes.driving.renewLicense.path(),
      };
    });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
        <div className="govie-heading-l">My Life Events</div>
        <ul className="govie-list">
          {eventsToRender.map((evt) => (
            <li
              key={`le_${evt.flowKey}`}
              style={{
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                gap: "1rem",
              }}
            >
              <Link className="govie-link" href={evt.slug}>
                {t(evt.flowTitle)}
              </Link>
              <p className="govie-body" style={{ margin: "unset" }}>
                {t(evt.descriptionKey, { date: "19th March" })}
              </p>
              <hr className="govie-section-break govie-section-break--visible" />
            </li>
          ))}
        </ul>
      </section>
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
        <div className="govie-heading-l">Open Events</div>
        <ul className="govie-list">
          {flow.map((evt) => (
            <li
              key={`o_${evt.flowKey}`}
              style={{
                margin: "0 0 3rem",
                display: "flex",
                justifyContent: "space-around",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <OpenEventStatusImage finished={evt.successful} />
              <div style={{ flex: 1 }}>
                <Link className="govie-link" href={evt.slug}>
                  {t(evt.titleKey)}
                </Link>
                <p
                  className="govie-body"
                  style={{ margin: "unset", overflow: "auto" }}
                >
                  {t(evt.descriptionKey, {
                    date: "19th March",
                    rejectedReason: evt.rejectedReaason,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
