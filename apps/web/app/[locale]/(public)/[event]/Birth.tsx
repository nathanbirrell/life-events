import { getTranslations } from "next-intl/server";
import { routes, workflow } from "../../../utils";
import EventsList from "./components/EventsList";
import styles from "./event.module.scss";

async function getEvents() {
  "use server";
  return Promise.resolve([
    {
      flowKey: workflow.keys.orderBirthCertificate,
      category: workflow.categories.birth,
    },
    {
      flowKey: workflow.keys.correctBirthCertificate,
      category: workflow.categories.birth,
    },
    {
      flowKey: workflow.keys.overseasBirthCertificate,
      category: workflow.categories.birth,
    },
    {
      flowKey: workflow.keys.addFatherNameBirthCertificate,
      category: workflow.categories.birth,
    },
  ]);
}

export default async () => {
  const t = await getTranslations("Birth");

  const events = await getEvents();

  const eventsToRender = events.map((event) => {
    const flowTitle = event.flowKey + ".title";
    const descriptionKey = event.flowKey + ".description";
    return {
      flowTitle,
      flowKey: event.flowKey,
      descriptionKey,
      slug: routes.category[event.category][event.flowKey]?.path(),
    };
  });

  return (
    <div className={styles.eventContainer}>
      <div className="govie-heading-l">{t("title")}</div>
      <div className={styles.sectionsWrapper}>
        <section className={styles.section}>
          <EventsList
            events={eventsToRender.slice(0, 2)}
            category={t("title")}
          />
        </section>
        <section className={styles.section}>
          <EventsList
            events={eventsToRender.slice(2, 4)}
            category={t("title")}
          />
        </section>
      </div>
    </div>
  );
};
