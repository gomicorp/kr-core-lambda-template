import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { diff } from 'deep-object-diff';
import { v5 as uuidV5 } from 'uuid';
import * as AWS from 'aws-sdk';

AWS.config.update({ region: process.env.REGION || 'ap-southeast-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const TableName = process.env.DYNAMODB_TABLE_NAME;

/**
 * raw 데이터를 dynamodb에 맞게 변경합니다
 * * 추가되는 필드
 * - pk: 기본키
 * - indexKey: 검색용 key
 * - crawlingAt: 검색 정렬용
 *
 * @param pk
 * @param item
 * @param crawlingAt
 */
function convertRawDataToDynamoDBPutRequest(
  pk: string,
  item: any,
  crawlingAt: number,
): DocumentClient.WriteRequest {
  return {
    PutRequest: {
      Item: {
        // TODO 키 값이 되는 값을 설정 합니다. 예시로 item.id로 넣었습니다.
        pk,
        index_key: String(item.id),
        crawling_at: crawlingAt,
        ...item,
      },
    },
  };
}

/**
 * 데이터를 중복 검사하여 동일 데이터가 중복된 경우 null
 *
 * @param items
 */
async function excludeDuplicateData(items: any) {
  return (
    await Promise.all(
      items.map((_item: DocumentClient.WriteRequest) => {
        const item = _item.PutRequest?.Item;
        if (!item) return;
        const params = {
          TableName,
          IndexName: 'index_key-crawling_at-index',
          KeyConditionExpression: 'index_key = :indexKey',
          // TODO 키 값이 되는 값을 설정 합니다. 예시로 item.id로 넣었습니다.
          ExpressionAttributeValues: {
            ':indexKey': String(item.id),
          },
          ScanIndexForward: false,
          Limit: 1,
        } as DocumentClient.QueryInput;

        return new Promise((resolve, reject) => {
          docClient.query(params, function (err, data) {
            if (err) {
              reject(err);
              return;
            }
            if (data.Items?.[0]) {
              const diffed = diff(item, data.Items[0]);
              // TODO 키 값이 되는 값을 설정 합니다. 예시로 id로 넣었습니다.
              const diffCount = Object.keys(diffed).filter(
                (i) => !['pk', 'crawling_at', 'id'].includes(i),
              ).length;
              // item 이 이전 데이터와 중복, null return 하여 insert 방지
              if (!diffCount) {
                resolve(null);
                return;
              }
            }

            resolve(_item);
          });
        });
      }),
    )
  ).filter((i) => i);
}

/**
 * dynamodb 에 저장합니다. 이미 있으면 덮어쓰기
 * @param data
 */
export async function saveToDynamoDb(data: any, uuidV5NameSpace: string): Promise<any> {
  if (!TableName) return;
  const crawlingAt = new Date().getTime();
  const dataArray = data.boards.map((item: any) =>
    // TODO 키 값이 되는 값을 설정 합니다. 예시로 item.id로 넣었습니다.
    convertRawDataToDynamoDBPutRequest(
      uuidV5(item.id, uuidV5NameSpace),
      item,
      crawlingAt,
    ),
  );
  const filteredData = await excludeDuplicateData(dataArray);
  if (!filteredData.length) return;

  const sliceCount = 10;
  return await Promise.all(
    [...Array(Math.ceil(filteredData.length / sliceCount)).keys()].map((index) => {
      const startIndex = index * sliceCount;
      const sliceData = filteredData.slice(startIndex, startIndex + sliceCount);

      const params = {
        RequestItems: {
          [TableName]: sliceData,
        },
      } as DocumentClient.BatchWriteItemInput;

      return new Promise((resolve, reject) => {
        docClient.batchWrite(params, function (err, data) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log('data.UnprocessedItems', data.UnprocessedItems);
            resolve('success');
          }
        });
      });
    }),
  );
}
