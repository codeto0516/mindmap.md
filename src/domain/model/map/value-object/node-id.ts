import { Brand } from "@/domain/shared/types/brand";

/** ノードを一意に識別する ID。MapId と同様の Brand 型。 */
export type NodeId = Brand<string, "NodeId">;

export const generateNodeId = (): NodeId => {
  return crypto.randomUUID() as NodeId;
};
