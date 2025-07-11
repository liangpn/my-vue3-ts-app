import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getOAuthProtectedResourceMetadataUrl, mcpAuthMetadataRouter } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { CallToolResult, GetPromptResult, isInitializeRequest, PrimitiveSchemaDefinition, ReadResourceResult, ResourceLink } from '@modelcontextprotocol/sdk/types.js';
// import { InMemoryEventStore } from '../shared/inMemoryEventStore.js';
// import { setupAuthServer } from './demoInMemoryOAuthProvider.js';
// import { OAuthMetadata } from 'src/shared/auth.js';
// import { checkResourceAllowed } from 'src/shared/auth-utils.js';

import cors from 'cors';

// Check for OAuth flag
// const useOAuth = process.argv.includes('--oauth');
// const strictOAuth = process.argv.includes('--oauth-strict');

// Create an MCP server with implementation details
const getServer = () => {
  const server = new McpServer({
    name: 'simple-streamable-http-server',
    version: '1.0.0'
  }, { capabilities: { logging: {} } });


  // 打开周边监控工具
  server.registerTool(
    'getPOI',
    {
      title: '打开周边监控',
      description: '根据坐标打开案发地点周边监控',
      inputSchema: {
        x_position: z.string().describe('案发地点x坐标'),
        y_position: z.string().describe('案发地点y坐标'),
        afdd: z.string().describe('案发地点')
      }
    },
    async ({ x_position, y_position, afdd }): Promise<CallToolResult> => {
      try {
        return {
          content: [{
            type: 'text',
            text: `已打开:${afdd}:的周边监控,坐标:${x_position},${y_position}`
          }],
          metadata: {
            status: 'success',
            fail_reason: ''
          }
        };
      } catch (error) {
        return {
          content: [],
          metadata: {
            status: 'fail',
            fail_reason: String(error)
          }
        };
      }
    }
  );

  // 查看值班人员信息工具
  server.registerTool(
    'showQw',
    {
      title: '查看值班人员',
      description: '根据管辖单位代码查看值班人员信息',
      inputSchema: {
        gxdwdm: z.string().describe('管辖单位代码')
      }
    },
    async ({ gxdwdm }): Promise<CallToolResult> => {
      try {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify([
              { name: '张三', phone: '13800138000', gw: '巡警', gxdwdm: gxdwdm },
              { name: '李四', phone: '13800138001', gw: '巡警', gxdwdm: gxdwdm }
            ])
          }],
          metadata: {
            status: 'success',
            fail_reason: ''
          }
        };
      } catch (error) {
        return {
          content: [],
          metadata: {
            status: 'fail',
            fail_reason: String(error)
          }
        };
      }
    }
  );

  // 拨打值班电话工具
  server.registerTool(
    'callPhone',
    {
      title: '拨打值班电话',
      description: '拨打指定值班人员电话',
      inputSchema: {
        phone: z.string().describe('值班人员电话')
      }
    },
    async ({ phone }): Promise<CallToolResult> => {
      try {
        return {
          content: [{
            type: 'text',
            text: `已拨打:${phone}`
          }],
          metadata: {
            status: 'success',
            fail_reason: '',
            phone
          }
        };
      } catch (error) {
        return {
          content: [],
          metadata: {
            status: 'fail',
            fail_reason: String(error),
            phone
          }
        };
      }
    }
  );

  return server;
};

const MCP_PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 4000;
// const AUTH_PORT = process.env.MCP_AUTH_PORT ? parseInt(process.env.MCP_AUTH_PORT, 10) : 3001;

const app = express();
app.use(express.json());

// Allow CORS all domains, expose the Mcp-Session-Id header
app.use(cors({
  origin: '*', // Allow all origins
  exposedHeaders: ["Mcp-Session-Id"]
}));

// Set up OAuth if enabled
// let authMiddleware = null;
// if (useOAuth) {
//   // Create auth middleware for MCP endpoints
//   const mcpServerUrl = new URL(`http://localhost:${MCP_PORT}/mcp`);
//   const authServerUrl = new URL(`http://localhost:${AUTH_PORT}`);

