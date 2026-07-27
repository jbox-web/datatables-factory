# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'

# Must be loaded before the engine code it measures.
require 'simplecov'
require 'simplecov_json_formatter'

SimpleCov.start do
  enable_coverage :branch
  formatter SimpleCov::Formatter::MultiFormatter.new([SimpleCov::Formatter::HTMLFormatter, SimpleCov::Formatter::JSONFormatter])
  skip '/spec/'
  cover 'lib/**/*.rb'
end

require File.expand_path('dummy/config/environment', __dir__)
require 'rspec/rails'
require 'capybara/rspec'

Dir[File.join(__dir__, 'support', '**', '*.rb')].each { |f| require f }

RSpec.configure do |config|
  config.use_transactional_fixtures = false
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  # Options must go through driven_by: Rails re-registers the :cuprite driver
  # and would otherwise drop everything set in spec/support/capybara.rb.
  config.before(:each, type: :system) do
    # screen_size is driven_by's own knob and wins over options[:window_size].
    # deep_dup: driven_by mutates the hash it is given.
    driven_by :cuprite,
              screen_size: CUPRITE_DRIVER_OPTIONS[:window_size],
              options:     CUPRITE_DRIVER_OPTIONS.deep_dup
  end
end
