export const createMemoryRateLimiter = ({
  windowMs = 60_000,
  max = 60,
  message = 'Too many requests. Please slow down.',
  keyGenerator = (req) => req.user?.userId || req.ip,
} = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyGenerator(req)}:${req.baseUrl}:${req.route?.path || req.path}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({ message });
    }

    current.count += 1;
    return next();
  };
};