//   const oauthMetadata: OAuthMetadata = setupAuthServer({ authServerUrl, mcpServerUrl, strictResource: strictOAuth });

//   const tokenVerifier = {
//     verifyAccessToken: async (token: string) => {
//       const endpoint = oauthMetadata.introspection_endpoint;

//       if (!endpoint) {
//         throw new Error('No token verification endpoint available in metadata');
//       }

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           token: token
//         }).toString()
//       });


//       if (!response.ok) {
//         throw new Error(`Invalid or expired token: ${await response.text()}`);
//       }

//       const data = await response.json();

//       if (strictOAuth) {
//         if (!data.aud) {
//           throw new Error(`Resource Indicator (RFC8707) missing`);
//         }
//         if (!checkResourceAllowed({ requestedResource: data.aud, configuredResource: mcpServerUrl })) {
//           throw new Error(`Expected resource indicator ${mcpServerUrl}, got: ${data.aud}`);
//         }
//       }

//       // Convert the response to AuthInfo format
//       return {
//         token,
//         clientId: data.client_id,
//         scopes: data.scope ? data.scope.split(' ') : [],
//         expiresAt: data.exp,
//       };
//     }
//   }
//   // Add metadata routes to the main MCP server
//   app.use(mcpAuthMetadataRouter({
//     oauthMetadata,
//     resourceServerUrl: mcpServerUrl,
//     scopesSupported: ['mcp:tools'],
//     resourceName: 'MCP Demo Server',
//   }));

//   authMiddleware = requireBearerAuth({
//     verifier: tokenVerifier,
//     requiredScopes: [],
//     resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(mcpServerUrl),
//   });
// }

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// MCP POST endpoint with optional auth
const mcpPostHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (sessionId) {
    console.log(`Received MCP request for session: ${sessionId}`);
  } else {
    console.log('Request body:', req.body);
  }

  // if (useOAuth && req.auth) {
  //   console.log('Authenticated user:', req.auth);
  // }
  try {
    let transport: StreamableHTTPServerTransport;
    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      // const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        // eventStore, // Enable resumability
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID when session is initialized
          // This avoids race conditions where requests might come in before the session is stored
          console.log(`Session initialized with ID: ${sessionId}`);
          transports[sessionId] = transport;
        }
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}, removing from transports map`);
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server BEFORE handling the request
      // so responses can flow back through the same transport
      const server = getServer();
      await server.connect(transport);

      await transport.handleRequest(req, res, req.body);
      return; // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
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

    // Handle the request with existing transport - no need to reconnect
    // The existing transport is already connected to the server
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
};

app.post('/mcp', mcpPostHandler);

// Set up routes with conditional auth middleware
// if (useOAuth && authMiddleware) {
//   app.post('/mcp', authMiddleware, mcpPostHandler);
// } else {
//   app.post('/mcp', mcpPostHandler);
// }

// Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
const mcpGetHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  // if (useOAuth && req.auth) {
  //   console.log('Authenticated SSE connection from user:', req.auth);
  // }

  // Check for Last-Event-ID header for resumability
  const lastEventId = req.headers['last-event-id'] as string | undefined;
  if (lastEventId) {
    console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
  } else {
    console.log(`Establishing new SSE stream for session ${sessionId}`);
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get('/mcp', mcpGetHandler);

// Set up GET route with conditional auth middleware
// if (useOAuth && authMiddleware) {
//   app.get('/mcp', authMiddleware, mcpGetHandler);
// } else {
//   app.get('/mcp', mcpGetHandler);
// }

// Handle DELETE requests for session termination (according to MCP spec)
const mcpDeleteHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Received session termination request for session ${sessionId}`);

  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
};

app.delete('/mcp', mcpDeleteHandler);

// Set up DELETE route with conditional auth middleware
// if (useOAuth && authMiddleware) {
//     app.delete('/mcp', authMiddleware, mcpDeleteHandler);
//   } else {
//   app.delete('/mcp', mcpDeleteHandler);
// }

app.listen(MCP_PORT, (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`MCP Streamable HTTP Server listening on port ${MCP_PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.log('Server shutdown complete');
  process.exit(0);
});
