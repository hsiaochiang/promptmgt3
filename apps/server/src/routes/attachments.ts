import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import type { MultipartFile } from '@fastify/multipart';
import { saveAttachment } from '../attachments/index.js';
import { loadWorkspaceSettings } from './workspace.js';

/**
 * Attachment upload routes
 * Supports multipart file upload and returns storage path for reference in entity content
 */
export async function registerAttachmentRoutes(server: FastifyInstance, rootPath: string) {
  // Register multipart plugin for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
  });

  /**
   * POST /api/attachments - Upload an attachment
   * Multipart form data with:
   * - file: the file to upload
   * - entityType: 'project' | 'prompt' | 'inbox'
   * - entityId: the entity ID
   * 
   * Returns: AttachmentRef with storagePath for insertion into entity content
   */
  server.post<{
    Querystring: {
      entityType: 'project' | 'prompt' | 'inbox';
      entityId: string;
    };
  }>('/api/attachments', async (request, reply) => {
    const { entityType, entityId } = request.query;

    if (!entityType || !entityId) {
      return reply.code(400).send({ 
        error: 'Missing entityType or entityId query parameters' 
      });
    }

    if (!['project', 'prompt', 'inbox'].includes(entityType)) {
      return reply.code(400).send({ 
        error: 'Invalid entityType. Must be: project, prompt, or inbox' 
      });
    }

    try {
      // Load workspace settings to get attachmentPath
      const settings = await loadWorkspaceSettings(rootPath);
      
      if (!settings.attachmentPath) {
        return reply.code(400).send({ 
          error: 'Attachment path not configured in workspace settings' 
        });
      }

      // Get the uploaded file
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const file = data as MultipartFile;
      
      // Read file buffer
      const buffer = await file.toBuffer();
      
      // Save attachment
      const attachmentRef = await saveAttachment({
        rootPath,
        attachmentBasePath: settings.attachmentPath,
        entityType,
        entityId,
        originalFilename: file.filename,
        buffer,
        mimeType: file.mimetype,
      });

      return reply.code(201).send(attachmentRef);
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({
        error: 'Failed to upload attachment',
        message: err?.message ?? String(err),
      });
    }
  });

  /**
   * DELETE /api/attachments/:attachmentId - Delete an attachment
   * Note: This is a placeholder. Actual implementation would need to:
   * 1. Look up attachment by ID (requires attachment registry or scanning)
   * 2. Delete the file from disk
   * 3. Update entity references
   * 
   * For MVP, attachments are deleted when parent entity is deleted.
   */
  server.delete<{
    Params: {
      attachmentId: string;
    };
  }>('/api/attachments/:attachmentId', async (_request, reply) => {
    // TODO: Implement attachment deletion if needed for MVP
    return reply.code(501).send({ 
      error: 'Not implemented',
      message: 'Attachment deletion is handled via entity deletion for MVP' 
    });
  });
}
