const API_BASE = "https://api.cloudflare.com/client/v4";
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(updateListInfo(env));
  },
  async fetch(request, env, ctx) {
    try {
      const data = await env.MANAGED_IP_LIST.get("list_info", { type: "json" });
      if (!data) {
        return new Response("No list info in KV yet. Wait for the next cron run.", {
          status: 404,
        });
      }
	  const ips = Array.isArray(data.result) ? data.result.map(item => item.ip) : [];
	  const responseBody = {
		  fetched_at: data.fetched_at,
		  ips: ips
	  };
      return new Response(JSON.stringify(responseBody), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
async function updateListInfo(env) {
  try {
    const accountId = env.CF_ACCOUNT_ID;
    const listId = env.CF_LIST_ID;
    const token = env.CF_API_TOKEN;
    if (!accountId || !listId || !token) {
      throw new Error("Missing CF_ACCOUNT_ID, CF_LIST_ID, or CF_API_TOKEN");
    }
    const url = `${API_BASE}/accounts/${accountId}/rules/lists/${listId}/items`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Lists API error: ${res.status} ${body}`);
    }
    const payload = await res.json();
    const result = payload.result ?? payload;
    const data = {
      fetched_at: new Date().toISOString(),
      result: Array.isArray(result) ? result.map(item => ({
        ip: item.ip,
        modified_on: item.modified_on
      })) : [],
    };
    await env.MANAGED_IP_LIST.put("list_info", JSON.stringify(data));
  } catch (error) {
    console.error("Error updating list info:", error.message);
    throw error;
  }
}

