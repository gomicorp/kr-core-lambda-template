import { Handler } from 'aws-lambda';

const { Client } = require('pg');

const client = new Client({
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
  client.connect();
  try {
    const handlers = event.Records.map((record: any) => {
      const values = convertValue(record);
      return client.query(insertSQL, values);
    });

    await Promise.all(handlers);
  } catch (e) {
    console.log(e);
  }
  await client.end();

  const response: HandlerResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
    }),
  };
  return response;
};

export { hello };
