# frozen_string_literal: true

require_relative 'lib/datatables_factory/version'

Gem::Specification.new do |s|
  s.name        = 'datatables-factory'
  s.version     = DatatablesFactory::VERSION::STRING
  s.platform    = Gem::Platform::RUBY
  s.authors     = ['Nicolas Rodriguez']
  s.email       = ['nico@nicoladmin.fr']
  s.homepage    = 'https://github.com/jbox-web/datatables-factory'
  s.summary     = 'A Rails engine that provides helpers for ajax-datatables-rails'
  s.license     = 'MIT'

  s.required_ruby_version = '>= 3.0.0'

  # Ship only what the library needs at runtime: `git ls-files` also dragged in
  # the dummy app's vendored jQuery/Bootstrap/DataTables assets (~900 KB).
  s.files = Dir['lib/**/*.rb', 'config/locales/*.yml', 'dist/js/*.js'] +
            %w[LICENSE README.md]

  s.add_dependency 'rails', '>= 7.2'
  s.add_dependency 'zeitwerk'
end
