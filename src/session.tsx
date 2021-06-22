export function setCookie(name: string, value: string, daysToLive: number) {
  let cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  cookie += "; max-age=" + (daysToLive*24*60*60);
  cookie += "; SameSite=strict";
  document.cookie = cookie;
}

export function getCookie(name: string) {
  name = encodeURIComponent(name);
    const cookies = document.cookie.split(";");
    const c = cookies.map(cookie => cookie.split("=")).find(([n, value]) => name === n.trim())

  if (c){
        return decodeURIComponent(c[1].trim());
    }

    return null;
}

export function getSession(): [string | null, string | null] {
    const sessionId = getCookie('sessionId');
    const userId = getCookie('userName');

    return [userId, sessionId];
}

export function setName(name: string): [string, string] {
  const sessionId = createSessionId();
    setCookie('userName', name, 365);
    setCookie('sessionId', sessionId, 30);
    return [name, sessionId];
}

function createSessionId() {
   return 'xxxxx-xxxxx-xxxxx-xxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}