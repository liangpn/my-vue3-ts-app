import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";



let client: Client|undefined = undefined
const url = "http://localhost:4000/mcp"
const baseUrl = new URL(url);
try {
  client = new Client({
    name: 'streamable-http-client',
    version: '1.0.0'
  });
  const transport = new StreamableHTTPClientTransport(
    new URL(baseUrl),
    {
      sessionId: "123e4567-e89b-12d3-a456-426614174000" // 设置 sessionId
    }
  );
  await client.connect(transport);
  console.log("Connected using Streamable HTTP transport");
  const toolsResult = await client.listTools();
  console.log('-------------toolsResult', toolsResult)
  const tools = toolsResult.tools.map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    };
  });
  console.log(
    "Connected to server with tools:",
    tools.map(({ name }) => name),
  );
} catch (error) {
  console.log(error)  
  // If that fails with a 4xx error, try the older SSE transport
  console.log("Streamable HTTP connection failed, falling back to SSE transport");
  client = new Client({
    name: 'sse-client',
    version: '1.0.0'
  });
  const sseTransport = new SSEClientTransport(baseUrl);
  await client.connect(sseTransport);
  console.log("Connected using SSE transport");
}