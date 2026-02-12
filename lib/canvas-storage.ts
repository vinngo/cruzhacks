import { mastra } from "@/mastra";

export interface CanvasSnapshot {
  id: string;
  screenshot: string; // base64 data URL
  timestamp: number;
  conversationId: string;
}

class CanvasStorage {
  private static STORAGE_KEY_PREFIX = "canvas:";

  /**
   * Store a new canvas snapshot
   */
  async saveSnapshot(
    conversationId: string,
    screenshot: string,
  ): Promise<string> {
    const snapshot: CanvasSnapshot = {
      id: crypto.randomUUID(),
      screenshot,
      timestamp: Date.now(),
      conversationId,
    };

    const storage = mastra.storage;
    const key = `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:current`;

    // Store current snapshot
    await storage.set(key, JSON.stringify(snapshot));

    // Also add to history (optional - for tracking evolution)
    const historyKey = `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:history`;
    const history = await this.getHistory(conversationId);
    history.push({
      id: snapshot.id,
      timestamp: snapshot.timestamp,
    });
    await storage.set(historyKey, JSON.stringify(history));

    console.log("📸 Canvas snapshot saved:", snapshot.id);
    return snapshot.id;
  }

  /**
   * Get the current canvas screenshot for a conversation
   */
  async getCurrentSnapshot(
    conversationId: string,
  ): Promise<CanvasSnapshot | null> {
    const storage = mastra.storage;
    const key = `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:current`;

    const data = await storage.get(key);
    if (!data) return null;

    return JSON.parse(data) as CanvasSnapshot;
  }

  /**
   * Get canvas history (for tracking evolution)
   */
  async getHistory(
    conversationId: string,
  ): Promise<Array<{ id: string; timestamp: number }>> {
    const storage = mastra.storage;
    const historyKey = `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:history`;

    const data = await storage.get(historyKey);
    if (!data) return [];

    return JSON.parse(data);
  }

  /**
   * Clean up old snapshots (for memory management)
   */
  async cleanup(conversationId: string): Promise<void> {
    const storage = mastra.storage;
    await storage.delete(
      `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:current`,
    );
    await storage.delete(
      `${CanvasStorage.STORAGE_KEY_PREFIX}${conversationId}:history`,
    );
  }
}

export const canvasStorage = new CanvasStorage();
