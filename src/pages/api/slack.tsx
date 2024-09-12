import type { NextApiRequest, NextApiResponse } from 'next/types';
import { IncomingWebhook } from '@slack/webhook';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const url = process.env.SLACK_WEBHOOK_URL; // .envから取得
  let body = req.body;

  if (typeof body === 'undefined') {
    res.status(400).end('Invalid body: message');
    return;
  }

  if (req.method != 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  // Slackに投げる
  if (url) {
    const webhook = new IncomingWebhook(url);

    const tokens = Object.keys(body)
      .filter((key) => key.startsWith('set_') && key !== 'set_date') // 'set_'で始まるキーと'set_date'以外のキーのみを抽出
      .map((key) => key.slice(4)); // トークンの名前を取得（'set_'を削除）

    const blocks = tokens
      .map((token) => [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*通貨名:*\n${token}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*セット時:*\n${body[`set_${token}`]}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*売却枚数:*\n${body[`sold_${token}`]}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*手数料抜き枚数:*\n${body[`without_fee_${token}`]}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*手数料:*\n${body[`fee_${token}`]}`,
          },
        },
        {
          type: 'divider',
        },
      ])
      .flat();

    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Token Results',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Wallet Address:*\n${body['sold_owner_wallet_address']}`,
            },
            { type: 'mrkdwn', text: `*シリーズ:*\n${body['series']}` },
            { type: 'mrkdwn', text: `*NFT名:*\n${body['nft_name']}` },
            {
              type: 'mrkdwn',
              text: `*セット時価格:*\n${body['last_sale_usd_price']}`,
            },
            {
              type: 'mrkdwn',
              text: `*売却時価格:*\n${body['current_asset_price']}`,
            },
          ],
        },
        ...blocks,
      ],
    };

    if (req.method === 'POST') {
      await webhook.send(payload);
      res.status(201).end('Created');
    }
  }
};
