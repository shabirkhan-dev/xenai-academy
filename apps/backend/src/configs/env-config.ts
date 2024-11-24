// use zode and validate the env and export the config
import {z} from 'zod'

const envSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => Number.parseInt(val, 10)).default('8080'),
  HOST: z.string().default('localhost'),
});

// Parse and validate environment variables
const parseEnvConfig = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(result.error.format(), null, 2)}`,
    );
  }

  return result.data;
};

export const config = parseEnvConfig();

export type EnvConfig = z.infer<typeof envSchema>;
