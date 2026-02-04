import { NextRequest } from "next/server";

// 1. Define the Contract (Interface)
export interface ProxyRequestPayload {
  body: BodyInit | null;
  headers: Record<string, string>;
}

export interface RequestProcessor {
  name: string;
  supports: (contentType: string | null) => boolean;
  process: (req: NextRequest) => Promise<ProxyRequestPayload>;
}

// 2. Strategy: JSON Handler
export const jsonProcessor: RequestProcessor = {
  name: "JSON",
  supports: (ct) => !!ct && ct.includes("application/json"),
  process: async (req) => {
    const data = await req.json();
    return {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
  },
};

// 3. Strategy: Multipart (File Upload) Handler
export const multipartProcessor: RequestProcessor = {
  name: "Multipart",
  supports: (ct) => !!ct && ct.includes("multipart/form-data"),
  process: async (req) => {
    const formData = await req.formData();
    return {
      body: formData, // Fetch will automatically generate the boundary header
      headers: {},    // Explicitly EMPTY so we don't overwrite the auto-generated boundary
    };
  },
};

// 4. Strategy: Fallback (Text/Raw)
export const fallbackProcessor: RequestProcessor = {
  name: "Fallback",
  supports: () => true, // Always matches if nothing else did
  process: async (req) => {
    const text = await req.text();
    const contentType = req.headers.get("content-type") || "text/plain";
    return {
      body: text,
      headers: { "Content-Type": contentType },
    };
  },
};

// 5. The Registry (Order matters!)
export const processors = [jsonProcessor, multipartProcessor, fallbackProcessor];

export function getProcessor(contentType: string | null): RequestProcessor {
  return processors.find((p) => p.supports(contentType)) || fallbackProcessor;
}