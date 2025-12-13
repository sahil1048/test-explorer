import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";
import SignupForm from "@/components/auth/SignupForm";

export default async function SignupPage() {
  // 1. Detect Subdomain
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  let subdomain = null;

  const parts = hostname.split(".");
  if (hostname.includes("localhost")) {
    if (parts.length >= 2) subdomain = parts[0];
  } else {
    // Check if parts length is 3 (e.g., school.testexplorer.com)
    if (parts.length >= 3) subdomain = parts[0];
  }

  // 2. Fetch School Data if Subdomain exists
  let school = null;
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    school = await getSchoolBySubdomain(subdomain);
  }

  // 3. Render Client Form with School Data (if any)
  return <SignupForm school={school} />;
}