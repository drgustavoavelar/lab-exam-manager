/**
 * Upload de arquivo para S3
 */
export async function storagePut(
  key: string,
  file: File,
  contentType: string
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("key", key);
  formData.append("contentType", contentType);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha no upload do arquivo");
  }

  return await response.json();
}
