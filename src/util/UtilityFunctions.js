export const createBlobUrl = (data) => {
    const blob = new Blob([data], {type: "audio/mp3"})
    const url = window.URL.createObjectURL(blob)
    return url
}