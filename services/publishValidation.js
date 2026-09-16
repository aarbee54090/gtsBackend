// Schema-level "required" is kept minimal (title/slug only) so saving a
// draft never fails on an incomplete document. Real content-completeness
// is enforced here, and only checked at the moment status is set to
// "published" - editing/saving a draft is always unrestricted.
const PUBLISH_REQUIREMENTS = {
  portfolio: (doc) => Boolean(doc.description && doc.finalImages?.length > 0 && doc.organizationName),
  journal: (doc) => Boolean(doc.content && doc.excerpt),
  "new-arrival": (doc) => Boolean(doc.description && doc.images?.length > 0),
  material: (doc) => Boolean(doc.description),
};

class PublishValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PublishValidationError";
  }
}

// Call this right before saving/updating, with the content type and the
// merged (incoming + existing) document data. Throws only when trying to
// publish something that isn't actually ready.
function assertReadyToPublish(contentType, doc) {
  if (doc.status !== "published") return;
  const check = PUBLISH_REQUIREMENTS[contentType];
  if (check && !check(doc)) {
    throw new PublishValidationError(
      `Cannot publish this ${contentType}: required fields are missing (see publishValidation.js for the checklist).`
    );
  }
}

module.exports = { assertReadyToPublish, PublishValidationError };
