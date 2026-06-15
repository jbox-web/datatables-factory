# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Checkboxes datatable', type: :system, js: true do
  before do
    3.times { |i| User.create!(first_name: "User#{i}", last_name: "Last#{i}", email: "user#{i}@chk.com", role: :user, age: 20 + i) }
  end

  it 'shows the checkbox column header' do
    visit '/checkboxes'
    expect(page).to have_css('#checkboxes-datatable_wrapper', wait: 5)
    expect(page).to have_css('thead input[type="checkbox"]', wait: 5)
  end

  it 'shows rows in the table' do
    visit '/checkboxes'
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
  end
end
