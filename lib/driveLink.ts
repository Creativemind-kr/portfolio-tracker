// Recognizes Google Drive share links and produces an embeddable preview URL.
// Returns null for anything else so the UI can fall back to a plain link card
// (most other services block iframe embedding via X-Frame-Options anyway).
export function getDrivePreviewUrl(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith("drive.google.com") && !url.hostname.endsWith("docs.google.com")) {
    return null;
  }

  // https://drive.google.com/file/d/<id>/view
  const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  // https://drive.google.com/drive/folders/<id>
  const folderMatch = url.pathname.match(/\/drive\/folders\/([^/]+)/);
  if (folderMatch) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}`;
  }

  // https://drive.google.com/open?id=<id>  or  ?id=<id>
  const idParam = url.searchParams.get("id");
  if (idParam) {
    return `https://drive.google.com/file/d/${idParam}/preview`;
  }

  // https://docs.google.com/{document,spreadsheets,presentation}/d/<id>/...
  const docsMatch = url.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
  if (docsMatch) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;
  }

  return null;
}
