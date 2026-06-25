# frozen_string_literal: true

# require external dependencies
require 'zeitwerk'

# load zeitwerk
Zeitwerk::Loader.for_gem.tap do |loader|
  loader.ignore("#{__dir__}/datatables-factory.rb")
  loader.setup
end

module DatatablesFactory
  require_relative 'datatables_factory/engine' if defined?(Rails)
end
