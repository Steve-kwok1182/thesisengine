// api/generate.js
// ThesisEngine 静态模拟版本（不调用任何 LLM）

const SIMULATED_RESPONSE = `**Bull Case**（看涨理由）：
- 腾讯核心游戏业务（王者荣耀、和平精英）2025年流水预计同比增长18%，付费用户粘性极高
- 微信生态持续扩张，企业微信+视频号商业化提速，广告收入有望增长22%
- 海外市场（PUBG Mobile、Valorant）收入占比已达28%，国际化成效显著
- AI+云计算（腾讯云）2025年收入目标翻番，毛利率持续提升

**Bear Case**（看跌理由）：
- 国内游戏版号监管趋严，新游戏上线节奏可能放缓
- 宏观经济下行导致广告主预算缩减，影响微信广告收入
- 国际地缘风险可能导致部分海外收入受限
- 竞争对手（字节、网易）在AI和短视频领域加速追赶

**Key Risk**：
监管政策变化、宏观经济波动、国际关系紧张导致海外业务受阻

**Verdict**：
**Bull**（强烈看好，建议增持）`;

export default async function handler(req, res) {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    // 读取前端传来的数据（仅做验证，不实际使用）
    const body = req.body || {};
    console.log('收到请求数据:', { stockCode: body.stockCode, stockName: body.stockName });

    // 开始流式返回（模拟真实 LLM 逐字输出）
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 把模拟内容切成小块，模拟实时打字效果
    const chunks = SIMULATED_RESPONSE.split(''); // 按字符拆分
    let i = 0;

    const interval = setInterval(() => {
      if (i < chunks.length) {
        const chunk = chunks[i];
        res.write(`data: ${chunk}\n\n`);
        i++;
      } else {
        clearInterval(interval);
        res.end();
      }
    }, 8); // 每8毫秒发一个字符，速度自然

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '后端代理异常' });
  }
}