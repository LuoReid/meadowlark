module.exports = function (grunt) {
  ['grunt-cafe-mocha',
    'grunt-contrib-jshint',
    'grunt-exec',
    'grunt-contrib-less',
    'grunt-contrib-uglify',
    'grunt-contrib-cssmin',
    'grunt-hashres',
    'grunt-lint-pattern'].forEach(function (task) {
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
    },
    lint_pattern: {
      view_statics: {
        options: {
          rules: [
            {
              pattern: /<link [^>]*href=["'](?!\{\{static)/,
              message: 'Un-mapped static resource found in <link>.'
            },
            {
              pattern: /<script [^>]*src=["'](?!\{\{static)/,
              message: 'Un-mapped static resource found in <script>.'
            },
            {
              pattern: /<img [^>]*src=["'](?!\{\{static)/,
              message: 'Un-mapped static resource found in <img>.'
            }
          ]
        },
        files: { src: ['views/**/*.handlebars'] }
      }
    },
    css_statics: {
      options: {
        rules: [{ pattern: /url\(/, message: 'Un-mapped static found in LESS property.' }]
      },
      files:{src:['less/**/*.less']}
    }
  });
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec','lint_pattern']);
  grunt.registerTask('static', ['less', 'cssmin', 'uglify', 'hashres']);
};