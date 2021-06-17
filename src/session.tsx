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

export function getSession() {

}