function setCookie(name: string, value: string, daysToLive: number) {
    let cookie = name + "=" + encodeURIComponent(value);
    cookie += "; max-age=" + (daysToLive*24*60*60);
    document.cookie = cookie;
}

function getCookie(name: string) {
    const cookies = document.cookie.split(";");
    const c = cookies.map(cookie => cookie.split("=")).find(([n, value]) => name === n)

    if (c){
        return decodeURIComponent(c[1]);
    }

    return null;
}

export function getSession(): [string | null, string] {
    const sessionId = getCookie('sessionId') ||  createSessionId();
    const userId = getCookie('userName');

    return [userId, sessionId];
}

export function setName(name: string, sessionId: string) {
    setCookie('userName', name, 365);
    setCookie('sessionId', sessionId, 30);
    return getSession();
}

function createSessionId() {
   return 'xxxxx-xxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}