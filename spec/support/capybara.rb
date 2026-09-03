# frozen_string_literal: true

require 'capybara/cuprite'

# Rails' `driven_by :cuprite` re-registers the driver itself and discards any
# earlier Capybara.register_driver(:cuprite). These options are therefore passed
# explicitly through driven_by (see rails_helper.rb) — defining them only here
# would be silently ignored and the suite would run on Ferrum's defaults.
#
# process_timeout is deliberately generous: CI runs several jobs in parallel and
# Chrome regularly needs more than the 10s default to hand back its websocket
# URL, which surfaced as an intermittent Ferrum::ProcessTimeoutError.
CUPRITE_DRIVER_OPTIONS = {
  window_size:               [1440, 900],
  headless:                  true,
  browser_options:           { 'no-sandbox': nil },
  timeout:                   30,
  process_timeout:           60,
  pending_connection_errors: false,
  js_errors:                 true,
}.freeze

Capybara.register_driver(:cuprite) do |app|
  Capybara::Cuprite::Driver.new(app, **CUPRITE_DRIVER_OPTIONS)
end

Capybara.default_driver    = :rack_test
Capybara.javascript_driver = :cuprite
# Generous on purpose: CI runs six matrix jobs in parallel, and a server-side
# draw that normally takes milliseconds can take seconds on a loaded runner.
Capybara.default_max_wait_time = 10
Capybara.server = :puma, { Silent: true }
