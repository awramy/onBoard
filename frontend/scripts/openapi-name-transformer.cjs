/**
 * Shared OpenAPI transformer: конвертирует operationId.
 */

module.exports = function transformOpenApiOperationIds(openApi) {
  if (!openApi || typeof openApi !== "object") return openApi;

  const paths = openApi.paths || {};
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!isHttpMethod(method) || !operation || typeof operation !== "object")
        continue;
      try {
        const newOperationId = buildOperationId(path, method);
        if (newOperationId) operation.operationId = newOperationId;
      } catch {
        // игнорируем и сохраняем оригинальный operationId
      }
    }
  }
  return openApi;
};

function isHttpMethod(method) {
  return ["get", "post", "put", "patch", "delete"].includes(
    String(method).toLowerCase(),
  );
}

// Создаем семантичные operationId для методов (ex: GET /resource → getListResource)
function buildOperationId(path, method) {
  const segments = String(path).split("/").filter(Boolean);
  const filtered = segments.filter(
    (s) => !/^v\d+(?:\..*)?$/i.test(s) && s.toLowerCase() !== "api",
  );
  const versionSuffix = getVersionSuffix(segments);
  const nonParamSegments = filtered.filter((s) => !s.startsWith("{"));
  const pathParamSegments = filtered.filter((s) => s.startsWith("{"));

  const endsWithParam =
    filtered.length > 0 && filtered[filtered.length - 1].startsWith("{");

  let resourceParts = nonParamSegments;
  if (resourceParts.length === 0 && pathParamSegments.length) {
    resourceParts = [
      pathParamSegments[pathParamSegments.length - 1]
        .replace(/[{}]/g, "")
        .replace(/Id$/i, ""),
    ];
  }

  const baseResource = pascalCase(resourceParts.join("-"));

  const http = String(method).toLowerCase();
  let actionPrefix = http;
  let shouldPluralize = false;

  if (http === "get") {
    if (endsWithParam) {
      actionPrefix = "get";
    } else {
      actionPrefix = "getList";
      shouldPluralize = true;
    }
  }

  const resourceName = shouldPluralize ? pluralize(baseResource) : baseResource;

  return `${actionPrefix}${resourceName}${versionSuffix}`;
}

function getVersionSuffix(segments) {
  try {
    const versionSeg = (segments || []).find((s) =>
      /^v\d+(?:\..*)?$/i.test(String(s || "")),
    );
    if (!versionSeg) return "";
    const match = String(versionSeg).match(/^v(\d+)/i);
    if (!match || !match[1]) return "";
    const major = match[1];
    if (major === "1") return "";
    return "V" + major;
  } catch {
    return "";
  }
}

function pascalCase(input) {
  return String(input)
    .replace(/[{}]/g, "")
    .split(/[^a-zA-Z0-9]+|_/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function pluralize(name) {
  if (!name) return name;
  if (/s$/i.test(name)) return name;
  if (/y$/i.test(name)) return name.slice(0, -1) + "ies";
  return name + "s";
}