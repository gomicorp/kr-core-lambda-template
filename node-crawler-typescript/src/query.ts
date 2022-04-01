// graphql 예시 쿼리 예시 입니다.
const boardId = process.env.TARGET_BOARD_ID || '';

export const getBoardQuery = `{
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
