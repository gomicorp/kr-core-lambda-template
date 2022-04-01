import { Handler } from 'aws-lambda';
import { v4 } from 'uuid';
import { saveToDynamoDb } from './src/saveToDynamoDb';
import { HandlerResponse } from './src/types';
import getData from './src/getData';

const crawler: Handler = async () => {
  const uuidV5NameSpace = v4();
  const data = await getData();
  const result = await saveToDynamoDb(data, uuidV5NameSpace);

  const response: HandlerResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
    }),
  };
  return response;
};

export { crawler };
