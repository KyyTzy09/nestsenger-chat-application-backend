export function GetMediaType(mediaName: string): "image" | "video" | "audio" | "file" {
    let result: "file" | "image" | "video" | "audio"
    const name = mediaName.toLowerCase()
    if (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp") ||
        name.endsWith(".bmp") ||
        name.endsWith(".tiff")) {
        result = "image"
    }
    else if (
        name.endsWith(".mp4") ||
        name.endsWith(".mkv") ||
        name.endsWith(".mov") ||
        name.endsWith(".avi") ||
        name.endsWith(".webm") ||
        name.endsWith(".flv")
    ) {
        result = "video"
    }
    else if (
        name.endsWith(".mp3") ||
        name.endsWith(".wav") ||
        name.endsWith(".flac") ||
        name.endsWith(".aac") ||
        name.endsWith(".ogg") ||
        name.endsWith(".m4a")
    ) {
        result = "audio"
    }
    else {
        result = "file"
    }

    return result
}
