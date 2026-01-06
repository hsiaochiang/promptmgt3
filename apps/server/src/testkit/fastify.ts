import Fastify from 'fastify';

export function createTestFastify() {
  return Fastify({ logger: false });
}
