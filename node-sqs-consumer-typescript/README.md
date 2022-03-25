# Serverless Template Gomi Lambda SQS Event Consumer 
SQS 에서 event 를 받아서 RDS 에 데이터를 적재합니다

## 기술 스택
- serverless
- serverless template
- nodejs(+typescript)

## 시작
1. 프로젝트 생성
```shell
serverless create \
  --template-url https://github.com/gomicorp/kr-core-lambda-template/tree/main/node-sqs-consumer-typescript \
  --path myService
```
2. 초기화
```
cd [myProject Folder]
npm install
```
3. 설정
   - `serverless.yml` iam role, sqs arn 설정
   - `serverless.yml` 필요시 vpc 내용 추가 필요
     - ```shell
       functions:
         hello:
           name: gomi-serverless-template-node-sqs-consumer-typescript-${opt:stage, 'dev'}
           handler: handler.hello
           vpc:
             securityGroupIds:
               - sg-XXXXX
             subnetIds:
               - subnet-XXXXX
               - subnet-XXXXX
         ```
     - `.env.example` 파일을 기반으로 `.env.dev` 파일 생성
     - `hndler.ts` insertSQL 과 convertValue 메소드 내용 완성

## 파일 구조
```
├── .env.example - 환경 변수 샘플
├── .npmignore
├── .prettierrc
├── README.md
├── handler.ts - 작업 파일
├── package.json - Dependency
├── sample.json - 참고용 샘플 데이터
├── serverless.yml - 기본 serverless 설정파일
└── tsconfig.json - typescript 설정
```
## 배포
```shell
sls deploy
# stage 별 배포
# sls deploy --stage {dev,stage,prod}
```

## 테스트
### 로컬에서 샘플파일로 테스트 실행
```shell
sls invoke local -f hello --path sample.json
```
