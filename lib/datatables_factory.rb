# frozen_string_literal: true

require 'zeitwerk'
loader = Zeitwerk::Loader.for_gem
ignored = "#{__dir__}/datatables-factory.rb"
loader.ignore(ignored)
loader.setup

module DatatablesFactory
  require 'datatables_factory/engine' if defined?(Rails)
end
