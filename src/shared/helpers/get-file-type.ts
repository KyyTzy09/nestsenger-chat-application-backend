export function GetMediaType(mediaName: string): "document" | "image" | "video" | "audio" | "archive" {
    let result: "document" | "image" | "video" | "audio" | "archive"
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
    else if (
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        name.endsWith(".xls") ||
        name.endsWith(".ppt") ||
        name.endsWith(".pptx") ||
        name.endsWith(".txt") ||
        name.endsWith(".md") ||
        name.endsWith(".csv") ||
        mediaName.endsWith(".rtf")
    ) {
        result = "document"
    }
    else {
        result = "archive"
    }

    return result
}
