gem 'sass', '=3.1.4'
require 'sass'
require 'app'

module Builder
  class CSSMaker
    @@css_filename = 'base.scss'

    def initialize(settings)
      if !settings[:style_dir]
        raise "CSSMaker requires a style_dir"
      end

      mulberry_dir = settings.has_key?(:mulberry_dir) ? settings[:mulberry_dir] : Mulberry::Framework::Directories.javascript
      mulberry_base = File.join(mulberry_dir, @@css_filename)

      style_dir = settings[:style_dir]
      style_base = File.join(style_dir, @@css_filename)

      sass_settings = {
        :syntax => :scss,
        :style => :expanded,
        :line_numbers => true,
        :full_exception => false,
        :quiet => false,
        :load_paths => [ mulberry_dir, style_dir ]
      }

      data = load_dependencies(settings, style_base)
      create_engine(data, sass_settings)
    end

    def render
      @engine.render
    end

    private
    def load_dependencies(settings, style_base)
      scss_data = ''

      style_base_contents = File.read(style_base)

      settings[:overrides].each do |k, v|
        style_base_contents.gsub!("@import '#{k.to_s}';", v)
      end if settings[:overrides]

      scss_data << style_base_contents

      if settings[:postscript]
        scss_data << settings[:postscript]
      end

      scss_data
    end

    def create_engine(scss_data, sass_settings)
      @engine = Sass::Engine.new(scss_data, sass_settings)
    end
  end
end
