# Serverless Template Gomi Lambda Crawler 
- 데이터를 가져와 DynamoDB에 적재합니다.

## 기술 스택
- serverless
- serverless template
- nodejs(+typescript)

## 시작
1. 프로젝트 생성
```shell
serverless create \
  --template-url https://github.com/gomicorp/kr-core-lambda-template/tree/main/node-crawler-typescript \
  --path myService
```
2. 초기화
```
cd [myProject Folder]
npm install
```
3. 설정
   - `serverless.yml` TODO 항목 설정
   - `.env.*` TODO 항목 설정
   - `handler.ts`
   - `getData` 파일 구현
   - `saveToDynamoDb` TODO 항목 설정

## 추가사항
   ```
   # target 이 graphql 이 아니면 query.ts는 지워도 됩니다.
   ```

## 배포
```shell
sls deploy
# stage 별 배포
# sls deploy --stage {dev,stage,prod}
```

## 테스트 로컬
```shell
sls invoke local -f crawler --stage dev
```
