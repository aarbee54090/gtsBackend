// Server-side fallback slug generation. The admin UI auto-fills+lets the
// admin edit the slug client-side; this only kicks in if a request arrives
// without one (defense in depth, e.g. a direct API call).
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = slugify;
