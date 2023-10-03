# frozen_string_literal: true

require_relative 'lib/datatables_factory/version'

Gem::Specification.new do |s|
  s.name        = 'datatables-factory'
  s.version     = DatatablesFactory::VERSION::STRING
  s.platform    = Gem::Platform::RUBY
  s.authors     = ['Nicolas Rodriguez']
  s.email       = ['nicoladmin@free.fr']
  s.homepage    = 'https://github.com/jbox-web/datatables-factory'
  s.summary     = 'A Rails engine that provides helpers for ajax-datatables-rails'
  s.license     = 'MIT'

  s.required_ruby_version = '>= 2.7.0'

  s.files = `git ls-files`.split("\n")

  s.add_runtime_dependency 'rails', '>= 6.0'
  s.add_runtime_dependency 'zeitwerk'

  s.add_development_dependency 'appraisal'
  s.add_development_dependency 'guard-rspec'
  s.add_development_dependency 'pry'
  s.add_development_dependency 'rake'
  s.add_development_dependency 'rspec-rails'
  s.add_development_dependency 'rubocop'
  s.add_development_dependency 'simplecov'
  s.add_development_dependency 'sqlite3', '~> 1.4.0'
end
