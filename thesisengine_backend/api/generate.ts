const SIMULATED_RESPONSE = `**Bull Case**（看涨理由）：
- 腾讯核心游戏业务2025年流水预计同比增长18%
- 微信生态持续扩张，广告收入有望增长22%
- 海外市场收入占比达28%
- AI+云计算业务毛利率提升

**Bear Case**（看跌理由）：
- 国内游戏监管趋严
- 宏观经济下行影响广告预算
- 国际地缘风险
- 竞争对手加速追赶

**Key Risk**：监管政策变化 + 宏观经济波动

**Verdict**：**Bull**（强烈看好）`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持 POST' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const chunks = SIMULATED_RESPONSE.split('');
  let i = 0;
  const interval = setInterval(() => {
    if (i < chunks.length) {
      res.write(`data: ${chunks[i]}\n\n`);
      i++;
    } else {
      clearInterval(interval);
      res.end();
    }
  }, 10);
}
