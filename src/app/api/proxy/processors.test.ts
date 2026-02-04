/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { getProcessor, jsonProcessor, multipartProcessor, fallbackProcessor } from "./processors";

describe("Proxy Request Processors", () => {
  
  // 1. Test the Dispatcher (Selection Logic)
  describe("getProcessor", () => {
    it("should select JSON processor for application/json", () => {
      const proc = getProcessor("application/json; charset=utf-8");
      expect(proc).toBe(jsonProcessor);
    });

    it("should select Multipart processor for form-data", () => {
      const proc = getProcessor("multipart/form-data; boundary=---123");
      expect(proc).toBe(multipartProcessor);
    });

    it("should default to Fallback for unknown types", () => {
      const proc = getProcessor("application/xml");
      expect(proc).toBe(fallbackProcessor);
    });
  });

  // 2. Test the Strategies (Processing Logic)
  describe("jsonProcessor", () => {
    it("should stringify body and set header", async () => {
      const mockReq = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { "content-type": "application/json" }
      });

      const result = await jsonProcessor.process(mockReq);
      
      expect(result.headers).toEqual({ "Content-Type": "application/json" });
      expect(result.body).toBe('{"foo":"bar"}');
    });
  });

  describe("multipartProcessor", () => {
    it("should return FormData body and EMPTY headers", async () => {
      // Mocking FormData in Node env is tricky, but logic test:
      const mockFormData = new FormData();
      mockFormData.append("file", "fake-file");

      // We mock the Request's formData method
      const mockReq = {
        formData: jest.fn().mockResolvedValue(mockFormData),
        headers: { get: () => "multipart/form-data" }
      } as unknown as NextRequest;

      const result = await multipartProcessor.process(mockReq);

      expect(result.body).toBe(mockFormData);
      // CRITICAL: Headers must be empty so fetch generates the boundary
      expect(result.headers).toEqual({}); 
    });
  });
});