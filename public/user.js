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