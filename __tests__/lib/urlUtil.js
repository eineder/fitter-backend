const getUploadUrlPattern = (BUCKET_NAME, username, extension) => {
  return new RegExp(
    `https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${username}/.*${
      extension || ""
    }.*`
  );
};

module.exports = getUploadUrlPattern;
