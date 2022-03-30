import { SQSBatchResponse, SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';
import { convertItemToTargetTableValue, executeInsertSql, TargetTableType } from './handler.sql';

const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const convertValue = (item: SQSRecord): TargetTableType => {
  const body = JSON.parse(item.body);
  const obj = JSON.parse(body);

  return convertItemToTargetTableValue(obj);
};

const dataLoader: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    const handlers = event.Records.map((record: SQSRecord) => {
      const values = convertValue(record);
      return executeInsertSql(pool, values);
    });

    await Promise.all(handlers);
    await client.query('COMMIT');
  } catch (e) {
    console.log(e, JSON.stringify(event));
    await client.query('ROLLBACK');

    const response: SQSBatchResponse = {
      batchItemFailures: event.Records.map((record) => ({ itemIdentifier: record.messageId })),
    };
    return response;
  }
  client.release(true);

  const response: SQSBatchResponse = {
    batchItemFailures: [],
  };
  return response;
};

export { dataLoader };
