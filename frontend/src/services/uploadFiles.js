import { API_BASE } from "../config/appData";

export async function uploadFiles(fileList) {
  const files = Array.from(fileList || []);

  if (!files.length) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to upload files.");
  }

  return data.files || [];
}
