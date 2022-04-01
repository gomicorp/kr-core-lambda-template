import { sampleQuery } from './query';
import axios from 'axios';

const baseUrl = process.env.BASE_URL;
const token = process.env.TOKEN;

// 호출 샘플입니다.
export default async function getData() {
  const result = await axios({
    url: baseUrl,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    data: sampleQuery,
  });

  return result.data.data;
}
