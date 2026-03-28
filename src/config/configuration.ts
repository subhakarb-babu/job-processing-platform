export default () => {
  const getEnv = (key: string, required = true): string => {
    const value = process.env[key];
    if (required && !value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value as string;
  };

  const toNumber = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
  };

  return {
    port: toNumber(process.env.PORT, 3000),

    database: {
      host: getEnv('DB_HOST'),
      port: toNumber(process.env.DB_PORT, 5432),
      user: getEnv('DB_USER'),
      password: getEnv('DB_PASSWORD'),
      name: getEnv('DB_NAME'),
    },

    redis: {
      host: getEnv('REDIS_HOST'),
      port: toNumber(process.env.REDIS_PORT, 6379),
    },
  };
};