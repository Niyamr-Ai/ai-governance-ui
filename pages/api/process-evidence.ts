import type { NextApiRequest, NextApiResponse } from "next";

// ⚠️ DEPRECATED: This endpoint has been moved to the backend Express server
// to avoid Turbopack bundling issues with native modules.
// The frontend now calls /api/process-evidence on the backend directly.
// This file is kept for reference but is no longer used.

/**
 * Process Evidence Files API
 * 
 * ⚠️ DEPRECATED: This endpoint has been moved to the backend Express server.
 * This file is kept for reference but is no longer used.
 */

// Disable body parser to allow formidable to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ⚠️ DEPRECATED: This endpoint has been moved to the backend Express server
  console.log(`⚠️  [DEPRECATED] /api/process-evidence called on Next.js - this endpoint has been moved to backend`);
  return res.status(410).json({ 
    error: 'This endpoint has been moved to the backend server',
    message: 'Please use the backend endpoint at http://localhost:3001/api/process-evidence'
  });
}

