export function generateFileSize(size: number): string {
    const fileSizeKB = (size / 1024)
    const fileSizeMB = (size / 1024 / 1024)
    const fileSizeGB = (size / 1024 / 1024 / 1024)

    const result = fileSizeGB >= 1 ? fileSizeGB.toFixed(2) + " GB" : fileSizeMB >= 1 ? fileSizeMB.toFixed(2) + " MB" : fileSizeKB.toFixed(2) + " KB"
    return result
}