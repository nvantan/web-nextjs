function isPlainObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function deepMerge(target = {}, ...sources) {
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const key of Object.keys(source)) {
      const targetVal = target[key];
      const sourceVal = source[key];
      if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        target[key] = targetVal.concat(sourceVal);
      } else if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
        target[key] = deepMerge({ ...targetVal }, sourceVal);
      } else {
        target[key] = sourceVal;
      }
    }
  }
  return target;
}

class ApiDataFetcher {
  /**
   * @param {object} [options={}]
   * @param {string} [options.url]
   * @param {string} [options.filePath='info.json']
   * @param {object} [options.defaultAxiosConfig={}]
   * @param {function} [options.transform]
   */
  constructor({
    url,
    filePath = "info.json",
    defaultAxiosConfig = {},
    transform,
  } = {}) {
    this.url = url;
    this.filePath = filePath;
    this.defaultAxiosConfig = defaultAxiosConfig;
    this.transform = transform;
  }

  /**
   * @param {object} [fetchConfig={}]
   */
  async fetch(fetchConfig = {}) {
    try {
      const config = deepMerge({}, this.defaultAxiosConfig, fetchConfig);

      // Map axios config to fetch config
      const { headers, method = "GET", body, ...rest } = config;
      const fetchOptions = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
      };

      const response = await fetch(this.url, fetchOptions);

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const data =
        typeof this.transform === "function"
          ? this.transform(responseData)
          : responseData;
      return data;
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return { error: true, message: error.message };
    }
  }
}

export { ApiDataFetcher };
