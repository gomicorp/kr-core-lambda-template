import gql from 'graphql-tag';
const boardId = process.env.TARGET_BOARD_ID || '';

// graphql 예시 쿼리 예시 입니다.
const getBoardQuery = `{
boards(ids: ${boardId}) { 
    id
    name
    state
    board_folder_id
    items {
      id
      name
      state
      group{
        id
        title
      }
      column_values {
        id
        text
        title
      }
    }
    columns{
      id
      title
      type
      archived
      description
    }
  }
  }
`;
export const sampleQuery = JSON.stringify({ query: getBoardQuery });

// variable( 파라미터 ) 받을 수 있게 하는 예시 입니다.
// gql 사용하지 않고 query 부분부터 사용하셔도 됩니다.
const sampleQueryWithGql = {
  sampleQueryWithGql: gql`
    query getBoardQuery($boardId: String) {
        boards(ids: $boardId) {
            id
            name
            state
            board_folder_id
            items {
                id
                name
                state
                group{
                    id
                    title
                }
                column_values {
                    id
                    text
                    title
                }
            }
            columns{
                id
                title
                type
                archived
                description
            }
        }
    }
  `
}
export const sampleQueryFunction = ( boardId: string ) => {
    sampleQueryWithGql.sampleQueryWithGql({ variables: { boardId } })
}
