// GTS Hub backend smoke test.
//
// Run this FROM INSIDE your backend project folder (same folder as .env,
// so it can read ADMIN_KEY automatically):
//
//   node gts-hub-smoke-test.js
//
// Requires Node 18+ (uses native fetch). Targets http://localhost:5000 -
// change BASE_URL below if your local server runs on a different port.

require("dotenv").config();

const BASE_URL = "http://localhost:5000/api";
const ADMIN_KEY = process.env.ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error("ADMIN_KEY not found in .env - can't run admin-protected requests. Aborting.");
  process.exit(1);
}

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS - ${label}`);
    passed++;
  } else {
    console.log(`  FAIL - ${label}${detail ? ` (${detail})` : ""}`);
    failed++;
  }
}

async function api(method, path, { admin = false, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { "x-admin-key": ADMIN_KEY } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function main() {
  const suffix = Date.now(); // keep each run's slugs unique

  console.log("\n1. Create a published Material");
  const materialRes = await api("POST", "/materials", {
    admin: true,
    body: {
      name: `Performance Polyester ${suffix}`,
      slug: `performance-polyester-${suffix}`,
      description: "Lightweight, breathable, quick-drying fabric.",
      gsm: 160,
      suitableFor: ["Football", "Cricket"],
      tags: ["polyester", "breathable"],
      status: "published",
    },
  });
  check("Material created (201)", materialRes.status === 201, JSON.stringify(materialRes.json));
  const material = materialRes.json?.data;

  console.log("\n2. Create a published Portfolio project (shares sport+tag with the Material, for auto-matching)");
  const portfolioRes = await api("POST", "/portfolio", {
    admin: true,
    body: {
      title: `Kathmandu Warriors Jersey ${suffix}`,
      slug: `kathmandu-warriors-${suffix}`,
      organizationName: "Kathmandu Warriors FC",
      sport: "Football",
      productType: "Jersey Kit",
      description: "Full custom kit for the Kathmandu Warriors football team.",
      finalImages: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Final jersey" }],
      tags: ["polyester", "sublimation"],
      status: "published",
    },
  });
  check("Portfolio created (201)", portfolioRes.status === 201, JSON.stringify(portfolioRes.json));
  const portfolio = portfolioRes.json?.data;

  console.log("\n3. Try creating a Journal article missing required publish fields (should be rejected)");
  const invalidJournalRes = await api("POST", "/journal", {
    admin: true,
    body: {
      title: `Incomplete Article ${suffix}`,
      slug: `incomplete-article-${suffix}`,
      status: "published", // content/excerpt missing - should fail
    },
  });
  check(
    "Publish validation rejects incomplete article (400)",
    invalidJournalRes.status === 400,
    `got ${invalidJournalRes.status}`
  );

  console.log("\n4. Create a valid, published Journal article that MANUALLY links to the Material");
  const journalRes = await api("POST", "/journal", {
    admin: true,
    body: {
      title: `How to Choose Jersey Fabric ${suffix}`,
      slug: `choose-jersey-fabric-${suffix}`,
      excerpt: "A quick guide to picking the right fabric for your team's jersey.",
      content: "<p>Polyester performance fabric is a great all-round choice...</p>",
      sport: "Football",
      productType: "Jersey Kit",
      tags: ["polyester", "sublimation"],
      relatedContent: [{ contentType: "material", refId: material._id }],
      status: "published",
    },
  });
  check("Journal created (201)", journalRes.status === 201, JSON.stringify(journalRes.json));
  const journal = journalRes.json?.data;

  console.log("\n5. Create a published New Arrival that links to the Portfolio project (tests REVERSE lookup)");
  const newArrivalRes = await api("POST", "/new-arrivals", {
    admin: true,
    body: {
      title: `Black & Gold Football Collection ${suffix}`,
      slug: `black-gold-football-${suffix}`,
      sport: "Football",
      productType: "Jersey Kit",
      description: "Our latest football jersey collection.",
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "New arrival" }],
      tags: ["polyester"],
      relatedContent: [{ contentType: "portfolio", refId: portfolio._id }],
      status: "published",
    },
  });
  check("New Arrival created (201)", newArrivalRes.status === 201, JSON.stringify(newArrivalRes.json));

  console.log("\n6. Fetch the Journal article's public detail page - check its related content");
  const journalDetail = await api("GET", `/journal/slug/${journal.slug}`);
  const journalRelatedTypes = (journalDetail.json?.related ?? []).map((r) => r.contentType);
  check("Journal detail loads (200)", journalDetail.status === 200);
  check(
    "Journal's related content includes the MANUALLY linked Material",
    journalRelatedTypes.includes("material"),
    `got types: ${journalRelatedTypes.join(", ")}`
  );
  check(
    "Journal's related content includes the Portfolio project via AUTO tag/sport match",
    journalRelatedTypes.includes("portfolio"),
    `got types: ${journalRelatedTypes.join(", ")}`
  );

  console.log("\n7. Fetch the Portfolio project's public detail page - check REVERSE lookup works");
  const portfolioDetail = await api("GET", `/portfolio/slug/${portfolio.slug}`);
  const portfolioRelatedTypes = (portfolioDetail.json?.related ?? []).map((r) => r.contentType);
  check("Portfolio detail loads (200)", portfolioDetail.status === 200);
  check(
    "Portfolio's related content includes the New Arrival, even though Portfolio never linked to it (reverse lookup)",
    portfolioRelatedTypes.includes("new-arrival"),
    `got types: ${portfolioRelatedTypes.join(", ")}`
  );

  console.log("\n8. Confirm public list endpoints only return published items, and admin list sees everything");
  const draftMaterialRes = await api("POST", "/materials", {
    admin: true,
    body: { name: `Draft Only ${suffix}`, slug: `draft-only-${suffix}`, status: "draft" },
  });
  check("Draft material created (201)", draftMaterialRes.status === 201);

  const publicMaterials = await api("GET", "/materials");
  const publicSlugs = (publicMaterials.json?.data ?? []).map((m) => m.slug);
  check(
    "Public materials list excludes the draft",
    !publicSlugs.includes(`draft-only-${suffix}`)
  );

  const adminMaterials = await api("GET", "/materials/admin", { admin: true });
  const adminSlugs = (adminMaterials.json?.data ?? []).map((m) => m.slug);
  check(
    "Admin materials list includes the draft",
    adminSlugs.includes(`draft-only-${suffix}`)
  );

  console.log(`\n${"=".repeat(50)}\n${passed} passed, ${failed} failed\n${"=".repeat(50)}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
