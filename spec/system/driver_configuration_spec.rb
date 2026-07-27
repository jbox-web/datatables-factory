# frozen_string_literal: true

require 'rails_helper'

# Rails' `driven_by :cuprite` re-registers the driver, so anything set through
# Capybara.register_driver alone is silently discarded. These examples assert the
# options actually reach the driver — without them the suite runs on Ferrum's
# defaults (10s process_timeout, js_errors off) and fails intermittently on CI.
RSpec.describe 'System test driver', :js do
  subject(:options) { Capybara.current_session.driver.options }

  it 'uses the cuprite driver' do
    expect(Capybara.current_session.driver).to be_a(Capybara::Cuprite::Driver)
  end

  it 'applies the configured process timeout' do
    expect(options[:process_timeout]).to eq(CUPRITE_DRIVER_OPTIONS[:process_timeout])
  end

  it 'allows more than Ferrum default of 10s to boot the browser' do
    expect(options[:process_timeout]).to be > 10
  end

  it 'applies the configured command timeout' do
    expect(options[:timeout]).to eq(CUPRITE_DRIVER_OPTIONS[:timeout])
  end

  it 'fails the suite on browser side JavaScript errors' do
    expect(options[:js_errors]).to be(true)
  end

  it 'applies the configured window size' do
    expect(options[:window_size]).to eq(CUPRITE_DRIVER_OPTIONS[:window_size])
  end

  it 'runs headless' do
    expect(options[:headless]).to be(true)
  end
end
