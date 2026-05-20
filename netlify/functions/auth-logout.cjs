const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");

const handler = async () => {
  return createJsonResponse(200, { success: true });
};

exports.handler = handler;
