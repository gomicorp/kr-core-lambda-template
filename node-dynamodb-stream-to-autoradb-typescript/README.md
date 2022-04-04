# Serverless Template Gomi Lambda Transfer
- DynamoDB 데이터를 stream으로 전달받아 aurora db에 적재합니다.

## 기술 스택
- serverless
- serverless template
- nodejs(+typescript)

## 시작
1. 프로젝트 생성
```shell
serverless create \
  --template-url https://github.com/gomicorp/kr-core-lambda-template/tree/main/node-dynamodb-stream-to-autoradb-typescript \
  --path [myProject]
```
2. 초기화
```
cd [myProject Folder]
npm install
```
3. 설정
    - `serverless.yml` TODO 항목 설정
    - `.env.*` TODO 항목 설정
    - `handler.sql.ts` TODO 항목 설정
    - `pakeage.json` 에 name 수정

## 배포
```shell
sls deploy
# stage 별 배포
# sls deploy --stage {dev,stage,prod}
```

## 테스트 로컬
```shell
npm run test:local
```
