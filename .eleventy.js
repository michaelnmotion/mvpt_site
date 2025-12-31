module.exports = function (eleventyConfig) {
  // Copy assets straight to output root
  eleventyConfig.addPassthroughCopy({ "src/assets": "/" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["njk"]
  };
};
