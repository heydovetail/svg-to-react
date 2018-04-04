import * as crypto from "crypto";

export function sha1(data: string) {
  const generator = crypto.createHash("sha1");
  generator.update(data);
  return generator.digest("hex");
}
