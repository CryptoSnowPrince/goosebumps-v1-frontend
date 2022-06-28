export class Requester {
  static getAsync(urlPath, params) {
    if (params !== undefined && params != null) {
      urlPath += "?" + new URLSearchParams(params);
    }

    return fetch(urlPath, {
      method: "GET",
      // credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json().then((j) => j));
  }
  static postAsync(urlPath, params, data) {
    if (params !== undefined && params != null) {
      urlPath += "?" + new URLSearchParams(params);
    }

    return fetch(urlPath, {
      method: "POST",
      // credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => response.json().then((j) => j));
  }
}
