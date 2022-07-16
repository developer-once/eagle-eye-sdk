/**
 * --- 通过元素找到唯一定位 ---
 * @param { Any } element
 * @returns Object { id, type } String String
 */
export const getDomUniqueId = (element: any) => {
  if (!element) {
    return {};
  }
  let result = {
    id: "",
    type: "",
  };
  let className = "";
  let target = {
    id: element.id,
    name: element.name,
    className: "",
    tag: element.tagName.toLowerCase(),
    type: element.type ? element.type.toLowerCase() : "",
    classList: element.classList || [],
  };
  element.classList.forEach((item: any) => {
    // 过滤非法 class 名称
    if (/^[a-zA-Z]/.test(item)) {
      className += "." + item;
    }
  });
  target.className = className;

  if (target.tag === "body" || target.tag === "html") {
    result.id = target.tag;
    result.type= target.tag;
  }

  // 如果有 ID 则返回 ID
  if (target.id && document.getElementById(target.id) === element) {
    const queryTag = target.tag + "#" + target.id;
    try {
      const queryResult = document.querySelector(queryTag);
      if (queryResult === element) {
        result.id = queryTag;
      }
    } catch (e) {
      return 
    }
    result.type = "getElementById";
  }

  // 如果没有 ID 但可以通过 Name 找到则返回
  if (!result.id && target.name && document.getElementsByName(target.name)[0] === element) {
    result.id = target.name;
    result.type = "getElementsByName";
  }

  // 如果没有 ID 但可以通过 className querySelector 找到
  if (!result.id && className && document.querySelector(target.tag + className) === element) {
    result.id = target.tag + className;
    result.type = "querySelector";
  }

  // 单独处理 radio
  if (!result.id && target.type === "radio") {
    let value = element.value;
    let queryString = target.tag + "[value='" + value + "']";
    if (target.name) {
      queryString += "[name='" + target.name + "']";
    }
    if(document.querySelector(queryString) === element) {
      result.id = queryString;
      result.type = "querySelector";
    }
  }

  // 单独处理 a 标签
  if (!result.id && target.tag === 'a') {
    let href = element.attributes.href?.value;
    if (href) {
      let queryString = "a[href='" + href + "']";
      let selectedEl = document.querySelector(queryString);
      if(selectedEl===element) {
        result.id = queryString;
        result.type = "querySelector";
      }
    }
  }
  
  // 没有 ID 尝试组合查询 tag, class, name
  if (!result.id) {
    let queryString = target.tag;
    queryString = className ? queryString + className : queryString;
    queryString = target.name ? queryString + "[name='" + target.name + "']" : queryString;
    if(document.querySelector(queryString) === element) {
      result.id = queryString;
      result.type = "querySelector";
    }
  }

  // 没有 ID 尝试通过 order 找到
  if (!result.id) {
    let queryString = target.tag;
    queryString = className ? queryString + className : queryString;

    let elements = document.querySelectorAll(queryString);
    if(elements && elements.length > 0) {
      let index = null;
      for(let i = 0; i < elements.length; i++) {
        if(element === elements[i]) {
          index = i + 1;
          break;
        }
      }
      if (index) {
        queryString = queryString + ":nth-child(" + index + ")";
        if (document.querySelector(queryString) === element) {
          result.id = queryString;
          result.type = "querySelector";
        }
      }
    }
  }

  return result;
};

/**
 * --- 判断是否是 IE 浏览器 ---
 * @returns boolean
 */
export const isIE = () => {
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    return true;
  } else {
    return false;
  }
}

/**
 * --- 生成唯一 uuid ---
 * @returns String
 */
export const generateUUID = () => {
  var time = new Date().getTime();

  if (window.performance && typeof window.performance.now === "function") {
    // use high-precision timer if available
    time += performance.now();
  }
  
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (time + Math.random() * 16) % 16 | 0;
    time = Math.floor(time / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
};

/**
 * --- 返回 URL 信息 ---
 * @returns Url
 */
export const getPageUrl = (noParam?: boolean) => {
  if (noParam) {
    return window?.location?.href?.split("?")[0] || "";
  }
  return window?.location?.href;
};