
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";
import cors from 'cors';

// Add CORS middleware before your MCP routes
const app = express();
app.use(cors({
  origin: '*', // Configure appropriately for production, for example:
  // origin: ['https://your-remote-domain.com, https://your-other-remote-domain.com'],
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
    // Check for existing session ID
    console.log('post-req.headers', req.headers)
    console.log('post-req.body', req.body)
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    console.log('sessionId', sessionId)
    let transport: StreamableHTTPServerTransport;
  
    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
        },
        // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
        // locally, make sure to set:
        enableDnsRebindingProtection: true,
        allowedHosts: ['127.0.0.1'],
      });
  
      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      const server = new McpServer({
        name: "example-server",
        version: "1.0.0"
      });

      // Async tool with external API call
      server.registerTool(
        "calculate-bmi",
        {
          title: "BMI Calculator",
          description: "Calculate Body Mass Index",
          inputSchema: {
            weightKg: z.number(),
            heightM: z.number()
          }
        },
        async ({ weightKg, heightM }) => ({
          content: [{
            type: "text",
            text: String(weightKg / (heightM * heightM))
          }]
        })
      );

      server.registerTool(
        "getPOI",
        {
          title: "打开周边监控",
          description: "根据经纬度打开周边监控",
          inputSchema: {
            x_poi: z.number(),
            y_poi: z.number()
          }
        },
        async ({ x_poi, y_poi }) => ({
          content: [{
            type: "text",
            text: String(x_poi + y_poi)
          }]
        })
      );
  
      // ... set up server resources, tools, and prompts ...
  
      // Connect to the MCP server
      await server.connect(transport);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
  
    // Handle the request
    await transport.handleRequest(req, res, req.body);
  });


// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    console.log('get-req.headers', req.headers)
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };
  
  // Handle GET requests for server-to-client notifications via SSE
  app.get('/mcp', handleSessionRequest);
  
  // Handle DELETE requests for session termination
  app.delete('/mcp', handleSessionRequest);
  
  app.listen(4000);
