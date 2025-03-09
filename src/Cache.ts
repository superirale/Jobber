import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1-hour TTL

const getCache = (key: string): Record<string, any> | null => {
  const cachedData = cache.get(key);

  if (cachedData) return cachedData;

  return null;
};

const setCache = (key: string, data: Record<string, any>): void => {
  cache.set(key, data);
};

export { getCache, setCache };
