module.exports = function (eleventyConfig) {
  // Copy assets + static files into the OUTPUT ROOT (so links like "styles.css" work)
  eleventyConfig.addPassthroughCopy({ "src/assets": "." });
  eleventyConfig.addPassthroughCopy({ "src/static": "." });

  return {
    // pathPrefix is only needed if you use Eleventy's `url` filter.
    // Your site uses relative links, so this can be "" for custom domain.
    pathPrefix: "",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist",
    },
    templateFormats: ["njk"],
  };
};
