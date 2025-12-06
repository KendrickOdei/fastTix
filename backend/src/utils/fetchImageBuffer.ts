import fetch from "node-fetch"

export async function fetchImageBuffer(url: string): Promise<Buffer | null>{
    try {
        const res = await fetch(url);
        if(!res.ok) return null;
        const ab = await res.arrayBuffer();
        return Buffer.from(ab)
    } catch (error) {
        console.error('fetchImageBuffer error', error)
        return null;
    }
}