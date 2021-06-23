function setCookie(name: string, value: string) {
    window.localStorage[name] = value;
}

function getValue(name: string) {
    return window.localStorage[name]
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

export function loadCode(file: string) {
    return getValue(`code-${file}`)
}

export function saveCode(file: string, code: string) {
    return setCookie(`code-${file}`, code);
}

function createSessionId() {
   return 'xxxxx-xxxxx-xxxxx-xxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}