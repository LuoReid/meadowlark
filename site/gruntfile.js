module.exports = function (grunt) {
  ['grunt-cafe-mocha', 'grunt-contrib-jshint', 'grunt-exec', 'grunt-contrib-less',

    'grunt-contrib-uglify', 'grunt-contrib-cssmin', 'grunt-hashres'].forEach(function (task) {
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
        options: {
          customFunctions: {
            static: function (lessObject, name) {
              return `url("${require('./lib/static.js').map(name.value)}")`;
            }
          }
        },
        files: {
          'public/css/main.css': 'less/main.less',
          'public/css/cart.css': 'less/cart.css'
        }
      }
    },
    uglify: {
      all: { files: { 'public/js/meadowlark.min.js': ['public/js/**/*.js'] } }
    },
    cssmin: {
      combine: {
        files: {
          'public/css/meadowlark.css': ['public/css/**/*.css', '!public/css/meadowlark*.css']
        }
      },
      minify: {
        src: 'public/css/meadowlark.css',
        dest: 'public/css/meadowlark.min.css',
      }
    },
    hashres: {
      options: {
        fileNameFormat: `${name}.${hash}.${ext}`
      },
      all: {
        src: ['public/js/meadowlark.min.js', 'public/css/meadowlark.min.js'],
        dest: ['config.js'],
      }
    }
  });
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
  grunt.registerTask('static',['less','cssmin','uglify','hashres']);
};