# frozen_string_literal: true

require 'rails_helper'

# The whole suite runs twice (DT_VERSION=2 and DT_VERSION=3). This spec is the
# guard: it proves the requested bundle is the one actually executing in the
# browser, so a green run really covers the major version it claims to.
RSpec.describe 'DataTables bundle selection', :js do
  it 'loads the DataTables major version requested through DT_VERSION' do
    expected = ENV.fetch('DT_VERSION', '2')

    visit '/basic'
    expect(page).to have_css('#basic-datatable_wrapper', wait: 5)

    expect(page).to have_css("body[data-dt-version='#{expected}']")

    runtime_version = page.evaluate_script('window.jQuery.fn.dataTable.version')
    expect(runtime_version.split('.').first).to eq(expected)
  end
end
