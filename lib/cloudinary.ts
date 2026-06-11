import { v2 as cloudinary } from "cloudinary";

// Configuracion
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Subida de imagen y regresa URL segura
export async function uploadImage(
    file: string, // Base64
    folder: string = "ecommerce/products"
) : Promise<string> {
    const result = await cloudinary.uploader.upload(file, {
        folder,
        // Transformación automatica
        transformation: [
            { width: 200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
        ],
    });

    return result.secure_url;
}

// Elimina una imagen por su public_id
export async function deleteImage(
    imageUrl: string
) : Promise<void> {
    // Extrar el public_id desde URL
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;