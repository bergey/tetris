module.exports = function(grunt) {

  "use strict";

    var releaseBranchOptions = { app: {
        options: {
            releaseBranch: 'gh-pages',
            remoteRepository: 'origin',
            cwd: '../',
            distDir: 'purescript/dist',
            commitMessage: 'Publish via grunt-release-branch',
            commit: true,
            push: true,
            blacklist: [
                '.git'
            ]
        }
    }};

  grunt.initConfig({

    srcFiles: ["src/**/*.purs", 'bower_components/**/src/**/*.purs'],

    psc: {
      options: {
          modules: ["Main"]
      },
      all: {
        src: ["<%=srcFiles%>"],
        dest: "dist/Main.js"
      }
    },

      dotPsci: ["<%=srcFiles%>"],
      releaseBranchPre: releaseBranchOptions,
      releaseBranch: releaseBranchOptions
  });

  grunt.loadNpmTasks("grunt-purescript");
    grunt.loadNpmTasks('grunt-release-branch');

  grunt.registerTask("default", ["psc:all", "dotPsci"]);
    grunt.registerTask('publish', ['releaseBranchPre', 'psc:all', 'releaseBranch']);
};
