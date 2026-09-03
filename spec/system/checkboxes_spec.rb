# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Checkboxes datatable', :js do
  before do
    3.times do |i|
      User.create!(first_name: "User#{i}", last_name: "Last#{i}", email: "user#{i}@chk.com", role: :user, age: 20 + i)
    end
  end

  it 'shows the checkbox column header' do
    visit '/checkboxes'
    expect(page).to have_css('#checkboxes-datatable_wrapper', wait: 5)
    expect(page).to have_css('#checkboxes-datatable thead input[type="checkbox"]', wait: 5)
  end

  it 'shows rows in the table' do
    visit '/checkboxes'
    expect(wait_for_rows('#checkboxes-datatable', count: 3)).to eq(3)
  end
end
