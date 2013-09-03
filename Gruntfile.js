/* jshint browser: false, devel: false, node: true */
module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			dist: {
				src: ['Gruntfile.js', 'src/scripts/**/*.js']
			}
		},

		clean: {
			dist: {
				src: ['dist']
			},
			temp: {
				src: ['.temp']
			}
		},

		ngtemplates: {
			dist: {
				options: {
					base: 'src/components',
					prepend: 'components/',
					module: 'charts',
					concat: 'dist'
				},
				src: ['src/components/**/*.html'],
				dest: '.temp/templates.js'
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/scripts/**/*.js', 'src/components/**/*.js'],
				dest: 'dist/js/<%= pkg.name %>.js'
			}
		},

		sass: {
			options: {
				style: 'expanded',
				lineNumbers: true
			},
			dist: {
				src: ['src/styles/main.scss'],
				dest: 'dist/css/<%= pkg.name %>.css'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.title %> <%= pkg.version %> (built on <%= grunt.template.today() %>) */\n'
			},
			dist: {
				src: ['<%= concat.dist.dest %>'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},

		cssmin: {
			options: {
				banner: '/*! <%= pkg.title %> <%= pkg.version %> (built on <%= grunt.template.today() %>) */'
			},
			dist: {
				src: ['<%= sass.dist.dest %>'],
				dest: 'dist/css/<%= pkg.name %>.min.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('compile', ['clean', 'ngtemplates', 'concat', 'sass', 'clean:temp']);
	grunt.registerTask('minify', ['uglify', 'cssmin']);

	grunt.registerTask('build', ['test', 'compile', 'minify']);

	grunt.registerTask('default', 'build');
};
