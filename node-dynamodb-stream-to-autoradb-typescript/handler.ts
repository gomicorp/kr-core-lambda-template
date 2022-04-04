import {
  Context,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  DynamoDBStreamHandler,
} from 'aws-lambda';
import {
  convertItemToTargetTableValue,
  executeInsertSql,
  TargetTableType,
} from './handler.sql';

const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const convertValue = (item: DynamoDBRecord): TargetTableType | null => {
  if (!item.dynamodb?.NewImage) return null;

  return convertItemToTargetTableValue(item.dynamodb.NewImage);
};

const transfer: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent,
  context: Context,
): Promise<void> => {
  const client = await pool.connect();
  await client.query('BEGIN');

  try {
    const handlers = event.Records.map((record: DynamoDBRecord) => {
      if (record.eventName !== 'INSERT') return;

      const values = convertValue(record);
      if (!values) return;
      return executeInsertSql(pool, values);
    });

    await Promise.all(handlers);
    await client.query('COMMIT');
  } catch (e) {
    console.log(e, JSON.stringify(event));
    await client.query('ROLLBACK');
  } finally {
    client.release(true);
  }
};

export { transfer };
