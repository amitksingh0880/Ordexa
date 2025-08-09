import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const schema = Joi.object({
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CONSUMER_GROUP: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  LOG_LEVEL: Joi.string().default('info'),
}).unknown();

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const config = value as Record<string, string>;
