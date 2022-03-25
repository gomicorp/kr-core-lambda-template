import { Handler } from 'aws-lambda';

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

interface HandlerResponse {
  statusCode: number;
  body: string;
}

const convertValue = (item: any) => {
  // TODO: values에 들어갈 데이터를 완성해주세요
  const values = [
    item.dynamodb.NewImage.VARIABLE1.S,
    item.dynamodb.NewImage.VARIABLE2.S,
    item.dynamodb.NewImage.VARIABLE3.S,
  ];

  return values;
};

const hello: Handler = async (event: any) => {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    const handlers = event.Records.map((record: any) => {
      const values = convertValue(record);
      return client.query(insertSQL, values);
    });

    await Promise.all(handlers);
    await client.query('COMMIT');
  } catch (e) {
    console.log(e, JSON.stringify(event));
    await client.query('ROLLBACK');
  }
  client.release(true);

  const response: HandlerResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
    }),
  };
  return response;
};

export { hello };
