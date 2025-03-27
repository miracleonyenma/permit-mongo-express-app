// ./src/lib/permit.ts
import { Permit } from "permitio";
const PERMIT_TOKEN = process.env.PERMIT_API_KEY;

const permit = new Permit({
  // you'll have to set the PDP url to the PDP you've deployedin the previous step
  pdp: "http://localhost:7766",
  token: PERMIT_TOKEN,
});
export default permit;
