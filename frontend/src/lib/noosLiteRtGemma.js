import {
  buildNoosLiteRtPrompt,
  getNoosLiteRtFallbackOutput,
  parseNoosLiteRtOutput,
  SUPPORTED_TASKS,
} from './noosLiteRtTasks';
import {
  NOOS_LITERT_DISABLED,
  NOOS_LITERT_MODEL_URL,
  NOOS_LITERT_WASM_BASE_URL,
} from './env';

const LOCAL_ENGINE = 'gemma-4-e2b-it-web-litert';

let inferencePromise = null;
let generationQueue = Promise.resolve();
const responseCache = new Map();

const normalizeErrorMessage = (error) => {
  if (!error) return 'Unknown LiteRT error';
  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  return String(error);
};

const createAbortError = () => {
  const error = new Error('NOOS LiteRT task aborted');
  error.name = 'AbortError';
  return error;
};

const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

const isLocalhost = () => {
  if (!isBrowser()) return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

export const isNoosLiteRtSupported = () => {
  if (NOOS_LITERT_DISABLED) return false;
  if (!isBrowser()) return false;
  if (!navigator.gpu) return false;
  return window.isSecureContext || isLocalhost();
};

const ensureSupported = () => {
  if (!isNoosLiteRtSupported()) {
    throw new Error('NOOS LiteRT requires Chrome/WebGPU on a secure or localhost origin.');
  }
};

const getTaskKey = (task, payload) => `${task}:${JSON.stringify(payload)}`;

const enqueueGeneration = (work) => {
  const next = generationQueue.catch(() => undefined).then(work);
  generationQueue = next.catch(() => undefined);
  return next;
};

const loadInference = async () => {
  ensureSupported();

  if (!inferencePromise) {
    inferencePromise = (async () => {
      const { FilesetResolver, LlmInference } = await import('@mediapipe/tasks-genai');
      const fileset = await FilesetResolver.forGenAiTasks(NOOS_LITERT_WASM_BASE_URL);
      const inference = await LlmInference.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: NOOS_LITERT_MODEL_URL,
          delegate: 'GPU',
        },
        maxTokens: 1024,
        topK: 24,
        temperature: 0.2,
        randomSeed: 7,
      });
      return inference;
    })().catch((error) => {
      inferencePromise = null;
      throw error;
    });
  }

  return inferencePromise;
};

const bindAbortSignal = (signal, inference) => {
  if (!signal) return () => undefined;

  const handleAbort = () => {
    try {
      inference.cancelProcessing();
    } catch {
      // Ignore cancellation races from the underlying engine.
    }
  };

  signal.addEventListener('abort', handleAbort, { once: true });
  return () => signal.removeEventListener('abort', handleAbort);
};

export const buildNoosLiteRtFallbackResponse = (task, payload, error) => ({
  task,
  output: getNoosLiteRtFallbackOutput(task, payload),
  response_source: 'litert-fallback',
  engine: 'noos-fallback',
  cached: false,
  error_detail: error ? normalizeErrorMessage(error) : null,
});

export const warmNoosLiteRtGemma = async () => {
  await loadInference();
  return {
    ready: true,
    engine: LOCAL_ENGINE,
    model_url: DEFAULT_MODEL_URL,
  };
};

export const runNoosLiteRtTask = async (task, payload, options = {}) => {
  if (!SUPPORTED_TASKS.has(task)) {
    throw new Error(`Unsupported NOOS LiteRT task: ${task}`);
  }

  const { signal } = options;
  const cacheKey = getTaskKey(task, payload);
  const cached = responseCache.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      cached: true,
    };
  }

  if (signal?.aborted) {
    throw createAbortError();
  }

  return enqueueGeneration(async () => {
    if (signal?.aborted) {
      throw createAbortError();
    }

    const inference = await loadInference();
    if (signal?.aborted) {
      throw createAbortError();
    }

    const prompt = buildNoosLiteRtPrompt(task, payload);
    let partialResponse = '';
    let cleanupAbort = () => undefined;

    try {
      if (typeof inference.clearCancelSignals === 'function') {
        inference.clearCancelSignals();
      }

      cleanupAbort = bindAbortSignal(signal, inference);

      const rawText = await inference.generateResponse(prompt, (chunk) => {
        partialResponse = String(chunk || partialResponse || '');
        if (signal?.aborted) {
          try {
            inference.cancelProcessing();
          } catch {
            // Ignore cancellation races from the underlying engine.
          }
        }
      });

      if (signal?.aborted) {
        throw createAbortError();
      }

      const parsedOutput = parseNoosLiteRtOutput(task, payload, rawText || partialResponse);
      const response = {
        task,
        output: parsedOutput,
        response_source: 'litert-webgpu',
        engine: LOCAL_ENGINE,
        cached: false,
        model_url: DEFAULT_MODEL_URL,
      };

      responseCache.set(cacheKey, response);
      return response;
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') {
        throw createAbortError();
      }
      throw new Error(`NOOS LiteRT generation failed: ${normalizeErrorMessage(error)}`);
    } finally {
      cleanupAbort();
    }
  });
};
