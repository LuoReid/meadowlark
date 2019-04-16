module.exports = function (grunt) {
  ['grunt-cafe-mocha', 'grunt-contrib-jshint', 'grunt-exec'].forEach(function (task) {
    grunt.loadNpmTasks(task);
  });
  grunt.initConfig({
    cafemocha: { all: { src: 'qa/test-*.js', options: { id: 'tdd' }, }, },
    jshint: {
      app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
      qa: ['gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
    },
    exec: { linkchecker: { cmd: 'linkchecker http://localhost:3000' } }
  });
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};