function setCookie(name: string, value: string, daysToLive: number) {
  let cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  cookie += "; max-age=" + (daysToLive*24*60*60);
  cookie += "; SameSite=strict";
  document.cookie = cookie;
}

function getCookie(name: string) {
  name = encodeURIComponent(name);
    const cookies = document.cookie.split(";");
    const c = cookies.map(cookie => cookie.split("=")).find(([n, value]) => name === n.trim())

  if (c){
        return decodeURIComponent(c[1].trim());
    }

    return null;
}

interface Session {
    name: string | null,
    sessionId: string | null,
    group: string | null,
}

export function loadSession(): Session {
    return {
        name: null,
        sessionId: createSessionId(),
        group: null,
    }
}

export function saveName(name: string) {
    setCookie('name', name, 365);
}

export function loadCode(file: string) {
    return getCookie(`code-${file}`)
}

export function saveCode(file: string, code: string) {
    return setCookie(`code-${file}`, code, 365);
}

function createSessionId() {
   return 'xxxxx-xxxxx-xxxxx-xxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}