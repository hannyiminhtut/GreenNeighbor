import {
  GeminiTemporarilyUnavailableError,
  geminiErrorResponse,
  withGeminiRetry,
} from "@/lib/gemini-retry";

describe("Gemini retry handling", () => {
  it("returns successful results without retrying", async () => {
    const operation = jest.fn().mockResolvedValue("verified");

    await expect(withGeminiRetry(operation)).resolves.toBe("verified");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("converts an exhausted 503 into a friendly temporary error", async () => {
    const operation = jest
      .fn()
      .mockRejectedValue(
        new Error("[503 Service Unavailable] This model is experiencing high demand.")
      );

    await expect(withGeminiRetry(operation, 1)).rejects.toBeInstanceOf(
      GeminiTemporarilyUnavailableError
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("does not retry permanent request errors", async () => {
    const operation = jest.fn().mockRejectedValue(new Error("[400 Bad Request]"));

    await expect(withGeminiRetry(operation)).rejects.toThrow("400 Bad Request");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("maps temporary errors to HTTP 503", () => {
    expect(geminiErrorResponse(new GeminiTemporarilyUnavailableError())).toEqual({
      message:
        "AI verification is temporarily busy. Please wait a moment and try again.",
      status: 503,
    });
  });
});
