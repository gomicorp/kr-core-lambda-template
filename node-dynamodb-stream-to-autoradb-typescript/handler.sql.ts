// eslint-disable-next-line max-classes-per-file
import type { Pool } from 'pg';
import { PostgreSqlConnection } from 'ts-sql-query/connections/PostgreSqlConnection';
import { ValueSourceValueType } from 'ts-sql-query/expressions/values';
import { ConsoleLogQueryRunner } from 'ts-sql-query/queryRunners/ConsoleLogQueryRunner';
import { PgPoolQueryRunner } from 'ts-sql-query/queryRunners/PgPoolQueryRunner';
import { Table } from 'ts-sql-query/Table';
import {
  OptionalColumnsForSetOf,
  RequiredColumnsForSetOf,
} from 'ts-sql-query/utils/tableOrViewUtils';

// TODO: table name in the database
const TABLE_NAME = 'if_eece_mdm_s_004';
// TODO: PK 컬럼명
const primaryKeyColumnName = 'pk';

class DBConnection extends PostgreSqlConnection<'DBConnection'> {}

// TODO: 컬럼을 정의해주세요
class TargetTable extends Table<DBConnection, 'targetTable'> {
  id = this.primaryKey(primaryKeyColumnName, 'string');
  out_price1 = this.optionalColumn('out_price1', 'string');
  remarks = this.optionalColumn('remarks', 'string');
  crawling_at = this.optionalColumn('crawling_at', 'bigint');
  index_key = this.optionalColumn('index_key', 'string');

  constructor() {
    super(TABLE_NAME);
  }
}
const targetTable = new TargetTable();

type TargetTableType = Omit<
  {
    [K in RequiredColumnsForSetOf<typeof targetTable>]: ValueSourceValueType<
      typeof targetTable[K]
    >;
  } & {
    [K in OptionalColumnsForSetOf<typeof targetTable>]?: ValueSourceValueType<
      typeof targetTable[K]
    >;
  },
  typeof primaryKeyColumnName
>;

const executeInsertSql = (pool: Pool, columns: TargetTableType) => {
  const connection = new DBConnection(
    new ConsoleLogQueryRunner(new PgPoolQueryRunner(pool)),
  );

  return (
    connection
      .insertInto(targetTable)
      .values(columns)
      // PK 충돌나면 아무것도 안함
      .onConflictOn(targetTable.id)
      .doNothing()
      .executeInsert()
  );
};

// TODO: 컬럼 맵핑 생성
const convertItemToTargetTableValue = (item: any): TargetTableType =>
  ({
    id: item.pk.S,
    out_price1: item.OUT_PRICE1.S,
    remarks: item.REMARKS.S,
    crawling_at: BigInt(item.crawling_at.N),
    index_key: item.index_key.S,
  } as TargetTableType);

export { targetTable, executeInsertSql, convertItemToTargetTableValue, TargetTableType };
