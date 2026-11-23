import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "zwohmpjh",
  api_key: "798549833753638",
  api_secret: "ix-95Q16JsWFRuIaJXUgngrO5Ac",
  secure: true,
});

async function testUpload() {
  console.log("Testing Cloudinary upload with cloud_name: zwohmpjh...");

  try {
    // Upload local logo.jpg
    const result = await cloudinary.uploader.upload("f:\\LAXMI\\public\\logo.jpg", {
      folder: "lakshmi_agency/branding",
      public_id: "official_logo",
      overwrite: true,
    });

    console.log("SUCCESS! Cloudinary upload verified!");
    console.log("Secure URL:", result.secure_url);
    console.log("Format:", result.format);
    console.log("Bytes:", result.bytes);
  } catch (error) {
    console.error("Cloudinary test failed:", error);
  }
}

testUpload();
