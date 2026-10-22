"use strict";

const http = require("node:http");
const https = require("node:https");
const { timingSafeEqual } = require("node:crypto");

const HOST = "127.0.0.1";
const PORT = Number(process.env.NVIDIA_NIM_BRIDGE_PORT || 8765);
const UPSTREAM_HOST = "integrate.api.nvidia.com";
const LOCAL_API_KEY = "local-nvidia-bridge";
const MAX_BODY_BYTES = 20 * 1024 * 1024;
const UPSTREAM_API_KEY = process.env.NVIDIA_NIM_UPSTREAM_KEY;

if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) {
    console.error("NVIDIA_NIM_BRIDGE_PORT must be an integer between 1024 and 65535.");
    process.exit(1);
}

if (!UPSTREAM_API_KEY) {
    console.error("NVIDIA NIM credential was not provided by the Windows launcher.");
    process.exit(1);
}

function sendJson(response, statusCode, message) {
    const body = JSON.stringify({ error: { message } });
    response.writeHead(statusCode, {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(body),
        "cache-control": "no-store",
    });
    response.end(body);
}

function hasLocalAuthorization(request) {
    const provided = Buffer.from(request.headers.authorization || "");
    const expected = Buffer.from(`Bearer ${LOCAL_API_KEY}`);
    return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function isLoopback(request) {
    return request.socket.remoteAddress === "127.0.0.1";
}

function allowedRoute(method, pathname) {
    return (method === "GET" && pathname === "/v1/models")
        || (method === "POST" && pathname === "/v1/chat/completions");
}

function withoutReasoningContent(payload) {
    for (const choice of payload.choices || []) {
        if (choice.delta && typeof choice.delta === "object") {
            delete choice.delta.reasoning_content;
        }
        if (choice.message && typeof choice.message === "object") {
            delete choice.message.reasoning_content;
        }
    }
    return payload;
}

function filterServerSentEvent(event) {
    return event.split(/\r?\n/).map((line) => {
        if (!line.startsWith("data: ") || line === "data: [DONE]") {
            return line;
        }

        try {
            const payload = JSON.parse(line.slice(6));
            return `data: ${JSON.stringify(withoutReasoningContent(payload))}`;
        } catch {
            return line;
        }
    }).join("\n");
}

const server = http.createServer((request, response) => {
    if (!isLoopback(request)) {
        sendJson(response, 403, "Only local connections are allowed.");
        return;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(request.url || "/", `http://${HOST}:${PORT}`);
    } catch {
        sendJson(response, 400, "Invalid local request URL.");
        return;
    }
    const pathname = parsedUrl.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && pathname === "/healthz") {
        sendJson(response, 200, "NVIDIA NIM bridge is running.");
        return;
    }

    if (!allowedRoute(request.method, pathname)) {
        sendJson(response, 404, "This route is not available through the local bridge.");
        return;
    }

    if (!hasLocalAuthorization(request)) {
        sendJson(response, 401, "Local bridge authorization failed.");
        return;
    }

    const upstreamPath = `${parsedUrl.pathname}${parsedUrl.search}`;
    function forwardRequest(body) {
        let upstreamBody = body;
        if (request.method === "POST") {
            let payload;
            try {
                payload = JSON.parse(body.toString("utf8"));
            } catch {
                sendJson(response, 400, "Request body must contain valid JSON.");
                return;
            }

            if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
                sendJson(response, 400, "Request body must be a JSON object.");
                return;
            }

            upstreamBody = body;
        }

        const upstreamRequest = https.request({
            hostname: UPSTREAM_HOST,
            port: 443,
            path: upstreamPath,
            method: request.method,
            headers: {
                authorization: `Bearer ${UPSTREAM_API_KEY}`,
                accept: request.headers.accept || "application/json",
                "accept-encoding": "identity",
                ...(request.headers["content-type"]
                    ? { "content-type": request.headers["content-type"] }
                    : {}),
                ...(request.method === "POST"
                    ? { "content-length": upstreamBody.length }
                    : {}),
            },
        }, (upstreamResponse) => {
            const responseHeaders = {};
            for (const name of ["content-type", "cache-control", "x-request-id"]) {
                const value = upstreamResponse.headers[name];
                if (value) {
                    responseHeaders[name] = value;
                }
            }

            response.writeHead(upstreamResponse.statusCode || 502, responseHeaders);
            const contentType = String(upstreamResponse.headers["content-type"] || "");
            if (contentType.includes("text/event-stream")) {
                let pending = "";
                upstreamResponse.setEncoding("utf8");
                upstreamResponse.on("data", (chunk) => {
                    pending += chunk;
                    let separator = pending.match(/\r?\n\r?\n/);
                    while (separator) {
                        const boundary = separator.index;
                        const event = pending.slice(0, boundary);
                        response.write(`${filterServerSentEvent(event)}\n\n`);
                        pending = pending.slice(boundary + separator[0].length);
                        separator = pending.match(/\r?\n\r?\n/);
                    }
                });
                upstreamResponse.on("end", () => {
                    if (pending) {
                        response.end(filterServerSentEvent(pending));
                    } else {
                        response.end();
                    }
                });
                upstreamResponse.on("error", () => response.destroy());
                return;
            }

            if (contentType.includes("application/json")) {
                const chunks = [];
                upstreamResponse.on("data", (chunk) => chunks.push(chunk));
                upstreamResponse.on("end", () => {
                    try {
                        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
                        response.end(Buffer.from(JSON.stringify(withoutReasoningContent(payload))));
                    } catch {
                        response.end(Buffer.concat(chunks));
                    }
                });
                upstreamResponse.on("error", () => response.destroy());
                return;
            }

            upstreamResponse.pipe(response);
        });

        upstreamRequest.on("error", (error) => {
            console.error(`NVIDIA NIM connection failed (${error.code || "network error"}).`);
            if (!response.headersSent) {
                sendJson(response, 502, "Could not connect to NVIDIA NIM. Check the network and try again.");
            } else {
                response.destroy();
            }
        });

        upstreamRequest.end(upstreamBody);
    }

    if (request.method === "GET") {
        forwardRequest(Buffer.alloc(0));
        return;
    }

    const chunks = [];
    let receivedBytes = 0;
    let bodyTooLarge = false;
    request.on("data", (chunk) => {
        if (bodyTooLarge) {
            return;
        }
        receivedBytes += chunk.length;
        if (receivedBytes > MAX_BODY_BYTES) {
            bodyTooLarge = true;
            chunks.length = 0;
            sendJson(response, 413, "Request body exceeds the 20 MiB local limit.");
            request.resume();
            return;
        }

        if (!bodyTooLarge) {
            chunks.push(chunk);
        }
    });
    request.on("end", () => {
        if (!bodyTooLarge) {
            forwardRequest(Buffer.concat(chunks));
        }
    });
    request.on("error", () => {
        if (!response.headersSent) {
            sendJson(response, 400, "Could not read the local request body.");
        }
    });
});

server.on("error", (error) => {
    console.error(`Could not start the local NVIDIA NIM bridge (${error.code || "server error"}).`);
    process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
    console.log(`Local NVIDIA NIM bridge is ready at http://${HOST}:${PORT}/v1.`);
});
