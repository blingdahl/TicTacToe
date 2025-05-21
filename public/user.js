export function getOrCreateUserID() {
  const url = new URL(window.location.href);
  let userid = url.searchParams.get('userid');
  if (!userid) {
    userid = crypto.randomUUID();
    url.searchParams.set('userid', userid);
    window.location.replace(url.toString());
  }
  return userid;
}

export function getGameID() {
  const url = new URL(window.location.href);
  return url.searchParams.get('gameid');
}

export function setGameID(gameid) {
  const url = new URL(window.location.href);
  url.searchParams.set('gameid', gameid);
  window.history.replaceState({}, '', url.toString());
} 