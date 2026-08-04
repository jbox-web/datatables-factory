# frozen_string_literal: true

require 'rails_helper'

# Twin of the DataTables guard: the suite runs against JQ_VERSION=3 and 4, and
# this proves the requested major is the one actually executing in the browser.
# Without it a green jQuery 4 run could just be jQuery 3 under another name.
RSpec.describe 'jQuery version selection', :js do
  let(:expected) { ENV.fetch('JQ_VERSION', '3') }

  before { visit '/basic' }

  it 'loads the jQuery major version requested through JQ_VERSION' do
    expect(page).to have_css('#basic-datatable_wrapper', wait: 5)
    expect(page).to have_css("body[data-jquery-version='#{expected}']")

    runtime_version = page.evaluate_script('window.jQuery.fn.jquery')
    expect(runtime_version.split('.').first).to eq(expected)
  end

  # The APIs the library used to call. Asserting they are gone under jQuery 4 is
  # what makes the run a real regression test for the $.trim removal: a shim,
  # or jQuery Migrate slipping in, would put them back and quietly restore the
  # old behaviour the rest of the suite is supposed to be proving we live without.
  it 'runs without the APIs jQuery 4 removed' do
    expect(page).to have_css('#basic-datatable_wrapper', wait: 5)

    removed = page.evaluate_script(
      "['trim', 'isArray', 'isFunction', 'isNumeric', 'parseJSON', 'now', 'type']" \
      '.filter(function(name) { return typeof window.jQuery[name] === "function" })'
    )

    if expected == '4'
      expect(removed).to be_empty
    else
      expect(removed).not_to be_empty
    end
  end
end
