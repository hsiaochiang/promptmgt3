import type { FastifyInstance } from 'fastify';
import type { TrashEntityType, TrashRestoreRequest } from '@pah/contracts';
import { listTrash, purgeTrashItem, restoreTrashItem } from '../trash/trashStore.js';

export async function registerTrashRoutes(server: FastifyInstance, rootPath: string) {
  server.get<{
    Querystring: {
      q?: string;
      entityType?: TrashEntityType;
      page?: number;
      perPage?: number;
    };
  }>('/api/trash', async (request) => {
    const { q, entityType, page, perPage } = request.query;
    return listTrash({ rootPath, q, entityType, page, perPage });
  });

  server.delete<{
    Params: { trashId: string };
  }>('/api/trash/:trashId', async (request, reply) => {
    const ok = await purgeTrashItem({ rootPath, trashId: request.params.trashId });
    if (!ok) return reply.code(404).send({ error: 'Not Found' });
    return reply.code(204).send();
  });

  server.post<{
    Params: { trashId: string };
    Body: TrashRestoreRequest;
  }>('/api/trash/:trashId/restore', async (request, reply) => {
    const out = await restoreTrashItem({
      rootPath,
      trashId: request.params.trashId,
      request: request.body,
    });

    if (out.notFound) return reply.code(404).send({ error: 'Not Found' });
    if (out.conflict) return reply.code(409).send(out.conflict);
    return out.result;
  });
}
