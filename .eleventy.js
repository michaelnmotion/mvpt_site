module.exports = function (eleventyConfig) {
  // Copy assets into the output
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "static" });

  return {
    pathPrefix: "/mvpt_site/", // <-- change to your repo name
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist",
    },
    templateFormats: ["njk"],
  };
};
