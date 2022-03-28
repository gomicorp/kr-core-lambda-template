import { SQSBatchResponse, SQSEvent, SQSHandler, SQSRecord } from 'aws-lambda';

const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// TODO: SQL을 넣으세요
const insertSQL = '{SQL}';

const convertValue = (item: SQSRecord) => {
  const body = JSON.parse(item.body);
  const obj = JSON.parse(body);

  // TODO: values에 들어갈 데이터를 완성해주세요
  const values = [
    obj.prod_cd,
    obj.prod_des,
    obj.bar_code,
  ];

  return values;
};

const hello: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    const handlers = event.Records.map((record: SQSRecord) => {
      const values = convertValue(record);
      return client.query(insertSQL, values);
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

export { hello };
