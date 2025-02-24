import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { AuditLogRepo } from "./repo";
import {
  AuditLogEvent,
  AuditLogEventDetailsDO,
  AuditLogEventDO,
  AuditLogEventsFilters,
  CreateAuditLog,
} from "./types";
import { PaginationParams } from "../../types/pagination";
import { httpErrors } from "@fastify/sensible";
import { AuditLogEventTitles, AuditLogEventType } from "./auditLogEvents";

export type AuditLogPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const getEventTitle = (eventType: AuditLogEventType) => {
  return AuditLogEventTitles[eventType];
};

const getResourceId = (metadata: Record<string, unknown>) => {
  return (metadata.resource as { id?: unknown })?.id;
};

const buildCreateEvent =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (event: CreateAuditLog): Promise<AuditLogEventDO> => {
    let result;

    try {
      result = await repo.createEvent(event);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows?.[0]) {
      const error = new Error("Something went wrong during event creation");
      throw error;
    }

    const createdEvent: AuditLogEventDO = {
      ...result.rows[0],
      title: getEventTitle(result.rows[0].eventType),
    };

    return createdEvent;
  };

const buildGetEvents =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (
    organizationId: string,
    filters: AuditLogEventsFilters,
    pagination: PaginationParams,
  ): Promise<AuditLogEvent[]> => {
    let result;

    try {
      result = await repo.getEvents(organizationId, filters, pagination);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows.length) {
      return [];
    }

    return result.rows.map((event) => {
      return {
        ...event,
        title: getEventTitle(event.eventType),
        resourceId: getResourceId(event.metadata),
      };
    });
  };

const buildGetEventsTotalCount =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (
    organizationId: string,
    filters: AuditLogEventsFilters,
  ): Promise<number> => {
    let result;

    try {
      result = await repo.getEventsTotalCount(organizationId, filters);
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      const error = new Error("Something went wrong.");
      throw error;
    }

    return totalCount;
  };

const buildGetEventById =
  (repo: AuditLogRepo, log: FastifyBaseLogger) =>
  async (
    eventId: string,
    organizationId: string,
  ): Promise<AuditLogEventDetailsDO> => {
    let result;

    try {
      result = await repo.getEvent(eventId, organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested audit log was not found");
    }

    const event = result?.rows[0];

    return { ...event, title: getEventTitle(event.eventType) };
  };

const getEventTypes = (): Record<string, string> => {
  return {
    ...AuditLogEventTitles,
  };
};

const buildPlugin = (repo: AuditLogRepo, log: FastifyBaseLogger) => {
  return {
    createEvent: buildCreateEvent(repo, log),
    getEvents: buildGetEvents(repo, log),
    getEventsTotalCount: buildGetEventsTotalCount(repo, log),
    getEventById: buildGetEventById(repo, log),
    getEventTypes,
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new AuditLogRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log);

  fastify.decorate("auditLog", plugin);
};

export default fp(initPlugin, {
  name: "auditLogPlugin",
});
