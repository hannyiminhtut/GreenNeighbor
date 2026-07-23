const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

export class GeminiTemporarilyUnavailableError extends Error {
  constructor() {
    super(
      "AI verification is temporarily busy. Please wait a moment and try again."
    );
    this.name = "GeminiTemporarilyUnavailableError";
  }
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const value =
    candidate.status ?? candidate.statusCode ?? candidate.response?.status;
  const numericStatus = Number(value);

  if (Number.isInteger(numericStatus)) return numericStatus;

  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/\[(429|500|502|503|504)\b/);
  return match ? Number(match[1]) : null;
}

function isRetryableGeminiError(error: unknown) {
  const status = getErrorStatus(error);
  return status !== null && RETRYABLE_STATUS_CODES.includes(status);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableGeminiError(error)) throw error;
      if (attempt === maxAttempts) {
        throw new GeminiTemporarilyUnavailableError();
      }

      const exponentialDelay = 750 * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      await wait(exponentialDelay + jitter);
    }
  }

  throw new GeminiTemporarilyUnavailableError();
}

export function geminiErrorResponse(error: unknown) {
  if (error instanceof GeminiTemporarilyUnavailableError) {
    return {
      message: error.message,
      status: 503,
    };
  }

  return {
    message: error instanceof Error ? error.message : "AI request failed.",
    status: 500,
  };
}
