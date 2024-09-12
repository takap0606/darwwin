import axios from 'axios';

// Next.jsのAPIエンドポイントを指定
// const API_ENDPOINT = 'https://www.crypto-fattening.io/api/nftData';
const API_ENDPOINT = 'http://localhost:3001/api/userData';

export default async function handler(req: any, res: any) {
  const getDataFromAPI = async (email: string) => {
    try {
      const response = await axios.get(API_ENDPOINT, {
        params: { email },
        headers: {
          Origin: 'http://localhost:3002/', // クライアント側のオリジンを指定
        },
      });
      return response.data;
    } catch (error: any) {
      // エラーメッセージや詳細を返す
      if (error.response) {
        // Axiosがサーバーからのエラーレスポンスを受け取った場合
        return {
          error: true,
          message: error.response.data.message || 'Unknown error occurred',
          status: error.response.status,
        };
      } else if (error.request) {
        // サーバーへのリクエストは作成されたが、レスポンスがない場合
        return {
          error: true,
          message: 'No response from server',
        };
      } else {
        // リクエストの作成中に何らかのエラーが発生した場合
        return {
          error: true,
          message: error.message,
        };
      }
    }
  };

  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'メールアドレスが必要です。' });
  }

  const data = await getDataFromAPI(email);

  // エラーレスポンスが返された場合の処理
  if (data.error) {
    return res.status(data.status || 500).json({ error: data.message });
  }

  res.status(200).json(data); // データをそのまま返す
}
