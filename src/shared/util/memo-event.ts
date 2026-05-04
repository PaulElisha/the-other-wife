import type { Response } from "express";

class EventMemo {
  private eventMemo: Map<number, Response> = new Map();

  subscribe = (vendorId: number, res: Response) => {
    this.eventMemo.set(vendorId, res);

    res.on("close", () => {
     this.eventMemo.delete(vendorId);
    });
  }

  notify = (vendorId: number, data: any) => {
    const client = this.eventMemo.get(vendorId);
    if (client && !client.writableEnded) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }
}

export default new EventMemo();
