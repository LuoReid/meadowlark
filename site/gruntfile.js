module.exports = function (grunt) {
  ['grunt-cafe-mocha', 'grunt-contrib-jshint', 'grunt-exec', 'grunt-contrib-less'].forEach(function (task) {
    grunt.loadNpmTasks(task);
  });
  grunt.initConfig({
    cafemocha: { all: { src: 'qa/test-*.js', options: { id: 'tdd' }, }, },
    jshint: {
      app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
      qa: ['gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
    },
    exec: { linkchecker: { cmd: 'linkchecker http://localhost:3000' } },
    less: {
      development: {
        options:{
          customFunctions:{
            static:function(lessObject,name){
              return `url("${require('./lib/static.js').map(name.value)}")`;
            }
          }
        },
        files: {
          'public/css/main.css': 'less/main.less',
        }
      }
    }
  });
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec','less']);
};