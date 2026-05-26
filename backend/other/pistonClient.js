import axios from 'axios';

const DEFAULT_PISTON_API_URL = 'http://localhost:2000/api/v2';

const normalizeBaseUrl = (url) => (url || DEFAULT_PISTON_API_URL).replace(/\/$/, '');

export const pistonBaseUrl = normalizeBaseUrl(process.env.PISTON_API_URL);

export const executeCode = async (payload) => {
  try {
    const response = await axios.post(`${pistonBaseUrl}/execute`, payload, {
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    const upstreamMessage = error.response?.data?.message || error.message;
    const whitelistMessage = upstreamMessage?.toLowerCase().includes('whitelist only');
    const connectionFailed = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';

    let message = upstreamMessage || 'Failed to compile or execute code via Piston.';
    if (whitelistMessage) {
      message = 'The public Piston API is whitelist-only now. Configure PISTON_API_URL to a self-hosted Piston instance.';
    } else if (connectionFailed) {
      message = `Piston is not reachable at ${pistonBaseUrl}. Start your self-hosted Piston server or update PISTON_API_URL.`;
    }

    const status = whitelistMessage || connectionFailed ? 503 : (error.response?.status || 500);
    const wrappedError = new Error(message);
    wrappedError.status = status;
    wrappedError.upstream = error.response?.data;
    throw wrappedError;
  }
};
