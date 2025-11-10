// Força runtime Node.js para compatibilidade com crypto e dynamic import
export const runtime = "nodejs";
// src/app/api/mcp-schemas/[agent]/route.js

import { promises as fs } from "fs"; 
// This allows us to read files asynchronously, which is necessary for handling API requests in Next.js
import path from "path"; 
// Importing path module to handle file paths in a cross-platform way
// This is useful for constructing the path to the MCP schema files based on the agent name provided
import { NextResponse } from "next/server"; 
// Importing NextResponse to create responses for API routes in Next.js


export async function GET(request, { params }) {
  // This function handles GET requests to the API route
  // The request parameter contains the HTTP request object, and params contains the route parameters
  const agentName = params.agent; 
  // Extracting the agent name from the route parameters
  // This is the name of the agent for which we want to fetch the MCP schema

  const schemaPath = path.join(
    // Constructing the path to the MCP schema file
    // Using path.join to ensure the path is constructed correctly across different operating systems
    process.cwd(), // process.cwd() gets the current working directory of the Node.js process
    "src",
    "mcp-schemas",
    `${agentName}.mcp.json`,
  );

  try {
    const fileContents = await fs.readFile(schemaPath, "utf-8"); // Reading the schema file asynchronously
    // The 'utf-8' encoding ensures that the file is read as a string which is necessary for JSON parsing
    return new NextResponse(fileContents, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Schema not found or failed to load." }),
      { status: 404 },
    );
  }
}
// This route handles GET requests to fetch the MCP schema for a specific agent.
// It reads the schema file from the filesystem based on the agent name provided in the URL.
// If the file is found, it returns the contents as a JSON response with a 200 status code.
// If the file is not found or an error occurs, it returns a 404 status with an error message.
// This is useful for dynamically serving different MCP schemas based on the agent name in the URL.
