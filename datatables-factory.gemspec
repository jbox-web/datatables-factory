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

  s.files = `git ls-files`.split("\n")

  s.add_dependency 'rails', '>= 6.1'
  s.add_dependency 'zeitwerk'
end
