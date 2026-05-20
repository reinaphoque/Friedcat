const { createJsonResponse, verifySession } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  const token = event.headers["x-admin-token"] || event.headers["authorization"];
  const session = verifySession(token);
  return createJsonResponse(200, { valid: Boolean(session) });
};

exports.handler = handler;
