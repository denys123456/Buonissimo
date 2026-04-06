import type { StoredOrder } from "@/lib/types";

const chunkSize = 450;
const keyPrefix = "order_chunk_";

export function buildOrderMetadata(order: StoredOrder) {
  const payload = JSON.stringify(order);
  const chunks = payload.match(new RegExp(`.{1,${chunkSize}}`, "g")) ?? [];

  return chunks.reduce<Record<string, string>>(
    (acc, chunk, index) => {
      acc[`${keyPrefix}${index}`] = chunk;
      return acc;
    },
    {
      order_chunk_count: String(chunks.length),
      order_id: order.id
    }
  );
}

export function readOrderMetadata(
  metadata: Record<string, string | null> | null | undefined
) {
  if (!metadata?.order_chunk_count) {
    return null;
  }

  const chunkCount = Number(metadata.order_chunk_count);
  if (!Number.isFinite(chunkCount) || chunkCount < 1) {
    return null;
  }

  let payload = "";
  for (let index = 0; index < chunkCount; index += 1) {
    const value = metadata[`${keyPrefix}${index}`];
    if (!value) {
      return null;
    }
    payload += value;
  }

  return JSON.parse(payload) as StoredOrder;
}
