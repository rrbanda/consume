/** Environment config -- configurable per deployment */

export const config = {
  paperclipApiUrl: process.env.PAPERCLIP_API_URL || "http://localhost:3100",
  companyId: process.env.PAPERCLIP_COMPANY_ID || "",
};
