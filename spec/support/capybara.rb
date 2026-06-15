# frozen_string_literal: true

require 'capybara/cuprite'

Capybara.register_driver(:cuprite) do |app|
  Capybara::Cuprite::Driver.new(
    app,
    window_size: [1440, 900],
    headless: true,
    browser_options: { 'no-sandbox': nil },
    timeout: 15,
    process_timeout: 30,
    pending_connection_errors: false,
    js_errors: false,
  )
end

Capybara.default_driver    = :rack_test
Capybara.javascript_driver = :cuprite
Capybara.default_max_wait_time = 5
Capybara.server = :puma, { Silent: true }
